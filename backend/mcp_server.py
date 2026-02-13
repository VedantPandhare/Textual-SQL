import asyncio
import os
from typing import Any, Dict, List, Optional
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
import mcp.types as types
from dotenv import load_dotenv

# Import your existing logic
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
) -> List[types.TextContent | types.ImageContent | types.EmbeddedResource]:
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

async def main():
    # Run the server using stdin/stdout streams
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="textual-sql-server",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main())
