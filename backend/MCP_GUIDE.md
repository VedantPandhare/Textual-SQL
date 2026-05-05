# MCP Setup Guide

This server uses the **stdio transport** — Claude Desktop spawns the Python process directly on your machine. No ports, no HTTP server, no deployment required.

---

## How the connection works

```
Claude Desktop  ──stdio──►  python server.py  ──SQLAlchemy──►  Your database
```

Claude Desktop reads `claude_desktop_config.json` on startup, launches the Python process, and communicates with it over stdin/stdout. When you close Claude Desktop, the process stops. You never start or manage it manually.

---

## Step 1 — Set your database connection

Open `backend/.env` (copy from `.env.example` if it does not exist):

```bash
cp .env.example .env
```

Edit `.env` and set your connection string:

```
DATABASE_URL=postgresql://user:password@host:6543/postgres
```

**Supabase users** — find this at:
`Project Settings → Database → Connection string → Transaction pooler`

It looks like:
```
postgresql://postgres.xxxxxxxxxxxx:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

> **Note:** Use the **Transaction pooler** URL (port 6543), not the direct connection (port 5432).
> The pooler handles connection limits and works better in practice.

---

## Step 2 — Configure Claude Desktop

Open the config file for your OS:

| OS | Path |
|---|---|
| macOS / Linux | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

Add the following entry. **Update `cwd` to the absolute path of this `backend` folder on your machine.**

### macOS / Linux

```json
{
  "mcpServers": {
    "my-database": {
      "command": "python",
      "args": ["server.py", "stdio"],
      "cwd": "/absolute/path/to/Textual-SQL/backend",
      "env": {
        "DATABASE_URL": "postgresql://user:password@host:6543/postgres"
      }
    }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "my-database": {
      "command": "python",
      "args": ["server.py", "stdio"],
      "cwd": "C:\\Users\\YourName\\Textual-SQL\\backend",
      "env": {
        "DATABASE_URL": "postgresql://user:password@host:6543/postgres"
      }
    }
  }
}
```

> **Two things to update:**
> - `cwd` — the absolute path to THIS folder (`backend/`) on your machine
> - `DATABASE_URL` — your actual connection string (same as the one in `.env`)

---

## Step 3 — Restart Claude Desktop

After saving the config, fully quit and reopen Claude Desktop (not just the window — quit the app).

Click the **hammer icon (🔨)** in the chat input bar. You should see these tools listed:

- `list_tables`
- `describe_table`
- `get_schema`
- `execute_sql`
- `select_rows`
- `insert_row`
- `update_rows`
- `delete_rows`

If the tools appear, the server is connected and ready.

---

## Available tools

| Tool | What it does |
|---|---|
| `list_tables` | List all tables in the database |
| `describe_table` | Get columns and types for a specific table |
| `get_schema` | Full schema of every table at once |
| `execute_sql` | Run any SQL statement directly |
| `select_rows` | SELECT with optional filters, sorting, pagination |
| `insert_row` | Insert one row from a key-value object |
| `update_rows` | Update rows matching a WHERE condition |
| `delete_rows` | Delete rows matching a WHERE condition |

---

## Optional — Run as HTTP server

To run the server as a Streamable HTTP endpoint instead of stdio (useful for testing with MCP Inspector):

```bash
python server.py                 # HTTP on port 8000
PORT=9000 python server.py       # Custom port
python server.py stdio           # stdio mode (Claude Desktop uses this automatically)
```

The HTTP endpoint is available at `http://localhost:8000/mcp`.

---

## Troubleshooting

**Tools do not appear in Claude Desktop**
- Check that `cwd` in the config is the correct absolute path to the `backend` folder
- Make sure `python` is on your PATH: run `python --version` in a terminal
- Check that dependencies are installed: `pip install -r requirements.txt`

**Server crashes immediately**
- The `DATABASE_URL` is invalid or the database is unreachable
- Run `python server.py stdio` in a terminal to see the exact error

**Connection refused / tenant not found**
- Your Supabase project may be paused (free tier pauses after inactivity)
- Go to the Supabase dashboard and resume the project, then reset the password
- Make sure you are using the **Transaction pooler** URL, not the direct connection URL
