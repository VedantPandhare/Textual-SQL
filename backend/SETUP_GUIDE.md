# Getting Your API Keys and Database Setup

## 1. LLM API Keys (Choose One or Both!)

The system supports **both Gemini and Groq** with automatic fallback:
- **Priority**: Gemini → Groq
- You can set both keys, and the system will use Gemini by default
- If Gemini key is missing, it will automatically use Groq

### Option A: Google Gemini (Recommended)

**How to Get It:**
1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated API key
5. Add to `.env`: `GOOGLE_API_KEY=your_actual_key_here`

**Benefits:** Generous free tier, excellent performance, latest models

### Option B: Groq (Alternative)

**How to Get It:**
1. Go to **[Groq Console](https://console.groq.com/keys)**
2. Sign up and create an API key
3. Add to `.env`: `GROQ_API_KEY=your_actual_key_here`

**Benefits:** Extremely fast inference, great for real-time applications

### Using Both (Recommended for Production)
```bash
GOOGLE_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key  # Fallback if Gemini fails
```

---

## 2. Database Options

You have **TWO options** for the database:

### Option A: SQLite (Recommended for Getting Started)
- **No setup needed!** Already configured by default
- Local database file (`chinook.db`)
- Perfect for development and testing
- Already created when you ran `setup_db.py`

**Configuration in `.env`:**
```bash
DATABASE_TYPE=sqlite
DATABASE_URL=sqlite:///./chinook.db
```

### Option B: PostgreSQL (Supabase or Other)
- Use this for production or if you need a cloud database
- Supabase offers a generous free tier

#### How to Get Supabase Database URL:

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create a new project
   - **Save your database password** - you'll need it later!
   - Wait for the project to be provisioned (~2 minutes)

2. **Get Your PostgreSQL Connection String:**
   
   **The URL and API keys you see in "API Settings" are NOT what you need!**
   
   **Correct Method - Using Database Settings:**
   - In the left sidebar, click **Settings** (⚙️ icon)
   - Under **PROJECT SETTINGS**, look for **"Database"** option
   - If you don't see "Database", try clicking on **"Project Settings"** at the top
   - Scroll down to find **"Connection string"** or **"Connection pooling"**
   - Look for the **PostgreSQL** connection string (not the API URL)
   
   **Alternative Method - Direct Connection Info:**
   - Click on the **"Connect"** button at the top of your dashboard
   - Select **"Direct connection"** or **"Connection pooling"**
   - Choose **"URI"** format
   - Copy the connection string that looks like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
     ```
     OR (for pooler):
     ```
     postgresql://postgres.xxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password

   **What you're seeing (API Settings) vs What you need:**
   - ❌ **API URL**: `https://xxxxxx.supabase.co` - This is for REST API, NOT for direct database connection
   - ❌ **Publishable API Key**: `eyJhbGc...` - This is for JavaScript client, NOT for database
   - ✅ **PostgreSQL URI**: `postgresql://postgres:...` - This is what you need!

3. **Configure in `.env`:**
```bash
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://postgres:your_password@db.xxxxxx.supabase.co:5432/postgres
```

**Important Notes:**
- The REST API URL (https://...) is different from the PostgreSQL connection string (postgresql://...)
- You need the **PostgreSQL database connection string**, not the API endpoint
- If you can't find it, look for a "Connect" button in your project dashboard

4. **Create Tables in Supabase:**
   - You'll need to create the same tables (Users, Orders) in Supabase
   - You can use the Supabase SQL Editor or modify `setup_db.py` to work with PostgreSQL

---

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` and add your Gemini API key:**
   ```bash
   GOOGLE_API_KEY=your_actual_gemini_key_here
   DATABASE_TYPE=sqlite
   DATABASE_URL=sqlite:///./chinook.db
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend:**
   ```bash
   uvicorn main:app --reload
   ```

That's it! The chatbot will use SQLite by default and Google Gemini for AI.
