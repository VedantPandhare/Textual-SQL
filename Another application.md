# Supabase MCP Server

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.76-3ecf8e)](https://supabase.com/)
[![MCP](https://img.shields.io/badge/MCP-Streamable_HTTP-green)](https://modelcontextprotocol.io/)

> **A production-ready Model Context Protocol (MCP) server for Supabase database operations with AI agents and assistants.**

Built by [Piyush Dhoka](https://github.com/piyushdhoka) - AI/ML Engineer

---

## 🎯 What is This?

This is a **Model Context Protocol (MCP) server** that enables AI assistants like GitHub Copilot, Claude, and other AI agents to interact with your Supabase database. Think of it as a bridge between AI and your database - AI can now read, create, update, and delete records directly!

### Why MCP?

MCP (Model Context Protocol) is a standardized way for AI assistants to access external tools and data sources. This server exposes your Supabase database as MCP tools, making your data accessible to AI agents in a safe and controlled way.

## ✨ Features

### 🔥 Core Features
- **8 Powerful MCP Tools** - Complete CRUD operations for Supabase
- **Streamable HTTP Transport** - No Redis required! Works out of the box
- **Production Ready** - Deployed on Vercel with global CDN
- **Type-Safe** - Full TypeScript support with Zod validation
- **Real-time Ready** - Built on Supabase's real-time infrastructure

### 🎨 Modern UI
- **Beautiful Landing Page** - Showcasing your MCP server capabilities
- **Interactive Code Examples** - Live code snippets for easy integration
- **Responsive Design** - Works perfectly on all devices
- **Dark Mode** - Sleek, modern design with Tailwind CSS

### 🔒 Security
- **Service Role Authentication** - Secure database access
- **Environment Variables** - Sensitive data never exposed
- **Input Validation** - All inputs validated with Zod schemas

## 🛠️ Available MCP Tools

Your AI assistant can use these 8 tools to interact with your database:

| Tool | Description | Use Case |
|------|-------------|----------|
| `creatorInfo` | Get creator information | Learn about the developer |
| `getDocument` | Get a document by UUID | Retrieve specific company data |
| `listDocuments` | List all documents | Browse database with pagination |
| `createDocument` | Create new document | Add new companies |
| `updateDocument` | Update existing document | Modify company information |
| `deleteDocument` | Delete a document | Remove companies |
| `upsertDocument` | Create or update | Smart insert/update operation |
| `clearCollection` | Clear all documents | Reset database (with confirmation) |

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** or **Bun** runtime
- **Supabase account** ([Sign up free](https://supabase.com))
- **Vercel account** (optional, for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/piyushdhoka/mcp_server.git
cd mcp_server
```

### 2. Install Dependencies

```bash
# Using bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Set Up Supabase Database

**Create your database table:**

Go to your Supabase SQL Editor and run:

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_id INTEGER UNIQUE NOT NULL,
  description TEXT,
  website TEXT,
  employee_count INTEGER,
  founded_year INTEGER,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(company_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(industry, '')), 'C')
  ) STORED
);

-- Create indexes for better performance
CREATE INDEX idx_companies_company_id ON companies(company_id);
CREATE INDEX idx_companies_search_vector ON companies USING GIN(search_vector);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these values:**
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the values:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Run the Development Server

```bash
# Using bun (recommended)
bun dev

# Or using npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤖 Using with AI Assistants

### GitHub Copilot Chat

Add to your `.vscode/settings.json`:

```json
{
  "github.copilot.chat.mcp.servers": {
    "supabase-mcp": {
      "type": "http",
      "url": "https://mcp-server-nznpiw5jx-piyushdhokas-projects.vercel.app/mcp",
      "timeout": 60000
    }
  }
}
```

Then in Copilot Chat:
- "List all companies in the database"
- "Create a company called Test Inc with ID 1000"
- "Tell me about the creator of this MCP server"

### Continue Extension

Create `.continue/mcpServers/supabase.yaml`:

```yaml
name: Supabase MCP Server
version: 1.0.0
schema: v1
mcpServers:
  - name: Supabase MCP Server
    transport:
      type: streamable-http
      url: https://mcp-server-nznpiw5jx-piyushdhokas-projects.vercel.app/mcp
    timeout: 60000
```

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp-server-nznpiw5jx-piyushdhokas-projects.vercel.app/mcp"
    }
  }
}
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

Or use the [Vercel Dashboard](https://vercel.com/new):
- Import your GitHub repository
- Add environment variables
- Deploy!

Your MCP server will be live at: `https://your-project.vercel.app/mcp`

### Environment Variables on Vercel

Make sure to add these in **Vercel Dashboard** → **Settings** → **Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📚 API Documentation

### MCP Endpoint

**URL:** `https://your-deployment.vercel.app/mcp`

**Transport:** Streamable HTTP (no Redis required!)

### Example: List All Documents

```bash
curl -X POST https://your-deployment.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "listDocuments",
      "arguments": {
        "limit": 10
      }
    },
    "id": 1
  }'
```

### Tool Parameters

#### `listDocuments`
```typescript
{
  tableName?: string;    // Default: "companies"
  limit?: number;        // Default: 25
  offset?: number;       // Default: 0
  orderBy?: string;      // Default: "created_at"
  ascending?: boolean;   // Default: false
}
```

#### `createDocument`
```typescript
{
  company_name: string;
  company_id: number;
  description?: string;
  website?: string;
  employee_count?: number;
  founded_year?: number;
  industry?: string;
  tableName?: string;    // Default: "companies"
}
```

#### `getDocument`
```typescript
{
  documentId: string;    // UUID
  tableName?: string;    // Default: "companies"
}
```

Full API documentation: [API.md](./API.md)

## 🏗️ Tech Stack

- **Framework:** Next.js 15.3.3 with App Router
- **Runtime:** Bun / Node.js 18+
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **MCP Adapter:** @vercel/mcp-adapter 0.7.3
- **Animations:** Framer Motion
- **UI Components:** Radix UI + shadcn/ui
- **Validation:** Zod
- **Deployment:** Vercel

## 📁 Project Structure

```
mcp-server/
├── src/
│   ├── app/
│   │   ├── [transport]/     # MCP server routes (/mcp, /sse)
│   │   │   └── route.ts     # Main MCP handler
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── hero-section.tsx
│   │   ├── code-showcase.tsx
│   │   ├── mcp-demo.tsx
│   │   └── ui/              # shadcn components
│   └── lib/
│       └── tools/
│           └── supabase.ts  # 8 MCP tools implementation
├── public/
├── .env                     # Environment variables
├── package.json
└── README.md
```

## 🔧 Configuration

### Transport Options

This server supports **Streamable HTTP** transport:

```typescript
{
  streamableHttpEndpoint: "/mcp",
  verboseLogs: true,
  maxDuration: 60
}
```

**Why Streamable HTTP?**
- ✅ No Redis required
- ✅ Works out of the box
- ✅ Perfect for serverless
- ✅ Simpler deployment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Piyush Dhoka**
- AI/ML Engineer & Developer
- GitHub: [@piyushdhoka](https://github.com/piyushdhoka)
- Focus: AI/ML Engineering, Full-Stack Development, Cloud Architecture

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic
- [Supabase](https://supabase.com/) for the amazing database platform
- [Vercel](https://vercel.com/) for seamless deployment
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

## 📞 Support

If you have any questions or need help, please:
- Open an [Issue](https://github.com/piyushdhoka/mcp_server/issues)
- Check the [API Documentation](./API.md)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides

---

**⭐ If you find this project useful, please consider giving it a star!**

Built with ❤️ by [Piyush Dhoka](https://github.com/piyushdhoka)

- Open an issue on GitHub
- Check the documentation
- Contact: Piyush Dhoka

---

**Deployed by Piyush Dhoka (SparkStudio) · Original by [@ramxcodes](https://github.com/ramxcodes)**

Live MCP Endpoint: [https://mcp.sparkstudio.in/mcp](https://mcp.sparkstudio.in/mcp)
