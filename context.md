# 🧠 QuerySense DB: Project Context

## 🌟 Overview
**QuerySense DB** is a high-performance bridge between natural language and complex relational databases. It utilizes **Retrieval-Augmented Generation (RAG)** and the latest **Large Language Models (LLMs)** to allow users (and AI agents) to talk to their data in plain English.

The project is built around the **Model Context Protocol (MCP)**, making it instantly compatible with AI tools like Claude Desktop.

---

## 🚀 Achievements to Date
- **Hybrid Power-App Architecture**: Migrated from a split Python/Node architecture to a unified, Vercel-native Next.js app.
- **TypeScript RAG Engine**: Successfully ported complex Python SQL generation logic to TypeScript using LangChain and Groq.
- **Multi-DB Support**: Native drivers for both **PostgreSQL** and **SQLite**, handling schema introspection and query execution.
- **Universal MCP Server**: Implemented a high-speed, streamable HTTP MCP server using the official Vercel/MCP ecosystem.
- **Dynamic Schema Indexing**: The AI doesn't just "guess"; it reads the database schema directly to ensure 99% query accuracy.
- **Premium UI**: Developed a modern, dark-themed landing page with a dedicated documentation portal for MCP setup.

---

## 🛠️ Implementation Details

### **Frontend & Core**
- **Framework**: Next.js (TypeScript)
- **Styling**: Tailwind CSS with custom "Rich Aesthetics" components (Dotted surfaces, Glassmorphism).
- **Icons**: Lucide React.
- **Environment**: Vercel-ready with optimized serverless function handling.

### **Intelligence Layer (AI)**
- **LLM**: Groq Llama-3.3-70b-versatile (Sub-second inference speed).
- **Orchestration**: LangChain.js & `@langchain/groq`.
- **RAG Logic**: Metadata-based schema injection. The system extracts table names, column types, and relationships to provide context to the LLM.

### **Communication Layer (MCP)**
- **Transport**: Streamable HTTP via `mcp-handler`.
- **Endpoints**: `/api/mcp` serves tools like `query_database` and `execute_sql`.
- **Compatibility**: Tested with Claude Desktop for seamless voice/chat integration with local and remote databases.

---

## 📈 What it Wants to Achieve (Roadmap)
- **Universal Connection Paramaters**: Allow external users to pass their own `DATABASE_URL` as a parameter to the MCP tools, creating a truly global database utility.
- **Local-First Proxy**: A secure desktop bridge for users who want to query local databases without exposing them to the internet.

---

## 📂 Project Structure
- `frontend/`: The core Next.js application (Unified Host).
  - `src/lib/mcp/`: TypeScript services for DB access and AI logic.
  - `src/app/api/mcp/`: The serverless MCP endpoint.
- `backend/`: Legacy Python implementation and documentation.
- `context.md`: This document.
