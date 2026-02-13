# 🔌 Model Context Protocol (MCP) Setup Guide

This guide explains how to connect **Textual SQL** to external AI tools like **Claude Desktop**.

## 🌐 Global / Remote Setup (Vercel - Recommended)

To avoid exposing your API keys in local config files and for the best performance, deploy to **Vercel**.

### 1. Deploy the Backend
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and "Add New Project".
2. Link your repository.
3. **Important**: Set the "Root Directory" to `backend`.
4. Add **Environment Variables**:
   - `GROQ_API_KEY`: Your Groq API key.
   - `DATABASE_URL`: Your remote database URL (e.g., Supabase PostgreSQL).
5. Click **Deploy**.

### 2. Configure Claude Desktop
Once deployed, your MCP server is accessible at `https://your-project.vercel.app/sse`.
Update your `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "querysense": {
      "type": "http",
      "url": "https://your-deployed-app.com/sse"
    }
  }
}
```

> [!TIP]
> This method is secure because your API keys stay on the server and are never sent to the client.

---

## 💻 Local Setup (Quick Test)

If you just want to test locally via `stdio`:

1. **Locate your config file**:
    - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
2. **Add local entry**:

```json
{
  "mcpServers": {
    "querysense-local": {
      "command": "python",
      "args": ["D:/TEXTSQL/backend/mcp_server.py"],
      "env": {
        "GROQ_API_KEY": "..."
      }
    }
  }
}
```

## 🛠️ Available Capabilities

Once connected, your AI assistant can:
- **`sqlite://schema` Resource**: Inspect your database structure.
- **`query_database` Tool**: Ask questions in plain English.
- **`execute_sql` Tool**: Run raw SQL commands.
