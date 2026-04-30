import os
import sys
import asyncio

# CRITICAL: This must happen before ANY other imports that might start a loop
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from graph import graph_app
from fastapi.middleware.cors import CORSMiddleware

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
    "https://web-lead-magnet-usox.vercel.app",   # Vercel production
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

@app.post("/api/process/batch")
def process_batch_leads(payload: LeadList):
    results = []
    for lead in payload.leads:
        initial_state = {
            "raw_name": lead.name,
            "raw_email": lead.email,
            "raw_company": lead.company,
            "raw_role": lead.role,
            "raw_website": lead.website
        }
        try:
            final_state = graph_app.invoke(initial_state)
            results.append(final_state.get("output_row", {}))
        except Exception as e:
            print(f"Error processing lead {lead.email}: {e}")
            # Optionally continue or fail
            results.append({"error": str(e), "email": lead.email})
            
    return {"processed_leads": results}

@app.post("/api/process/csv")
def process_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
        
    try:
        print(f"--- Received CSV file: {file.filename} ---")
        df = pd.read_csv(file.file)
        print(f"--- CSV loaded successfully. Rows: {len(df)} ---")
        
        # Only website is strictly required
        if "website" not in df.columns:
            print("--- Error: 'website' column missing in CSV ---")
            raise HTTPException(status_code=400, detail="CSV must contain at least a 'website' column")
            
        results = []
        for i, row in df.iterrows():
            print(f"--- Processing row {i+1}/{len(df)}: {row.get('website')} ---")
            initial_state = {
                "raw_name": str(row.get("name", "")) if "name" in df.columns else "",
                "raw_email": str(row.get("email", "")) if "email" in df.columns else "",
                "raw_company": str(row.get("company", "")) if "company" in df.columns else "",
                "raw_role": str(row.get("role", "")) if "role" in df.columns else "",
                "raw_website": str(row.get("website", ""))
            }
            try:
                final_state = graph_app.invoke(initial_state)
                results.append(final_state.get("output_row", {}))
            except Exception as e:
                print(f"Error processing row {row.get('website')}: {e}")
                results.append({"error": str(e), "website": row.get("website")})
                
        return {"processed_leads": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

# To run the app use: uvicorn main:app --reload
