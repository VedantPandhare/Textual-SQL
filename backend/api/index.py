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

# Use absolute imports or ensure sys.path is correct for Vercel
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db_engine import DatabaseEngine
from rag_manager import RAGManager
from sql_agent import SQLAgent

load_dotenv()

# Initialize existing components
db_engine = DatabaseEngine()
rag_manager = RAGManager(db_engine)
sql_agent = SQLAgent(db_engine, rag_manager)

server = Server("textual-sql-server")

@server.list_resources()
async def handle_list_resources() -> List[types.Resource]:
    return [
        types.Resource(
            uri="sqlite://schema",
            name="Database Schema",
            description="The full schema of the connected database.",
            mimeType="text/plain",
        )
    ]

@server.read_resource()
async def handle_read_resource(uri: str) -> str:
    if uri == "sqlite://schema":
        return db_engine.get_schema()
    raise ValueError(f"Unknown resource: {uri}")

@server.list_tools()
async def handle_list_tools() -> List[types.Tool]:
    return [
        types.Tool(
            name="query_database",
            description="Natural language to SQL.",
            inputSchema={
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                },
                "required": ["question"],
            },
        ),
        types.Tool(
            name="execute_sql",
            description="Direct SQL execution.",
            inputSchema={
                "type": "object",
                "properties": {
                    "sql": {"type": "string"},
                },
                "required": ["sql"],
            },
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: Dict[str, Any] | None) -> List[types.TextContent]:
    if name == "query_database":
        question = arguments.get("question")
        result = sql_agent.generate_and_execute(question)
        if "error" in result:
            return [types.TextContent(type="text", text=f"Error: {result['error']}")]
        return [types.TextContent(type="text", text=f"SQL: {result.get('sql')}\n\nResults:\n{result.get('results')}")]
    elif name == "execute_sql":
        sql = arguments.get("sql")
        try:
            results = db_engine.execute_query(sql)
            return [types.TextContent(type="text", text=str(results))]
        except Exception as e:
            return [types.TextContent(type="text", text=f"Error: {str(e)}")]
    raise ValueError(f"Unknown tool: {name}")

sse = SseServerTransport("/api/mcp/messages")

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

app = FastAPI(lifespan=lifespan)

@app.get("/api/mcp/sse")
async def handle_sse(request: Request):
    async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
        pass

@app.post("/api/mcp/messages")
async def handle_messages(request: Request):
    await sse.handle_post_message(request.scope, request.receive, request._send)
