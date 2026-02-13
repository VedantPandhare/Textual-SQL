import asyncio
import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List

from fastapi import FastAPI, Request
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.sse import SseServerTransport
import mcp.types as types
from dotenv import load_dotenv

# Import your existing logic
from db_engine import DatabaseEngine
from rag_manager import RAGManager
from sql_agent import SQLAgent

load_dotenv()

# Initialize existing components
# These will use environment variables (GROQ_API_KEY, DATABASE_URL)
# which are set in the cloud provider's dashboard.
db_engine = DatabaseEngine()
rag_manager = RAGManager(db_engine)
sql_agent = SQLAgent(db_engine, rag_manager)

server = Server("textual-sql-server")

@server.list_resources()
async def handle_list_resources() -> List[types.Resource]:
    """List available database resources."""
    return [
        types.Resource(
            uri="sqlite://schema",
            name="Database Schema",
            description="The full schema of the connected database, including tables and columns.",
            mimeType="text/plain",
        )
    ]

@server.read_resource()
async def handle_read_resource(uri: str) -> str:
    """Read the database schema."""
    if uri == "sqlite://schema":
        return db_engine.get_schema()
    raise ValueError(f"Unknown resource: {uri}")

@server.list_tools()
async def handle_list_tools() -> List[types.Tool]:
    """List available database tools."""
    return [
        types.Tool(
            name="query_database",
            description="Translate a natural language question into SQL and execute it against the database.",
            inputSchema={
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "The natural language question to ask the database."},
                },
                "required": ["question"],
            },
        ),
        types.Tool(
            name="execute_sql",
            description="Execute a raw SQL query directly against the database.",
            inputSchema={
                "type": "object",
                "properties": {
                    "sql": {"type": "string", "description": "The raw SQL query to execute."},
                },
                "required": ["sql"],
            },
        )
    ]

@server.call_tool()
async def handle_call_tool(
    name: str, arguments: Dict[str, Any] | None
) -> List[types.TextContent]:
    """Handle tool calls for querying or executing SQL."""
    if name == "query_database":
        question = arguments.get("question")
        if not question:
            raise ValueError("Missing 'question' argument")
        
        result = sql_agent.generate_and_execute(question)
        
        if "error" in result:
            return [types.TextContent(type="text", text=f"Error: {result['error']}")]
        
        response_text = f"SQL Generated: {result.get('sql')}\n\nResults:\n{result.get('results')}"
        return [types.TextContent(type="text", text=response_text)]

    elif name == "execute_sql":
        sql = arguments.get("sql")
        if not sql:
            raise ValueError("Missing 'sql' argument")
        
        try:
            results = db_engine.execute_query(sql)
            return [types.TextContent(type="text", text=str(results))]
        except Exception as e:
            return [types.TextContent(type="text", text=f"Error executing SQL: {str(e)}")]

    raise ValueError(f"Unknown tool: {name}")

sse = SseServerTransport("/messages")

@asynccontextmanager
async def lifespan(app: FastAPI):
    async def _run_server():
        await server.run(
            sse.read_stream,
            sse.write_stream,
            InitializationOptions(
                server_name="textual-sql-server",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

    task = asyncio.create_task(_run_server())
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

app = FastAPI(lifespan=lifespan)

@app.get("/sse")
async def handle_sse(request: Request):
    async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
        # The actual server loop is running in the background task
        # We just need to keep this connection open if needed or return
        # sse.connect_sse handles the handshake and stream management
        pass

@app.post("/messages")
async def handle_messages(request: Request):
    await sse.handle_post_message(request.scope, request.receive, request._send)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
