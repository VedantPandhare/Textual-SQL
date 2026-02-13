# 🔌 Hybrid MCP setup Guide

This is the **modern, unified** way to deploy your MCP server. By using the **Hybrid Model**, your MCP server runs directly inside your Next.js frontend, making it faster, more secure, and easier to deploy.

## 🚀 Deployment to Vercel (Recommended)

To make this MCP server available to other users, follow these steps:

### 1. Project Configuration
1. Go to the [Vercel Dashboard](https://vercel.com/new).
2. Connect your Git repository.
3. **Critical Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Select `frontend` (NOT the root of the repo).
4. **Environment Variables**:
   - `GROQ_API_KEY`: Your API key for Llama-3 (Groq).
   - `DATABASE_URL`: Your database connection string (e.g., Supabase or Neon).

### 2. Connect Your AI Assistant
Once deployed, your MCP server lives at:
`https://your-project.vercel.app/api/mcp`

To connect **Claude Desktop**, add this to your `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "querysense": {
      "type": "http",
      "url": "https://your-project.vercel.app/api/mcp"
    }
  }
}
```

---

## 🛠️ Performance & Security
- **Streamable HTTP**: Unlike traditional servers, this uses Vercel's high-speed streamable transport.
- **Zero-Backend**: No separate Python server to maintain for external tools.
- **Global Availability**: Other users can connect to your server just by adding your Vercel URL to their Claude config.

## 🤖 Capabilities
Once connected, your AI can:
- **Analyze Schema**: It "sees" your database structure via RAG.
- **Natural Language Query**: Ask "Show me users who signed up last week" and it will write and run the SQL.
- **Safe Execution**: It runs queries through your secure Vercel environment.
