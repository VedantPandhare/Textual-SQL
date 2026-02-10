from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from db_engine import DatabaseEngine
from rag_manager import RAGManager
from sql_agent import SQLAgent
import os
import traceback

app = FastAPI(title="Intelligent SQL Chatbot API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components (reads from .env file)
db_engine = DatabaseEngine()
rag_manager = RAGManager(db_engine)
sql_agent = SQLAgent(db_engine, rag_manager)

class QueryRequest(BaseModel):
    query: str

@app.get("/")
async def root():
    return {"message": "SQL Chatbot API is running"}

@app.post("/ask")
async def ask_question(request: QueryRequest):
    try:
        response = sql_agent.generate_and_execute(request.query)
        if "error" in response:
            raise HTTPException(status_code=400, detail=response["error"])
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        print("❌ CRITICAL ERROR in /ask:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/index-schema")
async def reindex_schema():
    try:
        rag_manager.index_schema()
        return {"message": "Database schema indexed successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        print("❌ CRITICAL ERROR in /index-schema:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
Line: 1
