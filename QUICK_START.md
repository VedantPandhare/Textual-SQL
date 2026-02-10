# 🚀 SQL Chatbot - Quick Start Guide

## ✅ Your Application is Now Running!

### Server Status:
- **Backend (FastAPI)**: http://localhost:8000
- **Frontend (Next.js 16)**: http://localhost:3000

## 🎯 How to Use:

1. **Open your browser** and navigate to: **http://localhost:3000**

2. **You'll see the SQL Intelligence chatbot interface** with:
   - Dark-themed premium UI
   - Chat input at the bottom
   - "Sync Schema" button in the header

3. **First Time Setup** - Click the "Sync Schema" button to index your database schema into the vector store

4. **Start Chatting!** Try these example queries:
   ```
   Show me all users
   What are the top 3 orders by amount?
   How many orders did Alice place?
   Show me all orders from 2024
   List users with their total order amounts
   ```

5. **The chatbot will**:
   - Use RAG to find relevant table schemas
   - Generate SQL using Gemini/Groq
   - Execute the query
   - Display both the SQL code and results

## 📊 What's in the Database:

Your SQLite database (`chinook.db`) contains:

**Users Table:**
- id, name, email, role

**Orders Table:**
- order_id, user_id, product_name, amount, order_date

Sample data includes users like Alice, Bob, and Charlie with their orders.

## 🔧 API Endpoints:

- **POST /ask**: Send natural language queries
  ```json
  {"query": "Show me all users"}
  ```

- **POST /index-schema**: Re-index the database schema

- **GET /**: Health check

## 🛑 To Stop the Servers:

- Press `Ctrl+C` in both terminal windows

## 🔄 To Restart:

**Backend:**
```bash
cd d:\TEXTSQL\backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd d:\TEXTSQL\frontend
npm run dev
```

## 🎨 Features:

✅ RAG-powered schema retrieval
✅ Gemini/Groq AI integration with fallback
✅ SQLite & PostgreSQL support
✅ Premium dark-themed UI
✅ Real-time SQL generation
✅ Interactive data tables
✅ Next.js 16 with Turbopack

Enjoy your intelligent SQL chatbot! 🎉
