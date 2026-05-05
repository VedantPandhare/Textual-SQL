# Database MCP Server

A local [Model Context Protocol](https://modelcontextprotocol.io) server that gives Claude Desktop direct read/write access to your PostgreSQL or Supabase database.

You run it on your own machine. Claude Desktop spawns it automatically. Your database credentials never leave your computer.

---

## What it does

Once set up, you can talk to Claude in plain English and it will query your real database:

> *"Show me the last 10 orders with their totals"*
> *"How many users signed up this month?"*
> *"Insert a new product: name Widget, price 9.99"*
> *"What tables do I have?"*

Claude decides which tool to call — you just have a conversation.

---

## How it works

```
Claude Desktop  →  MCP (stdio)  →  Python server  →  Your database
```

Claude Desktop starts the Python process on launch via stdio transport (no open ports, no HTTP). The server registers 8 database tools that Claude can call during any conversation.

This is the same model used by the official Supabase MCP server and every serious database tool in Anthropic's MCP registry.

---

## Prerequisites

- Python 3.10+
- pip
- [Claude Desktop](https://claude.ai/download)
- A PostgreSQL or Supabase database (you need the connection string)

---

## Available tools

| Tool | Parameters | What it does |
|---|---|---|
| `list_tables` | — | List all tables |
| `describe_table` | `table_name` | Columns and types for a table |
| `get_schema` | — | Full schema of every table |
| `execute_sql` | `sql` | Run any SQL statement |
| `select_rows` | `table, columns?, where?, limit?, offset?, order_by?, ascending?` | SELECT with filters and pagination |
| `insert_row` | `table_name, data` | Insert one row |
| `update_rows` | `table_name, data, where` | Update rows matching a condition |
| `delete_rows` | `table_name, where` | Delete rows matching a condition |

---

## Running the HTTP server (optional)

The server can also run as a Streamable HTTP endpoint (for testing with MCP Inspector or deploying to Render):

```bash
python server.py                  # HTTP on port 8000 (default)
python server.py stdio            # stdio mode for Claude Desktop
PORT=9000 python server.py        # custom port
```

---

## Security

**Use a read-only database role for exploratory work.**  
The `execute_sql` and `delete_rows` tools can modify data. Create a restricted role so the model can only do what you allow:

```sql
-- Run in your Supabase SQL editor
CREATE ROLE readonly_mcp WITH LOGIN PASSWORD 'choose-a-password';
GRANT CONNECT ON DATABASE postgres TO readonly_mcp;
GRANT USAGE ON SCHEMA public TO readonly_mcp;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_mcp;
```

Then use that role's credentials in `DATABASE_URL`.

---

## Project structure

```
Textual-SQL/
├── backend/          ← Python MCP server (the main product)
│   ├── server.py     ← FastMCP entry point, tool definitions
│   ├── db.py         ← SQLAlchemy database engine
│   ├── requirements.txt
│   ├── .env.example
│   └── render.yaml   ← Deploy to Render (optional HTTP mode)
│
└── frontend/         ← Next.js documentation site
    └── src/app/
        ├── page.tsx      ← Landing page
        ├── mcp/page.tsx  ← Full setup & tool documentation
        └── api/mcp/      ← MCP HTTP endpoint (mirrors Python server)
```

---

## Tech stack

| Layer | Technology |
|---|---|
| MCP server | Python, [FastMCP](https://github.com/modelcontextprotocol/python-sdk) |
| Database | SQLAlchemy 2.0, psycopg2 |
| Documentation site | Next.js 16, Tailwind CSS |
| MCP transport | stdio (primary), Streamable HTTP (optional) |
