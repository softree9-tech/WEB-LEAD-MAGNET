import os
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from graph import graph_app
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables (e.g., OPENAI_API_KEY)
load_dotenv()

app = FastAPI(
    title="LangGraph Lead Processing API",
    description="API to process leads using LangGraph and OpenAI",
    version="1.0.0"
)

# Allow CORS for React frontend integration
# Set FRONTEND_URL env var on Render to your Vercel domain
_frontend_url = os.getenv("FRONTEND_URL", "")
_allowed_origins = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:4173",   # Vite preview
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
        df = pd.read_csv(file.file)
        
        # Validate columns
        required_cols = {"name", "email", "company", "role", "website"}
        if not required_cols.issubset(set(df.columns)):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {', '.join(required_cols)}")
            
        results = []
        for _, row in df.iterrows():
            initial_state = {
                "raw_name": str(row.get("name", "")),
                "raw_email": str(row.get("email", "")),
                "raw_company": str(row.get("company", "")),
                "raw_role": str(row.get("role", "")),
                "raw_website": str(row.get("website", ""))
            }
            try:
                final_state = graph_app.invoke(initial_state)
                results.append(final_state.get("output_row", {}))
            except Exception as e:
                print(f"Error processing row {row.get('email')}: {e}")
                results.append({"error": str(e), "email": row.get("email")})
                
        return {"processed_leads": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

# To run the app use: uvicorn main:app --reload
