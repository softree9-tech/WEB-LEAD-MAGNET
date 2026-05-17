import os
import sys
import asyncio

# CRITICAL: This must happen before ANY other imports that might start a loop
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
import json
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from graph import graph_app
from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from core.models import BattleCardResult
from core.security import is_safe_url

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

class LeadInput(BaseModel):
    name: str
    email: str
    company: str
    role: str
    website: str

class LeadList(BaseModel):
    leads: List[LeadInput]

class BattleInput(BaseModel):
    primary_website: str
    competitor_website: str

@app.post("/api/process/single")
def process_single_lead(lead: LeadInput):
    if not is_safe_url(lead.website):
        raise HTTPException(status_code=400, detail="Invalid or unsafe website URL")

    initial_state = {
        "raw_name": lead.name,
        "raw_email": lead.email,
        "raw_company": lead.company,
        "raw_role": lead.role,
        "raw_website": lead.website
    }
    
    try:
        final_state = graph_app.invoke(initial_state)
        return final_state.get("output_row", {})
    except Exception as e:
        print(f"❌ Error in process_single_lead: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during lead processing")

async def _process_one_lead(initial_state: dict, label: str) -> dict:
    """Process a single lead inside the semaphore-limited thread pool."""
    async with _semaphore:
        try:
            print(f"⚡ Starting parallel processing: {label}")
            final_state = await asyncio.to_thread(graph_app.invoke, initial_state)
            print(f"✅ Finished: {label}")
            return final_state.get("output_row", {})
        except Exception as e:
            print(f"❌ Error processing {label}: {e}")
            return {"error": "Error during parallel processing", "identifier": label}

@app.post("/api/process/batch")
async def process_batch_leads(payload: LeadList):
    tasks = []
    for lead in payload.leads:
        if not is_safe_url(lead.website):
            continue # Skip unsafe URLs in batch

        initial_state = {
            "raw_name": lead.name,
            "raw_email": lead.email,
            "raw_company": lead.company,
            "raw_role": lead.role,
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
        raise HTTPException(status_code=400, detail="Invalid or unsafe website URL in battle analysis")

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
        llm = ChatGoogleGenerativeAI(
            model="gemini-3.1-flash-lite-preview", 
            temperature=0,
            api_key=os.environ.get("GEMINI_API_KEY")
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
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process/csv")
async def process_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
        
    try:
        print(f"--- Received CSV file: {file.filename} ---")
        df = pd.read_csv(file.file)
        print(f"--- CSV loaded successfully. Rows: {len(df)} ---")
        print(f"--- ⚡ Parallel processing enabled (max {MAX_CONCURRENT_LEADS} at a time) ---")
        
        # Only website is strictly required
        if "website" not in df.columns:
            print("--- Error: 'website' column missing in CSV ---")
            raise HTTPException(status_code=400, detail="CSV must contain at least a 'website' column")
            
        tasks = []
        for i, row in df.iterrows():
            website = str(row.get("website", ""))
            if not is_safe_url(website):
                print(f"--- Skipping unsafe URL: {website} ---")
                continue

            print(f"--- Queuing row {i+1}/{len(df)}: {website} ---")
            initial_state = {
                "raw_name": str(row.get("name", "")) if "name" in df.columns else "",
                "raw_email": str(row.get("email", "")) if "email" in df.columns else "",
                "raw_company": str(row.get("company", "")) if "company" in df.columns else "",
                "raw_role": str(row.get("role", "")) if "role" in df.columns else "",
                "raw_website": website
            }
            tasks.append(_process_one_lead(initial_state, website))

        async def stream_results():
            try:
                for coro in asyncio.as_completed(tasks):
                    result = await coro
                    yield json.dumps(result) + "\n"
            except Exception as e:
                print(f"--- Error in stream_results: {e} ---")
                yield json.dumps({"error": "An error occurred during streaming"}) + "\n"

        return StreamingResponse(stream_results(), media_type="application/x-ndjson")
    except HTTPException:
        raise
    except Exception as e:
        print(f"--- Fatal error in process_csv: {e} ---")
        raise HTTPException(status_code=500, detail="Internal server error during CSV processing")

# To run the app use: uvicorn main:app --reload
