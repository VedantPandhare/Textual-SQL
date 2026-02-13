# 🔌 Model Context Protocol (MCP) Setup Guide

This guide explains how to connect **Textual SQL** to external AI tools like **Claude Desktop**.

## 🌐 Global / Remote Setup (Recommended)

To avoid exposing your API keys in local config files and to access your server from anywhere, use the **HTTP (SSE)** transport.

### 1. Deploy the Server
Deploy the `backend` folder to a provider like **Render**, **Railway**, or **Railway**.
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python backend/mcp_server_sse.py`
- **Environment Variables**: Add `GROQ_API_KEY` and `DATABASE_URL` to your cloud provider's dashboard.

### 2. Configure Claude Desktop
Open your `%APPDATA%\Claude\claude_desktop_config.json` and add:

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
