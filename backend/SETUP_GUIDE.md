# Backend Setup Guide

The backend is a Python MCP server. It connects to your database and exposes tools that Claude Desktop can call.

---

## Requirements

- Python 3.10 or higher
- pip
- A PostgreSQL or Supabase database

Check your Python version:

```bash
python --version
```

---

## Installation

```bash
# From the repo root
cd backend

# Install dependencies
pip install -r requirements.txt
```

Dependencies installed:

| Package | Purpose |
|---|---|
| `mcp[cli]` | MCP server SDK (FastMCP, stdio and HTTP transport) |
| `sqlalchemy` | Database engine and query execution |
| `psycopg2-binary` | PostgreSQL driver |
| `python-dotenv` | Load `.env` file |
| `uvicorn` | ASGI server (used when running in HTTP mode) |

---

## Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and set your connection string:

```
DATABASE_URL=postgresql://user:password@host:6543/postgres
```

That is the only variable required. The server reads nothing else from the environment.

---

## Getting your Supabase connection string

1. Open your project in the [Supabase dashboard](https://supabase.com/dashboard)
2. Go to **Project Settings → Database**
3. Scroll to **Connection string**
4. Select **Transaction pooler** (port 6543 — use this, not the direct connection on port 5432)
5. Copy the URI — it looks like:

```
postgresql://postgres.xxxxxxxxxxxx:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

Replace `YOUR_PASSWORD` with your actual database password.

> If your project is on the free tier and has been inactive, Supabase may have paused it.
> Resume it from the dashboard before connecting.

---

## Running the server

### stdio mode (used by Claude Desktop)

Claude Desktop starts this automatically — you do not run it manually.  
But you can test it by running:

```bash
python server.py stdio
```

If the database connection succeeds you will see:
```
Connected to database: host:6543/postgres
```

If it fails, the error message tells you exactly what is wrong.

### HTTP mode (optional, for testing)

```bash
python server.py
# Server starts at http://localhost:8000/mcp
```

Use a custom port:
```bash
PORT=9000 python server.py
```

---

## Connecting to Claude Desktop

See [MCP_GUIDE.md](MCP_GUIDE.md) for the full Claude Desktop configuration.

Short version — add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-database": {
      "command": "python",
      "args": ["server.py", "stdio"],
      "cwd": "/absolute/path/to/backend",
      "env": {
        "DATABASE_URL": "postgresql://user:password@host:6543/postgres"
      }
    }
  }
}
```

---

## Project files

```
backend/
├── server.py          Entry point. Defines all 8 MCP tools using FastMCP.
├── db.py              Database engine. Wraps SQLAlchemy for all queries.
├── requirements.txt   Python dependencies.
├── .env               Your local config (gitignored — never commit this).
├── .env.example       Template showing required variables.
├── MCP_GUIDE.md       Claude Desktop setup walkthrough.
├── SETUP_GUIDE.md     This file.
├── Procfile           For Render.com deployment (HTTP mode).
└── render.yaml        Render.com service definition (HTTP mode).
```

---

## Common errors

### `DATABASE_URL environment variable is required`
You have not created `.env`, or the file is empty. Run `cp .env.example .env` and fill in your connection string.

### `connection to server ... failed: FATAL: tenant/user not found`
- The Supabase project is paused — resume it from the dashboard
- The password in the connection string is wrong — reset it in Supabase and update `.env`
- You are using the direct connection URL (port 5432) instead of the transaction pooler (port 6543)

### `ModuleNotFoundError: No module named 'mcp'`
Dependencies are not installed. Run `pip install -r requirements.txt`.

### Tools do not show up in Claude Desktop
- The `cwd` path in `claude_desktop_config.json` is wrong
- `python` is not on your system PATH — try using the full path (e.g. `/usr/bin/python3`)
- You did not fully quit and restart Claude Desktop after editing the config
