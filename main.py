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

@app.post("/api/process/single")
def process_single_lead(lead: LeadInput):
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
        raise HTTPException(status_code=500, detail=str(e))

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
            return {"error": str(e), "identifier": label}

@app.post("/api/process/batch")
async def process_batch_leads(payload: LeadList):
    tasks = []
    for lead in payload.leads:
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
                yield json.dumps({"error": str(e)}) + "\n"

        return StreamingResponse(stream_results(), media_type="application/x-ndjson")
    except HTTPException:
        raise
    except Exception as e:
        print(f"--- Fatal error in process_csv: {e} ---")
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

# To run the app use: uvicorn main:app --reload
