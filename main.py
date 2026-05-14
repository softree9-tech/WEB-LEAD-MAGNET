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
import io
from datetime import datetime
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from graph import graph_app
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.queue_manager import init_db, create_job, save_result, get_job_status, get_job_results, mark_job_complete

# ─── Parallel Processing Config ─────────────────────────────────────────────
# Max leads to process simultaneously. Keep low to avoid RAM/rate-limit issues.
MAX_CONCURRENT_LEADS = 3
_semaphore = asyncio.Semaphore(MAX_CONCURRENT_LEADS)

# Load environment variables (e.g., GEMINI_API_KEY)
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="LangGraph Lead Processing API",
    description="API to process leads using LangGraph and Gemini",
    version="1.0.0",
    lifespan=lifespan
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

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/process/csv-async")
async def process_csv_async(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        if "website" not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain at least a 'website' column")

        urls = df["website"].dropna().tolist()
        job_id = await create_job(urls)

        rows = []
        for _, row in df.iterrows():
            rows.append({
                "name": str(row.get("name", "")) if "name" in df.columns else "",
                "email": str(row.get("email", "")) if "email" in df.columns else "",
                "company": str(row.get("company", "")) if "company" in df.columns else "",
                "role": str(row.get("role", "")) if "role" in df.columns else "",
                "website": str(row.get("website", ""))
            })

        asyncio.create_task(_process_batch_async(job_id, rows))
        return {"job_id": job_id, "total": len(urls), "status": "running"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs/{job_id}")
async def get_job_status_endpoint(job_id: str):
    status = await get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return status

@app.get("/api/jobs/{job_id}/results")
async def get_job_results_endpoint(job_id: str):
    status = await get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    results = await get_job_results(job_id)
    return {**status, "job_id": job_id, "processed_leads": results}

@app.get("/api/jobs/{job_id}/stream")
async def stream_job_status(job_id: str):
    async def event_generator():
        last_completed = 0
        while True:
            status = await get_job_status(job_id)
            if not status:
                break

            if status["completed"] > last_completed:
                results = await get_job_results(job_id)
                # Emit only new results would be better, but for now sending all or latest
                new_results = results[last_completed:]
                for res in new_results:
                    yield f"event: result\ndata: {json.dumps(res)}\n\n"
                last_completed = status["completed"]

            yield f"event: progress\ndata: {json.dumps(status)}\n\n"

            if status["status"] == "completed":
                yield f"event: done\ndata: {json.dumps(status)}\n\n"
                break

            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

async def _process_batch_async(job_id: str, rows: list):
    semaphore = asyncio.Semaphore(20)
    loop = asyncio.get_running_loop()

    async def analyze_one(row):
        async with semaphore:
            website = row["website"]
            initial_state = {
                "raw_name": row["name"],
                "raw_email": row["email"],
                "raw_company": row["company"],
                "raw_role": row["role"],
                "raw_website": website
            }
            try:
                final_state = await loop.run_in_executor(None, graph_app.invoke, initial_state)
                await save_result(job_id, website, final_state.get("output_row", {}))
            except Exception as e:
                await save_result(job_id, website, {}, error=str(e))

    await asyncio.gather(*[analyze_one(row) for row in rows])
    await mark_job_complete(job_id)

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
