from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from db_engine import DatabaseEngine
from rag_manager import RAGManager
from sql_agent import SQLAgent
from import_manager import ImportManager
from fastapi import UploadFile, File
import os
import traceback

app = FastAPI(title="Intelligent SQL Chatbot API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, you can later restrict this to your vercel app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components (reads from .env file)
db_engine = DatabaseEngine()
rag_manager = RAGManager(db_engine)
sql_agent = SQLAgent(db_engine, rag_manager)
import_manager = ImportManager(db_engine)

class QueryRequest(BaseModel):
    query: str

class ConnectionRequest(BaseModel):
    db_url: str
    db_type: str = "postgresql"

@app.get("/")
async def root():
    return {"message": "SQL Chatbot API is running"}

@app.get("/connection-status")
async def get_connection_status():
    connected = db_engine.is_connected()
    return {
        "connected": connected,
        "db_type": db_engine.db_type,
        "db_url": db_engine.db_url if connected else None
    }

@app.post("/connect")
async def connect_db(request: ConnectionRequest):
    try:
        success = db_engine.update_connection(request.db_url, request.db_type)
        if success:
            # Re-index schema automatically on new connection
            rag_manager.index_schema()
            return {"message": "Connected successfully and schema indexed", "connected": True}
        else:
            raise HTTPException(status_code=400, detail="Failed to connect to database")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/ask")
async def ask_question(request: QueryRequest):
    try:
        if not db_engine.is_connected():
            raise HTTPException(status_code=400, detail="Database not connected. Please go to setup page.")
            
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
        if not db_engine.is_connected():
            raise HTTPException(status_code=400, detail="Database not connected.")
            
        rag_manager.index_schema()
        return {"message": "Database schema indexed successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        print("❌ CRITICAL ERROR in /index-schema:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/import")
async def import_file(file: UploadFile = File(...)):
    try:
        if not db_engine.is_connected():
            raise HTTPException(status_code=400, detail="Database not connected.")
            
        content = await file.read()
        result = await import_manager.process_and_sync(content, file.filename)
        
        if result["success"]:
            # Re-index schema automatically on new import
            rag_manager.index_schema()
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"❌ CRITICAL ERROR in /import: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
Line: 1
