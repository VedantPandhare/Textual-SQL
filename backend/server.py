import os
import sys
from typing import Optional

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

from db import DatabaseEngine

load_dotenv()

try:
    db = DatabaseEngine()
    print(f"Connected to database: {os.getenv('DATABASE_URL', '').split('@')[-1]}")
except Exception as e:
    print(f"ERROR: Could not connect to database — {e}")
    print("Fix DATABASE_URL in backend/.env and restart.")
    sys.exit(1)

mcp = FastMCP(
    "database-mcp-server",
    instructions="""
A Model Context Protocol (MCP) server for direct database operations.
Supports PostgreSQL (including Supabase) and SQLite databases.

Schema inspection: list_tables, describe_table, get_schema
Read data:         select_rows, execute_sql
Write data:        insert_row, update_rows, delete_rows
""",
)


@mcp.tool()
def list_tables() -> list:
    """List all tables in the connected database."""
    return db.get_table_names()


@mcp.tool()
def describe_table(table_name: str) -> list:
    """
    Get columns and their data types for a specific table.

    Args:
        table_name: Name of the table to inspect.
    """
    return db.get_table_schema(table_name)


@mcp.tool()
def get_schema() -> str:
    """Get the complete schema of all tables in the database."""
    return db.get_full_schema()


@mcp.tool()
def execute_sql(sql: str) -> list:
    """
    Execute a raw SQL query and return results.

    Args:
        sql: SQL to execute (SELECT, INSERT, UPDATE, DELETE, etc.)
    """
    return db.execute_query(sql)


@mcp.tool()
def select_rows(
    table_name: str,
    columns: Optional[list] = None,
    where: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    order_by: Optional[str] = None,
    ascending: bool = True,
) -> list:
    """
    Select rows from a table with optional filtering and sorting.

    Args:
        table_name: Table to query.
        columns: Column names to return; omit for all columns.
        where: SQL WHERE clause without the WHERE keyword. E.g. "status = 'active'".
        limit: Max rows to return (default 100).
        offset: Rows to skip for pagination (default 0).
        order_by: Column to sort by.
        ascending: True for ASC, False for DESC (default True).
    """
    return db.select_rows(table_name, columns, where, limit, offset, order_by, ascending)


@mcp.tool()
def insert_row(table_name: str, data: dict) -> dict:
    """
    Insert a new row into a table.

    Args:
        table_name: Table to insert into.
        data: Object mapping column names to values.
    """
    return db.insert_row(table_name, data)


@mcp.tool()
def update_rows(table_name: str, data: dict, where: str) -> dict:
    """
    Update rows in a table matching the WHERE condition.

    Args:
        table_name: Table to update.
        data: Object mapping column names to new values.
        where: SQL WHERE clause without WHERE. E.g. "id = '123'".
    """
    return db.update_rows(table_name, data, where)


@mcp.tool()
def delete_rows(table_name: str, where: str) -> dict:
    """
    Delete rows from a table matching the WHERE condition.

    Args:
        table_name: Table to delete from.
        where: SQL WHERE clause without WHERE. E.g. "id = '123'".
    """
    return db.delete_rows(table_name, where)


if __name__ == "__main__":
    transport = sys.argv[1] if len(sys.argv) > 1 else "streamable-http"
    if transport == "stdio":
        mcp.run(transport="stdio")
    else:
        port = int(os.getenv("PORT", 8000))
        mcp.run(transport="streamable-http", host="0.0.0.0", port=port)
