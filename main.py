import os
import sys
import asyncio
import io

# CRITICAL: This must happen before ANY other imports that might start a loop
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# CRITICAL: Resolve the LangGraph LangChainPendingDeprecationWarning by explicitly setting allowed_objects in Reviver
from langchain_core.load.load import Reviver
_original_reviver_init = Reviver.__init__
def _patched_reviver_init(self, *args, **kwargs):
    if len(args) < 2 and 'allowed_objects' not in kwargs:
        kwargs['allowed_objects'] = 'core'
    return _original_reviver_init(self, *args, **kwargs)
Reviver.__init__ = _patched_reviver_init

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.responses import JSONResponse, StreamingResponse
import json
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import BackgroundTasks
from graph import graph_app
from core.db import init_db, save_lead, get_leads, get_lead_by_id
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from core.models import BattleCardResult
from core.security import is_safe_url, validate_website
from core.report_generator import generate_pdf_report
from core.geo_report_generator import generate_geo_pdf_report, compute_geo_scores
from core.mailer import send_report_email

# ─── Parallel Processing Config ─────────────────────────────────────────────
# Max leads to process simultaneously. Keep low to avoid RAM/rate-limit issues.
MAX_CONCURRENT_LEADS = 2
_semaphore = asyncio.Semaphore(MAX_CONCURRENT_LEADS)

# Load environment variables (e.g., GEMINI_API_KEY)
load_dotenv()

# Initialize database
init_db()

app = FastAPI(
    title="LangGraph Lead Processing API",
    description="API to process leads using LangGraph and Gemini",
    version="1.0.0"
)

# Allow CORS for React frontend integration
# Set FRONTEND_URL env var on Render to your Vercel domain
_frontend_url = os.getenv("FRONTEND_URL", "")
_allowed_origins = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:4173",   # Vite preview
    "https://web-lead-magnet-seven.vercel.app",# Vercel production
    "https://www.softreetechnology.com",
    "https://softreetechnology.com",   
]
if _frontend_url:
    _allowed_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "running", "message": "LangGraph Lead Processing API is active"}

def verify_recaptcha(token: str) -> bool:
    if not token:
        return False
    secret_key = os.getenv("RECAPTCHA_SECRET_KEY")
    if not secret_key:
        print("⚠️ RECAPTCHA_SECRET_KEY not set in environment, failing recaptcha")
        return False
    
    url = "https://www.google.com/recaptcha/api/siteverify"
    import urllib.request
    import urllib.parse
    data = urllib.parse.urlencode({
        "secret": secret_key,
        "response": token
    }).encode("utf-8")
    
    try:
        req = urllib.request.Request(url, data=data, method="POST")
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode("utf-8"))
            return res.get("success", False)
    except Exception as e:
        print(f"❌ Error verifying reCAPTCHA: {e}")
        return False

class LeadInput(BaseModel):
    name: str
    email: str
    website: str
    recaptcha_token: str = None
    company: str = None
    role: str = None
    source: str = None

class LeadList(BaseModel):
    leads: List[LeadInput]

class BattleInput(BaseModel):
    primary_website: str
    competitor_website: str

@app.post("/api/validate")
def validate_website_endpoint(lead: LeadInput):
    """Pre-flight validation: checks DNS, HTTP accessibility, parked domains.
    Returns {valid, error, url} so the frontend can gate analysis."""
    validation = validate_website(lead.website)
    if not validation.get("valid", False):
        raise HTTPException(status_code=422, detail=validation["error"])
    return {
        "valid": True,
        "url": validation["url"],
        "warning": validation.get("warning"),
        "technical_warning": validation.get("technical_warning")
    }


def _save_lead_background(lead: LeadInput, result: dict):
    from datetime import datetime
    import os
    import json
    from core.report_generator import generate_pdf_report
    from core.geo_report_generator import generate_geo_pdf_report, compute_geo_scores
    
    source = lead.source or "Public Lead Magnet"
    domain = result.get("website", "domain").replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    pdf_bytes = None
    pdf_filename = None
    try:
        if source == 'GEO Analyzer':
            pdf_bytes = generate_geo_pdf_report(result)
            pdf_filename = f"GEO_{domain}_{timestamp}.pdf"
        else:
            pdf_bytes = generate_pdf_report(result)
            pdf_filename = f"Audit_{domain}_{timestamp}.pdf"
            
        pdf_dir = os.path.join(os.path.dirname(__file__), 'data', 'pdfs')
        os.makedirs(pdf_dir, exist_ok=True)
        pdf_path = os.path.join(pdf_dir, pdf_filename)
        
        with open(pdf_path, 'wb') as f:
            f.write(pdf_bytes)
    except Exception as e:
        print("Error generating PDF in background:", e)
        pdf_filename = None

    geo_score = 0
    visibility_score = 0
    if source == 'GEO Analyzer':
        s = compute_geo_scores(result)
        visibility_score = s.get('aiVisibility', 0)
        geo_score = visibility_score
    else:
        seo_score = int(result.get('seo_score', 0))
        visibility_score = seo_score
        geo_score = seo_score
        
    save_lead(
        name=lead.name,
        email=lead.email,
        website=lead.website,
        source=source,
        geo_score=geo_score,
        visibility_score=visibility_score,
        status="Complete",
        pdf_path=pdf_filename,
        json_data=json.dumps(result)
    )

@app.post("/api/process/single")
def process_single_lead(lead: LeadInput, background_tasks: BackgroundTasks):
    # Verify reCAPTCHA token (unless bypassed for admin dashboard tools)
    bypass_token = os.getenv("RECAPTCHA_BYPASS_TOKEN")
    is_bypass = bypass_token and lead.recaptcha_token == bypass_token

    if not is_bypass:
        if not lead.recaptcha_token or not verify_recaptcha(lead.recaptcha_token):
            raise HTTPException(status_code=400, detail="reCAPTCHA verification failed")

    if not is_safe_url(lead.website):
        raise HTTPException(status_code=400, detail="Invalid or unsafe website URL")

    # ─── Strict Website Validation ──────────────────────────────────────────
    validation = validate_website(lead.website)
    if not validation.get("valid", False):
        print(f"🚫 Website validation failed for {lead.website}: {validation['error']}")
        raise HTTPException(status_code=422, detail=validation["error"])

    initial_state = {
        "raw_name": lead.name,
        "raw_email": lead.email,
        "raw_company": lead.company or "Unknown",
        "raw_role": lead.role or "Unknown",
        "raw_website": lead.website,
        "technical_warning": validation.get("technical_warning")
    }

    # Build contact fields from form input (mirrors batch CSV apollo_fields structure)
    name_parts = (lead.name or "").strip().split(" ", 1)
    apollo_fields = {
        "First Name": name_parts[0] if name_parts[0] and name_parts[0] != "Unknown" else "",
        "Last Name": name_parts[1] if len(name_parts) > 1 and name_parts[1] != "Unknown" else "",
        "Title": lead.role if lead.role and lead.role != "Unknown" else "",
        "Company Name": lead.company if lead.company and lead.company != "Unknown" else "",
        "Email": lead.email if lead.email and lead.email != "unknown@example.com" else "",
        "Website": lead.website,
    }
    
    try:
        final_state = graph_app.invoke(initial_state)
        result = final_state.get("output_row", {})
        # Ensure critical fields always exist with safe defaults (matches _process_one_lead)
        result.setdefault("website", lead.website)
        result.setdefault("final_score", 0)
        result.setdefault("mobile_sections", [])
        result.setdefault("mobile_conversion_risk", "Moderate")
        result.setdefault("strategic_risk_level", "Moderate")
        result.setdefault("mobile_ux_rating", "Average")
        result.setdefault("design", "Unknown")
        result.setdefault("cta", "Unknown")
        result.setdefault("message", "Unknown")
        result.setdefault("trust", "Unknown")
        result.setdefault("speed", "Unknown")
        
        if validation.get("technical_warning"):
            result["technical_warning"] = validation.get("technical_warning")
            
        # Attach original contact fields for export enrichment (consistent with batch)
        result["_apollo_fields"] = apollo_fields
        
        # Trigger background save
        if lead.name or lead.email:  # Only save if it looks like a real form submission
            background_tasks.add_task(_save_lead_background, lead, result)
            
        return result
    except Exception as e:
        print(f"❌ Error in process_single_lead: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during lead processing")

async def _process_one_lead(initial_state: dict, label: str, apollo_fields: dict = None) -> dict:
    """Process a single lead inside the semaphore-limited thread pool.
    Returns a complete result dict even on failure to prevent frontend crashes.
    If apollo_fields is provided, it is injected into the result for CSV export enrichment."""
    async with _semaphore:
        try:
            print(f"⚡ Starting parallel processing: {label}")
            final_state = await asyncio.to_thread(graph_app.invoke, initial_state)
            result = final_state.get("output_row", {})
            print(f"✅ Finished: {label}")
            # Ensure critical fields always exist with safe defaults
            result.setdefault("website", initial_state.get("raw_website", label))
            result.setdefault("final_score", 0)
            result.setdefault("mobile_sections", [])
            result.setdefault("mobile_conversion_risk", "Moderate")
            result.setdefault("strategic_risk_level", "Moderate")
            result.setdefault("mobile_ux_rating", "Average")
            result.setdefault("design", "Unknown")
            result.setdefault("cta", "Unknown")
            result.setdefault("message", "Unknown")
            result.setdefault("trust", "Unknown")
            result.setdefault("speed", "Unknown")
            # Attach original Apollo/CSV contact fields for export enrichment
            if apollo_fields:
                result["_apollo_fields"] = apollo_fields
            return result
        except Exception as e:
            print(f"❌ Error processing {label}: {e}")
            # Return a COMPLETE fallback structure so the frontend never crashes
            return _build_error_fallback(initial_state.get("raw_website", label), str(e), apollo_fields=apollo_fields)


def _build_error_fallback(website: str, error_detail: str = "", apollo_fields: dict = None, technical_warning: str = None) -> dict:
    """Build a complete fallback result dict when a lead fails processing.
    Ensures every field the frontend expects is present with safe defaults.
    If apollo_fields is provided, it is included for CSV export enrichment."""
    fallback = {
        "website": website,
        "error_detail": error_detail,
        "technical_warning": technical_warning,
        "final_score": 0,
        "design": "Unknown",
        "cta": "Unknown",
        "message": "Unknown",
        "trust": "Unknown",
        "speed": "Unknown",
        "seo_meta_desc": False,
        "seo_h1": False,
        "seo_title": False,
        "seo_canonical": False,
        "seo_og": False,
        "seo_mobile": False,
        "seo_ssl": False,
        "ssl_days_remaining": 0,
        "ssl_enforced": False,
        "load_time": "0",
        "lighthouse_seo": 0,
        "lighthouse_performance": 0,
        "lighthouse_accessibility": 0,
        "mobile_performance": 0,
        "lighthouse_issues": {},
        "lighthouse_api_success": False,
        "tech_stack": "Unknown",
        "last_modified": "Unknown",
        "broken_links": [],
        "total_links": 0,
        "has_analytics": {},
        "has_lead_capture": False,
        "has_newsletter": False,
        "image_percent_missing_alt": 0,
        "has_dead_socials": False,
        "rebranding_pitch": "Analysis could not be completed for this website. Manual review recommended.",
        "first_impression_score": 0,
        "first_impression_verdict": "Unknown",
        "first_impression_explanation": "Analysis failed — unable to evaluate this website.",
        "executive_summary": "Analysis could not be completed due to a processing error.",
        "business_risk_insight": "Unable to assess — analysis failed.",
        "strategic_opportunity_insight": "Unable to assess — analysis failed.",
        "executive_ai_recommendation": "Retry analysis or perform manual review.",
        "brand_credibility_insight": "Unable to verify credibility signals.",
        "seo_score": 0,
        "seo_status": "Unable to assess.",
        "seo_improvement": "Retry analysis.",
        "aeo_score": 0,
        "aeo_status": "Unable to assess.",
        "aeo_improvement": "Retry analysis.",
        "aeo_probe_response": "",
        "has_cta": False,
        "has_duplicate_meta": False,
        "schema_data": {},
        "schema_coverage_score": 0,
        "schema_gap_insight": "",
        "schema_visibility_impact": "Low",
        "schema_recommendation": "",
        "keyword_visibility_gap_opportunities": "",
        "keyword_visibility_gap_level": "Low",
        "keyword_visibility_gap_competitor_advantage": "",
        "keyword_visibility_gap_search_impact": "Low",
        "keyword_visibility_gap_insight": "",
        "mobile_ux_rating": "Average",
        "mobile_conversion_risk": "Moderate",
        "mobile_ai_insight": "",
        "momentum_score": 0,
        "competitive_growth_status": "Steady",
        "strategic_risk_level": "Moderate",
        "momentum_comparison": "",
        "momentum_growth_direction": "Neutral",
        "momentum_ai_insight": "",
        "ai_strategic_plan": [],
        "annual_opportunity_loss": 0,
        "urgency_severity": "90+ Days",
        "revenue_impact_insight": "",
        "cta_optimization_recommendation": "",
        "conversion_improvement_suggestion": "",
        "funnel_optimization_insight": "",
        "mobile_conversion_recommendation": "",
        "lead_gen_improvement_opportunity": "",
        "conversion_intelligence_insight": "",
        "messaging_clarity_level": "Moderate",
        "communication_effectiveness_insight": "",
        "value_proposition_analysis": "",
        "messaging_strategic_recommendation": "",
        "headline_clarity_score": 0,
        "value_prop_strength_score": 0,
        "cta_communication_quality_score": 0,
        "messaging_confidence_score": 0,
        "audience_targeting_clarity_score": 0,
        "brand_communication_effectiveness_score": 0,
        "cta_strength_level": "Moderate",
        "cta_urgency_score": 0,
        "cta_visibility_rating": "Moderate",
        "cta_placement_quality": "Suboptimal",
        "cta_action_clarity_score": 0,
        "cta_persuasiveness_score": 0,
        "cta_effectiveness_insight": "",
        "cta_ai_optimization_recommendation": "",
        "lead_quality_score": 0,
        "business_maturity_level": "Unknown",
        "sales_potential": "Moderate",
        "digital_readiness": "Moderate",
        "growth_potential": "Moderate",
        "market_position_intelligence_insight": "",
        "buyer_intent_strength": "Moderate",
        "transactional_service_intent_score": 0,
        "enterprise_sales_orientation_score": 0,
        "lead_generation_focus_score": 0,
        "conversion_oriented_positioning_score": 0,
        "commercial_readiness_maturity": "Moderate",
        "primary_website_type": "informational",
        "commercial_insights": "",
        "sales_positioning_maturity_score": 0,
        "commercial_readiness_level_score": 0,
        "conversion_targeting_insight": "",
        "market_position_ai_strategic_recommendation": "",
        "trust_decay_level": "Low",
        "maintenance_confidence": 0,
        "outdated_signal_indicators": "",
        "credibility_impact_insight": "",
        "ai_trust_recommendation": "",
        "b64_image_mobile": "",
        "mobile_sections": [
            {
                "name": "Overview",
                "insight": "Analysis could not be completed for this website.",
                "risk": "Moderate",
                "b64_image": ""
            }
        ],
        "revenue_leak_amount": 0,
        "revenue_leak_severity": "Low",
        "revenue_leak_explanation": "",
        "visitors_lost": 0,
        "leads_lost": 0,
        "missing_opportunities_count": 0,
        "missing_opportunities_list": [],
        "estimated_conversion_loss_percent": 0,
        "conversion_readiness_level": "Low",
        "missing_leads_insight": "",
        "industry_insight": "",
        "conversion_elements": {},
        "industry_percentile": 0,
        "industry_tier": "Unknown",
        "industry_competitiveness": "Unknown",
        "risk": {
            "score": 0,
            "level": "Unknown"
        }
    }
    # Attach original Apollo/CSV contact fields for export enrichment
    if apollo_fields:
        fallback["_apollo_fields"] = apollo_fields
    return fallback


@app.post("/api/process/batch")
async def process_batch_leads(payload: LeadList):
    tasks = []
    for lead in payload.leads:
        if not is_safe_url(lead.website):
            continue  # Skip unsafe URLs in batch

        # ─── Strict Website Validation ──────────────────────────────────
        validation = validate_website(lead.website)
        if not validation.get("valid", False):
            print(f"🚫 Batch: skipping {lead.website} — {validation['error']}")
            continue

        initial_state = {
            "raw_name": lead.name,
            "raw_email": lead.email,
            "raw_company": lead.company or "Unknown",
            "raw_role": lead.role or "Unknown",
            "raw_website": lead.website,
            "technical_warning": validation.get("technical_warning")
        }
        tasks.append(_process_one_lead(initial_state, lead.email or lead.website))

    results = await asyncio.gather(*tasks)
    return {"processed_leads": list(results)}

@app.post("/api/process/battle")
async def process_battle(payload: BattleInput):
    """
    Runs analysis for both primary and competitor websites, then generates a comparison battle card.
    """
    if not is_safe_url(payload.primary_website) or not is_safe_url(payload.competitor_website):
        raise HTTPException(status_code=400, detail="One or both website URLs are invalid or unsafe")

    # ─── Strict Website Validation for both URLs ───────────────────────────
    primary_val = validate_website(payload.primary_website)
    if not primary_val.get("valid", False):
        raise HTTPException(status_code=422, detail=f"Primary website: {primary_val['error']}")
    competitor_val = validate_website(payload.competitor_website)
    if not competitor_val.get("valid", False):
        raise HTTPException(status_code=422, detail=f"Competitor website: {competitor_val['error']}")

    primary_state = {
        "raw_name": "Primary",
        "raw_email": "",
        "raw_company": "Primary Company",
        "raw_role": "",
        "raw_website": payload.primary_website,
        "technical_warning": primary_val.get("technical_warning")
    }
    
    competitor_state = {
        "raw_name": "Competitor",
        "raw_email": "",
        "raw_company": "Competitor Company",
        "raw_role": "",
        "raw_website": payload.competitor_website,
        "technical_warning": competitor_val.get("technical_warning")
    }

    try:
        # Run both analyses in parallel
        print(f"🚀 Starting Battle Analysis: {payload.primary_website} vs {payload.competitor_website}")
        results = await asyncio.gather(
            asyncio.to_thread(graph_app.invoke, primary_state),
            asyncio.to_thread(graph_app.invoke, competitor_state)
        )
        
        primary_data = results[0].get("output_row", {})
        competitor_data = results[1].get("output_row", {})
        
        if primary_val.get("technical_warning"):
            primary_data["technical_warning"] = primary_val.get("technical_warning")
        if competitor_val.get("technical_warning"):
            competitor_data["technical_warning"] = competitor_val.get("technical_warning")
        
        # Generate the Battle Card Comparison using AI
        llm = ChatOpenAI(
            model="gpt-4.1-mini", 
            temperature=0,
            api_key=os.environ.get("OPENAI_API_KEY")
        )
        structured_llm = llm.with_structured_output(BattleCardResult)
        
        prompt = f"""
        Compare these two website analyses and generate a Competitor Battle Card.
        
        PRIMARY WEBSITE ({payload.primary_website}):
        {json.dumps(primary_data, indent=2)}
        
        COMPETITOR WEBSITE ({payload.competitor_website}):
        {json.dumps(competitor_data, indent=2)}
        
        Compare them across: SEO score, UX score, Trust score, AI visibility, Performance, Lead capture systems, and Conversion readiness.
        Identify the winner for each category and provide an overall AI verdict.
        """
        
        battle_card = structured_llm.invoke(prompt)
        
        # Return combined result
        # We attach the battle data to the primary result so the frontend knows it's a battle mode result
        primary_data["battle_data"] = battle_card.dict()
        primary_data["competitor_data"] = competitor_data
        
        return primary_data
        
    except Exception as e:
        print(f"❌ Battle Analysis Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during battle analysis")

# ─── Dynamic Column Mapping for Apollo / Generic CSVs ─────────────────────────
# Maps logical field names to a list of possible CSV column names (lowercase).
# The first match in the uploaded CSV wins.
COLUMN_ALIASES = {
    "website":    ["website", "url", "company url", "domain", "site", "web"],
    "first_name": ["first name", "first_name", "firstname", "given name", "first"],
    "last_name":  ["last name", "last_name", "lastname", "surname", "family name", "last"],
    "email":      ["email", "email address", "contact email", "work email", "e-mail"],
    "title":      ["title", "job title", "position", "role", "designation"],
    "company":    ["company", "company name", "organization", "account name", "org"],
}


def _resolve_columns(df: pd.DataFrame) -> dict:
    """Resolve logical field names to actual DataFrame column names.
    Performs case-insensitive matching against COLUMN_ALIASES.
    Returns a dict mapping logical names -> actual column names (or None if not found).
    Raises HTTPException if 'website' cannot be resolved."""
    # Build a lowercase -> original column name lookup
    lower_to_original = {col.strip().lower(): col for col in df.columns}

    resolved = {}
    for logical, aliases in COLUMN_ALIASES.items():
        resolved[logical] = None
        for alias in aliases:
            if alias in lower_to_original:
                resolved[logical] = lower_to_original[alias]
                break

    if resolved["website"] is None:
        print(f"--- Error: No website column found. Available columns: {list(df.columns)} ---")
        raise HTTPException(
            status_code=400,
            detail=f"CSV must contain a website column. Recognized names: {', '.join(COLUMN_ALIASES['website'])}. Found: {', '.join(df.columns)}"
        )

    print(f"--- Column mapping resolved: {resolved} ---")
    return resolved


def _safe_str(value) -> str:
    """Safely convert a cell value to string, handling NaN/None."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return str(value).strip()


@app.post("/api/process/csv")
async def process_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
        
    try:
        print(f"--- Received CSV file: {file.filename} ---")
        df = pd.read_csv(file.file)
        print(f"--- CSV loaded successfully. Rows: {len(df)}, Columns: {list(df.columns)} ---")
        print(f"--- ⚡ Parallel processing enabled (max {MAX_CONCURRENT_LEADS} at a time) ---")
        
        # Flexible column resolution (case-insensitive, supports Apollo + generic CSVs)
        resolved = _resolve_columns(df)
        website_col = resolved["website"]
            
        tasks = []
        skipped_validations = []
        for i, row in df.iterrows():
            website = _safe_str(row.get(website_col, ""))
            if not website:
                print(f"--- Skipping row {i+1}: empty website ---")
                continue

            if not is_safe_url(website):
                print(f"--- Skipping row {i+1}: unsafe URL {website} ---")
                continue

            # ─── Strict Website Validation ──────────────────────────────
            validation = validate_website(website)
            if not validation.get("valid", False):
                print(f"🚫 CSV row {i+1}: {website} — {validation['error']}")
                # Collect contact fields even for failed validations
                fail_apollo = {
                    "First Name":   _safe_str(row.get(resolved["first_name"], "")) if resolved["first_name"] else "",
                    "Last Name":    _safe_str(row.get(resolved["last_name"], "")) if resolved["last_name"] else "",
                    "Title":        _safe_str(row.get(resolved["title"], "")) if resolved["title"] else "",
                    "Company Name": _safe_str(row.get(resolved["company"], "")) if resolved["company"] else "",
                    "Email":        _safe_str(row.get(resolved["email"], "")) if resolved["email"] else "",
                    "Website":      website,
                }
                fallback = _build_error_fallback(website, validation["error"], apollo_fields=fail_apollo)
                fallback["validation_failed"] = True
                skipped_validations.append(fallback)
                continue

            # Collect original contact fields for export enrichment
            apollo_fields = {
                "First Name":   _safe_str(row.get(resolved["first_name"], "")) if resolved["first_name"] else "",
                "Last Name":    _safe_str(row.get(resolved["last_name"], "")) if resolved["last_name"] else "",
                "Title":        _safe_str(row.get(resolved["title"], "")) if resolved["title"] else "",
                "Company Name": _safe_str(row.get(resolved["company"], "")) if resolved["company"] else "",
                "Email":        _safe_str(row.get(resolved["email"], "")) if resolved["email"] else "",
                "Website":      website,
            }

            print(f"--- Queuing row {i+1}/{len(df)}: {website} ---")
            initial_state = {
                "raw_name": apollo_fields["First Name"] + (" " + apollo_fields["Last Name"] if apollo_fields["Last Name"] else ""),
                "raw_email": apollo_fields["Email"],
                "raw_company": apollo_fields["Company Name"],
                "raw_role": apollo_fields["Title"],
                "raw_website": website,
                "technical_warning": validation.get("technical_warning")
            }
            tasks.append(_process_one_lead(initial_state, website, apollo_fields=apollo_fields))

        if not tasks and not skipped_validations:
            raise HTTPException(status_code=400, detail="No valid website URLs found in the CSV")

        async def stream_results():
            # First, yield all validation-failed rows immediately
            for fallback in skipped_validations:
                yield json.dumps(fallback) + "\n"

            for coro in asyncio.as_completed(tasks):
                try:
                    result = await coro
                    yield json.dumps(result) + "\n"
                except Exception as e:
                    print(f"--- Error processing one lead in stream: {e} ---")
                    # One failed lead should never crash the entire batch
                    fallback = _build_error_fallback("unknown", str(e))
                    yield json.dumps(fallback) + "\n"

        return StreamingResponse(stream_results(), media_type="application/x-ndjson")
    except HTTPException:
        raise
    except Exception as e:
        print(f"--- Fatal error in process_csv: {e} ---")
        raise HTTPException(status_code=500, detail="Internal server error during CSV processing")

class EmailReportRequest(BaseModel):
    name: str = ""
    email: str
    website: str = ""
    report_data: Dict[str, Any]

@app.post("/api/email-report")
async def email_report(req: EmailReportRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")

    print(f"--- Generating PDF report for {req.email} ---")
    
    try:
        pdf_bytes = generate_pdf_report(req.report_data)
        website_clean = req.website.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        if not website_clean:
            website_clean = "Domain"
        filename = f"Softree_AI_Audit_Report_{website_clean}.pdf"
        
        # Extract variables for email personalization
        report = req.report_data
        seo_score = report.get('seo_score', 0)
        
        # Calculate UX Score (matching PDF logic)
        consistencyVal = 90 if report.get('design') == 'Modern' else 60
        flowVal = 80 if report.get('message') == 'Clear' else 50
        mobileVal = 80 if report.get('seo_mobile') else 30
        engagementVal = 90 if report.get('cta') == 'Strong' else 40
        ux_score = round((consistencyVal + flowVal + mobileVal + engagementVal) / 4)
        
        # Calculate Trust Score (based on security/trust signals)
        trust_points = 0
        ha = report.get('has_analytics', {})
        if ha.get('google_analytics'): trust_points += 20
        if ha.get('facebook_pixel'): trust_points += 10
        if report.get('has_lead_capture'): trust_points += 20
        if report.get('has_newsletter'): trust_points += 10
        if report.get('seo_ssl'): trust_points += 25
        if report.get('seo_title'): trust_points += 15
        trust_score = trust_points

        # Top 3 findings
        findings = []
        if report.get('revenue_leak_severity') in ['High', 'Critical']:
            findings.append(f"Critical revenue leak detected: Estimated loss of ${report.get('revenue_leak_amount', 0):,}/mo.")
        if seo_score < 70:
            findings.append(f"Search visibility gaps are limiting your organic traffic (SEO Score: {seo_score}/100).")
        if ux_score < 75:
            findings.append(f"Mobile UX and conversion friction are causing visitor drop-offs.")
        if report.get('mobile_conversion_risk') in ['High', 'Critical']:
            findings.append("High mobile conversion risk is preventing active leads from engaging.")
        if not report.get('seo_ssl'):
            findings.append("Missing SSL certificate is severely impacting user trust and search rankings.")
            
        # Ensure we have exactly 3 (fallback to generic if needed)
        if len(findings) < 3:
            findings.append("Strategic opportunities exist to improve your digital authority.")
        if len(findings) < 3:
            findings.append("Competitor gap analysis reveals areas for immediate market capture.")
        if len(findings) < 3:
            findings.append("Technical optimizations can significantly enhance your baseline performance.")
            
        top_findings_html = "".join([f"<li style='margin-bottom: 8px;'>{f}</li>" for f in findings[:3]])
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1E293B; margin: 0; padding: 0; background-color: #F8FAFC;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
                <div style="background-color: #1E293B; padding: 25px 30px; border-bottom: 4px solid #FF6B35;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Softree<span style="color: #FF6B35;">Technology</span></h2>
                </div>
                
                <div style="padding: 30px;">
                    <h3 style="color: #FF6B35; margin-top: 0; font-size: 20px;">Your Website Analysis Report is Ready</h3>
                    <p style="font-size: 16px;">Hi {req.name or 'there'},</p>
                    
                    <p style="font-size: 16px;">Your automated preliminary website assessment for <strong>{req.website}</strong> is complete.</p>
                    
                    <p style="font-size: 16px;"><strong>Purpose of this Report:</strong> This report is designed to provide an initial, high-level overview of your website's public-facing performance, conversion readiness, and search visibility to help identify potential areas for improvement.</p>
                    
                    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin: 25px 0;">
                        <h4 style="margin-top: 0; color: #1E293B; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Executive Summary (Automated Metrics)</h4>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                            <tr>
                                <td width="33%" align="center" style="border-right: 1px solid #E2E8F0;">
                                    <div style="font-size: 24px; font-weight: bold; color: #1E293B;">{seo_score}</div>
                                    <div style="font-size: 12px; color: #64748B; text-transform: uppercase;">SEO Score</div>
                                </td>
                                <td width="33%" align="center" style="border-right: 1px solid #E2E8F0;">
                                    <div style="font-size: 24px; font-weight: bold; color: #1E293B;">{ux_score}</div>
                                    <div style="font-size: 12px; color: #64748B; text-transform: uppercase;">UX Score</div>
                                </td>
                                <td width="33%" align="center">
                                    <div style="font-size: 24px; font-weight: bold; color: #1E293B;">{trust_score}</div>
                                    <div style="font-size: 12px; color: #64748B; text-transform: uppercase;">Trust Score</div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <h4 style="color: #1E293B; font-size: 16px; margin-bottom: 10px;">Top 3 Strategic Findings:</h4>
                    <ul style="padding-left: 20px; color: #475569; margin-top: 0;">
                        {top_findings_html}
                    </ul>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                        <tr>
                            <td width="50%" valign="top" style="padding-right: 10px;">
                                <h4 style="color: #1E293B; font-size: 14px; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #E2E8F0; padding-bottom: 5px;">What We Reviewed</h4>
                                <ul style="padding-left: 15px; color: #64748B; font-size: 13px; margin-top: 0;">
                                    <li>Publicly accessible website content</li>
                                    <li>Page structure</li>
                                    <li>Messaging and positioning</li>
                                    <li>Basic SEO indicators</li>
                                    <li>AI visibility signals</li>
                                    <li>User experience observations</li>
                                </ul>
                            </td>
                            <td width="50%" valign="top" style="padding-left: 10px;">
                                <h4 style="color: #1E293B; font-size: 14px; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #E2E8F0; padding-bottom: 5px;">What Was Not Included</h4>
                                <ul style="padding-left: 15px; color: #64748B; font-size: 13px; margin-top: 0;">
                                    <li>Internal systems</li>
                                    <li>Source code review</li>
                                    <li>Security penetration testing</li>
                                    <li>Database analysis</li>
                                    <li>Complete multi-page website audit</li>
                                    <li>Infrastructure assessment</li>
                                </ul>
                            </td>
                        </tr>
                    </table>

                    <div style="background-color: #FFF7ED; border-left: 4px solid #FF6B35; border-radius: 4px; padding: 15px; margin: 25px 0;">
                        <p style="font-size: 13px; color: #9A3412; margin: 0;">
                            <strong>IMPORTANT DISCLOSURE:</strong> This analysis is based on an automated scan of the publicly accessible website page(s) provided and is intended as an initial assessment only. It does not constitute a full audit of your entire website, internal systems, source code, security infrastructure, or all website pages.
                        </p>
                    </div>
                    
                    <p style="font-size: 16px;">
                        A detailed PDF report is attached to this email containing our preliminary findings.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.softreetechnology.com/contact" style="background-color: #FF6B35; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Schedule a Strategy Call</a>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 30px 0;">
                    
                    <p style="font-size: 14px; margin-bottom: 5px;">Best regards,</p>
                    <p style="font-size: 14px; margin-top: 0; margin-bottom: 0;">
                        <strong style="color: #1E293B;">Softree Technology Team</strong><br>
                        <span style="color: #64748B;">Digital Intelligence & Engineering</span><br>
                        <a href="https://www.softreetechnology.com" style="color: #FF6B35; text-decoration: none;">www.softreetechnology.com</a> | 
                        <a href="mailto:sales@softreetechnology.com" style="color: #FF6B35; text-decoration: none;">sales@softreetechnology.com</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        await send_report_email(
            to_email=req.email,
            subject=f"Your Website Analysis Report: {website_clean}",
            body_html=body_html,
            pdf_bytes=pdf_bytes,
            pdf_filename=filename
        )
        print(f"--- Email successfully sent to {req.email} via Graph API ---")
        
    except Exception as e:
        print(f"--- Error generating/sending email: {e} ---")
        raise HTTPException(status_code=500, detail="Failed to send email.")

    return {"status": "success", "message": "Executive report has been delivered to your business email."}

@app.post("/api/geo/pdf-report")
async def geo_pdf_report(req: dict = Body(...)):
    # Endpoint to just generate and return the GEO PDF bytes
    print(f"--- Generating GEO PDF report ---")
    try:
        pdf_bytes = generate_geo_pdf_report(req)
        website_clean = req.get("website", "Domain").replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        filename = f"Softree_GEO_Report_{website_clean}.pdf"
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"--- Error generating GEO PDF: {e} ---")
        raise HTTPException(status_code=500, detail="Failed to generate GEO PDF report.")

@app.post("/api/geo/email-report")
async def geo_email_report(req: EmailReportRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")

    print(f"--- Generating GEO PDF report for {req.email} ---")
    
    try:
        pdf_bytes = generate_geo_pdf_report(req.report_data)
        website_clean = req.website.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        if not website_clean:
            website_clean = "Domain"
        filename = f"Softree_GEO_Report_{website_clean}.pdf"
        
        # Calculate GEO scores and metrics for email personalization
        s = compute_geo_scores(req.report_data)
        ai_score = s.get('aiVisibility', 0)
        
        # Determine highest visibility platform
        platforms = {
            'ChatGPT': s.get('chatgpt', 0),
            'Gemini': s.get('gemini', 0),
            'Claude': s.get('claude', 0),
            'Perplexity': s.get('perplexity', 0)
        }
        highest_platform = max(platforms, key=platforms.get)
        highest_score = platforms[highest_platform]
        
        # Top recommendation
        recs = s.get('recommendations', [])
        top_rec = recs[0]['title'] if recs else "Optimize entity structure for AI indexing"
        
        # Insights
        insights = []
        if ai_score < 50:
            insights.append("Your AI visibility is currently limiting your discoverability in next-generation search engines.")
        else:
            insights.append(f"Your AI visibility indicates a foundation, but there are clear optimization opportunities.")
            
        if s.get('schemaScore', 0) < 60:
            insights.append("Structured data gaps are preventing AI engines from confidently citing your brand.")
        else:
            insights.append("While basic schema is present, advanced entity linking can further strengthen your AI citations.")
            
        if platforms['ChatGPT'] < 70 or platforms['Gemini'] < 70:
            insights.append(f"Targeted optimizations are required to improve brand extraction and sentiment within {highest_platform} and other leading LLMs.")

        insights_html = "".join([f"<li style='margin-bottom: 10px; color: #475569;'>{i}</li>" for i in insights])

        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1E293B; margin: 0; padding: 0; background-color: #F8FAFC;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
                <div style="background-color: #1E293B; padding: 25px 30px; border-bottom: 4px solid #FF6B35;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Softree<span style="color: #FF6B35;">Technology</span></h2>
                </div>
                
                <div style="padding: 30px;">
                    <h3 style="color: #FF6B35; margin-top: 0; font-size: 20px;">AI Visibility & Website Assessment Report</h3>
                    <p style="font-size: 16px;">Hi {req.name or 'there'},</p>
                    
                    <p style="font-size: 16px;">Your automated preliminary Generative Engine Optimization (GEO) assessment for <strong>{req.website}</strong> is complete.</p>
                    
                    <p style="font-size: 16px;"><strong>Purpose of this Report:</strong> This report provides an initial, high-level overview of how your brand is currently understood, extracted, and cited by major AI engines (like ChatGPT and Gemini), highlighting potential areas for digital presence optimization.</p>
                    
                    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin: 25px 0;">
                        <h4 style="margin-top: 0; color: #1E293B; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Executive Summary (Automated Metrics)</h4>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                            <tr>
                                <td width="50%" align="center" style="border-right: 1px solid #E2E8F0;">
                                    <div style="font-size: 24px; font-weight: bold; color: #1E293B;">{ai_score}/100</div>
                                    <div style="font-size: 12px; color: #64748B; text-transform: uppercase;">Overall AI Visibility</div>
                                </td>
                                <td width="50%" align="center">
                                    <div style="font-size: 18px; font-weight: bold; color: #1E293B;">{highest_platform}</div>
                                    <div style="font-size: 12px; color: #64748B; text-transform: uppercase;">Highest Visibility Platform</div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <h4 style="color: #1E293B; font-size: 16px;">Key Strategic Insights:</h4>
                    <ul style="padding-left: 20px; margin-bottom: 25px; margin-top: 0;">
                        {insights_html}
                    </ul>
                    
                    <p style="font-size: 16px; background-color: #F8FAFC; padding: 15px; border-left: 4px solid #1E293B; border-radius: 4px; color: #1E293B;">
                        <strong>Top Recommendation:</strong> {top_rec}
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                        <tr>
                            <td width="50%" valign="top" style="padding-right: 10px;">
                                <h4 style="color: #1E293B; font-size: 14px; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #E2E8F0; padding-bottom: 5px;">What We Reviewed</h4>
                                <ul style="padding-left: 15px; color: #64748B; font-size: 13px; margin-top: 0;">
                                    <li>Publicly accessible website content</li>
                                    <li>Page structure</li>
                                    <li>Messaging and positioning</li>
                                    <li>Basic SEO indicators</li>
                                    <li>AI visibility signals</li>
                                    <li>User experience observations</li>
                                </ul>
                            </td>
                            <td width="50%" valign="top" style="padding-left: 10px;">
                                <h4 style="color: #1E293B; font-size: 14px; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #E2E8F0; padding-bottom: 5px;">What Was Not Included</h4>
                                <ul style="padding-left: 15px; color: #64748B; font-size: 13px; margin-top: 0;">
                                    <li>Internal systems</li>
                                    <li>Source code review</li>
                                    <li>Security penetration testing</li>
                                    <li>Database analysis</li>
                                    <li>Complete multi-page website audit</li>
                                    <li>Infrastructure assessment</li>
                                </ul>
                            </td>
                        </tr>
                    </table>

                    <div style="background-color: #FFF7ED; border-left: 4px solid #FF6B35; border-radius: 4px; padding: 15px; margin: 25px 0;">
                        <p style="font-size: 13px; color: #9A3412; margin: 0;">
                            <strong>IMPORTANT DISCLOSURE:</strong> This analysis is based on an automated scan of the publicly accessible website page(s) provided and is intended as an initial assessment only. It does not constitute a full audit of your entire website, internal systems, source code, security infrastructure, or all website pages.
                        </p>
                    </div>
                    
                    <p style="font-size: 16px;">
                        A detailed PDF report is attached to this email containing our preliminary findings.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.softreetechnology.com/contact" style="background-color: #FF6B35; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Schedule a Strategy Call</a>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 30px 0;">
                    
                    <p style="font-size: 14px; margin-bottom: 5px;">Best regards,</p>
                    <p style="font-size: 14px; margin-top: 0; margin-bottom: 0;">
                        <strong style="color: #1E293B;">Softree Technology Team</strong><br>
                        <span style="color: #64748B;">Digital Intelligence & Engineering</span><br>
                        <a href="https://www.softreetechnology.com" style="color: #FF6B35; text-decoration: none;">www.softreetechnology.com</a> | 
                        <a href="mailto:sales@softreetechnology.com" style="color: #FF6B35; text-decoration: none;">sales@softreetechnology.com</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        await send_report_email(
            to_email=req.email,
            subject=f"AI Visibility & Website Assessment: {website_clean}",
            body_html=body_html,
            pdf_bytes=pdf_bytes,
            pdf_filename=filename
        )
        print(f"--- GEO Email successfully sent to {req.email} via Graph API ---")
        
    except Exception as e:
        print(f"--- Error generating/sending GEO email: {e} ---")
        raise HTTPException(status_code=500, detail="Failed to send email.")

    return {"status": "success", "message": "Executive report has been delivered to your business email."}

@app.get("/api/leads")
def api_get_leads(date_filter: str = 'All Time', search: str = None):
    try:
        leads = get_leads(date_filter, search)
        return {"leads": leads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/leads/{lead_id}")
def api_get_lead_details(lead_id: int):
    try:
        lead = get_lead_by_id(lead_id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        # parse json
        import json
        if lead['json_data']:
            lead['json_data'] = json.loads(lead['json_data'])
        return lead
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/leads/download/{lead_id}")
def api_download_lead_pdf(lead_id: int):
    try:
        lead = get_lead_by_id(lead_id)
        if not lead or not lead.get('pdf_path'):
            raise HTTPException(status_code=404, detail="PDF not found")
            
        import os
        pdf_path = os.path.join(os.path.dirname(__file__), 'data', 'pdfs', lead['pdf_path'])
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=404, detail="PDF file missing on server")
            
        return StreamingResponse(
            open(pdf_path, "rb"),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={lead['pdf_path']}"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# To run the app use: uvicorn main:app --reload
