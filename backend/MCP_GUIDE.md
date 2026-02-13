# 🔌 Model Context Protocol (MCP) Setup Guide

This guide explains how to connect **Textual SQL** to external AI tools like **Claude Desktop** using the Model Context Protocol.

## 🚀 Quick Start (Claude Desktop)

1.  **Install Claude Desktop** if you haven't already.
2.  **Locate your config file**:
    - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
    - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
3.  **Add Textual SQL to the config**:
    Open the file (create it if it doesn't exist) and add the following entry under `mcpServers`:

```json
{
  "mcpServers": {
    "textual-sql": {
      "command": "python",
      "args": [
        "D:/TEXTSQL/backend/mcp_server.py"
      ],
      "env": {
        "GROQ_API_KEY": "your_groq_api_key_here",
        "DATABASE_URL": "sqlite:///D:/TEXTSQL/chinook.db"
      }
    }
  }
}
```

> [!IMPORTANT]
> - Ensure you use absolute paths for the script and database.
> - Replace `your_groq_api_key_here` with your actual Groq API key.
> - Restart Claude Desktop after saving the config.

## 🛠️ Available Capabilities

Once connected, your AI assistant can:

- **`sqlite://schema` Resource**: Directly inspect your entire database schema.
- **`query_database` Tool**: Translate natural language questions into SQL and get back the results.
- **`execute_sql` Tool**: Run direct SQL commands if needed.

## ❓ Why use MCP?

MCP allows you to bypass the web interface and interact with your data directly from your favorite AI tools. You can ask Claude to "Analyze the sales trends from the chinook database and write a summary report," and it will use your **Textual SQL** backend to fetch the data it needs.
