import os
import sys
import asyncio

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
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
import json
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from graph import graph_app
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from core.models import BattleCardResult
from core.security import is_safe_url, validate_website

# ─── Parallel Processing Config ─────────────────────────────────────────────
# Max leads to process simultaneously. Keep low to avoid RAM/rate-limit issues.
MAX_CONCURRENT_LEADS = 3
_semaphore = asyncio.Semaphore(MAX_CONCURRENT_LEADS)

# Load environment variables (e.g., GEMINI_API_KEY)
load_dotenv()

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
    "https://web-lead-magnet-seven.vercel.app",   # Vercel production
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
    if not validation["valid"]:
        raise HTTPException(status_code=422, detail=validation["error"])
    return {"valid": True, "url": validation["url"]}


@app.post("/api/process/single")
def process_single_lead(lead: LeadInput):
    # Verify reCAPTCHA token (unless bypassed for admin dashboard tools)
    if lead.recaptcha_token != "admin_bypass":
        if not lead.recaptcha_token or not verify_recaptcha(lead.recaptcha_token):
            raise HTTPException(status_code=400, detail="reCAPTCHA verification failed")

    if not is_safe_url(lead.website):
        raise HTTPException(status_code=400, detail="Invalid or unsafe website URL")

    # ─── Strict Website Validation ──────────────────────────────────────────
    validation = validate_website(lead.website)
    if not validation["valid"]:
        print(f"🚫 Website validation failed for {lead.website}: {validation['error']}")
        raise HTTPException(status_code=422, detail=validation["error"])

    initial_state = {
        "raw_name": lead.name,
        "raw_email": lead.email,
        "raw_company": lead.company or "Unknown",
        "raw_role": lead.role or "Unknown",
        "raw_website": lead.website
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
        # Attach original contact fields for export enrichment (consistent with batch)
        result["_apollo_fields"] = apollo_fields
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


def _build_error_fallback(website: str, error_detail: str = "", apollo_fields: dict = None) -> dict:
    """Build a complete fallback result dict when a lead fails processing.
    Ensures every field the frontend expects is present with safe defaults.
    If apollo_fields is provided, it is included for CSV export enrichment."""
    fallback = {
        "website": website,
        "error_detail": error_detail,
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
        if not validation["valid"]:
            print(f"🚫 Batch: skipping {lead.website} — {validation['error']}")
            continue

        initial_state = {
            "raw_name": lead.name,
            "raw_email": lead.email,
            "raw_company": lead.company or "Unknown",
            "raw_role": lead.role or "Unknown",
            "raw_website": lead.website
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
    if not primary_val["valid"]:
        raise HTTPException(status_code=422, detail=f"Primary website: {primary_val['error']}")
    competitor_val = validate_website(payload.competitor_website)
    if not competitor_val["valid"]:
        raise HTTPException(status_code=422, detail=f"Competitor website: {competitor_val['error']}")

    primary_state = {
        "raw_name": "Primary",
        "raw_email": "",
        "raw_company": "Primary Company",
        "raw_role": "",
        "raw_website": payload.primary_website
    }
    
    competitor_state = {
        "raw_name": "Competitor",
        "raw_email": "",
        "raw_company": "Competitor Company",
        "raw_role": "",
        "raw_website": payload.competitor_website
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
            if not validation["valid"]:
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
                "raw_website": website
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

# To run the app use: uvicorn main:app --reload
