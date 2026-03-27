# Textual SQL - Bridge the Gap Between Language and Data

Textual SQL is a premium, AI-powered platform that allows you to talk to your databases in plain English. Powered by RAG (Retrieval-Augmented Generation) and Groq's high-performance LLMs, it converts natural language queries into optimized SQL in seconds.

![Landing Page Preview](./landing_page.png)

## Key Features

- **Intuitive Landing Page**: A stunning Three.js-powered animated background for a premium user experience.
- **RAG-Powered Intelligence**: Automatically indexes your database schema to provide context-aware SQL generation.
- **Intelligent SQL Chat**: Deep-learning powered translation of natural language to SQL.
- **Hybrid MCP Server**: Run your MCP server directly inside the Next.js frontend for faster, secure, and easier deployment.
- **Secure & Private**: Support for transaction pooler URLs and local credential persistence.

## Deployment to Vercel (Recommended)

To deploy the **Textual SQL** platform and make the MCP server available globally:

1.  **Vercel Configuration**:
    - Framework Preset: `Next.js`
    - Root Directory: `frontend`
2.  **Environment Variables**:
    - `GROQ_API_KEY`: Your Groq API Key.
    - `DATABASE_URL`: Your PostgreSQL connection string.
    - `NEXT_PUBLIC_API_URL`: (Optional) URL of your backend if using a separate service.
3.  **Deployment**: Push your code to GitHub and connect it to Vercel.

Your MCP server will be available at: `https://your-project.vercel.app/api/mcp`

---

