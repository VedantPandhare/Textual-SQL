"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Copy,
    Check,
    Terminal,
    Database,
    Shield,
    Plug,
    Laptop,
    BookOpen,
    Wrench,
    MessageSquare,
    ChevronRight,
} from "lucide-react";
import { DottedSurface } from "@/components/DottedSurface";

// ─── Code block with copy button ─────────────────────────────────────────────

function CodeBlock({ label, code, lang = "bash" }: { label?: string; code: string; lang?: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="rounded-2xl overflow-hidden border border-border bg-muted">
            {label && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</span>
                    <button
                        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="p-1.5 rounded-md hover:bg-accent transition-colors"
                    >
                        {copied
                            ? <Check className="w-3.5 h-3.5 text-green-500" />
                            : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                </div>
            )}
            <pre className="p-5 overflow-x-auto text-sm font-mono text-ring leading-relaxed">{code}</pre>
        </div>
    );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ step, icon, title, subtitle }: {
    step?: string; icon: React.ReactNode; title: string; subtitle?: string;
}) {
    return (
        <div className="flex items-start gap-4">
            {step && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">
                    {step}
                </div>
            )}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-ring">
                    {icon}
                    <h2 className="text-xl font-bold text-foreground">{title}</h2>
                </div>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
    );
}

// ─── Inline code ──────────────────────────────────────────────────────────────

function Code({ children }: { children: React.ReactNode }) {
    return <code className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-ring text-[0.85em]">{children}</code>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const CLAUDE_CONFIG_MAC = String.raw`{
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
}`;

const CLAUDE_CONFIG_WIN = String.raw`{
  "mcpServers": {
    "my-database": {
      "command": "python",
      "args": ["server.py", "stdio"],
      "cwd": "C:\\Users\\You\\Textual-SQL\\backend",
      "env": {
        "DATABASE_URL": "postgresql://user:password@host:6543/postgres"
      }
    }
  }
}`;

const SETUP_COMMANDS = `# 1. Clone the repository
git clone https://github.com/VedantPandhare/Textual-SQL.git
cd Textual-SQL/backend

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Create your .env file
cp .env.example .env

# 4. Open .env and paste your connection string
#    DATABASE_URL=postgresql://user:password@host:6543/postgres`;

const TOOLS = [
    {
        name: "list_tables",
        params: "—",
        desc: "Returns a list of every table in the database.",
        example: '"What tables do I have?"',
    },
    {
        name: "describe_table",
        params: "table_name",
        desc: "Returns every column, its type, and whether it is nullable.",
        example: '"What are the columns in the orders table?"',
    },
    {
        name: "get_schema",
        params: "—",
        desc: "Returns the full schema of all tables at once.",
        example: '"Give me a full overview of the database schema."',
    },
    {
        name: "execute_sql",
        params: "sql",
        desc: "Runs any SQL statement and returns results.",
        example: '"Run: SELECT count(*) FROM users"',
    },
    {
        name: "select_rows",
        params: "table, columns?, where?, limit?, offset?, order_by?, ascending?",
        desc: "SELECT with optional filtering, sorting and pagination.",
        example: '"Show me the 10 most recent orders."',
    },
    {
        name: "insert_row",
        params: "table_name, data",
        desc: "Inserts one row from a key-value object.",
        example: '"Add a product named Widget priced at 9.99."',
    },
    {
        name: "update_rows",
        params: "table_name, data, where",
        desc: "Updates every row matching the WHERE clause.",
        example: '"Mark order 42 as shipped."',
    },
    {
        name: "delete_rows",
        params: "table_name, where",
        desc: "Deletes every row matching the WHERE clause.",
        example: '"Delete all sessions older than 30 days."',
    },
];

const EXAMPLE_PROMPTS = [
    "What tables do I have in my database?",
    "Show me the last 5 orders with their total amount.",
    "How many users signed up this month?",
    "Find all products where stock is below 10.",
    "What are all the columns in the customers table?",
    "Insert a new user: name Alice, email alice@example.com.",
    "Update the status of order #99 to 'shipped'.",
    "Give me a summary of sales by category.",
];

export default function MCPDocsPage() {
    const router = useRouter();
    const [osTab, setOsTab] = useState<"mac" | "win">("mac");

    return (
        <div className="relative min-h-screen text-foreground overflow-hidden bg-background">
            <DottedSurface className="z-0 opacity-10" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 space-y-16">

                {/* Back */}
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                {/* Hero */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold tracking-[0.3em] uppercase text-ring">
                        <BookOpen className="w-3 h-3" />
                        MCP Documentation
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight">
                        Connect Claude to<br />
                        <span className="text-ring">Your Database</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                        A local MCP server that gives Claude Desktop direct read/write access
                        to your PostgreSQL or Supabase database — no accounts, no cloud, no middleman.
                    </p>
                </div>

                {/* ── What is MCP ────────────────────────────────────────────── */}
                <section className="space-y-6">
                    <SectionHeader
                        icon={<Plug className="w-5 h-5" />}
                        title="What is MCP?"
                    />
                    <p className="text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Model Context Protocol (MCP)</strong> is an open standard created by Anthropic.
                        It works like a plugin system for AI assistants — you expose <em>tools</em>, and
                        Claude can call them during a conversation exactly like a function call.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Without MCP, Claude only knows what you paste into the chat window.
                        With an MCP server, Claude can <em>actively query</em> your database mid-conversation —
                        looking up real data, inserting rows, running aggregations — and show you the results.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { from: "You ask Claude a question", to: "Claude calls list_tables" },
                            { from: "Claude calls select_rows", to: "Server queries your DB" },
                            { from: "Results come back", to: "Claude answers with real data" },
                        ].map((step, i) => (
                            <div key={i} className="p-4 bg-card border border-border rounded-xl space-y-2">
                                <div className="text-xs text-muted-foreground">{step.from}</div>
                                <ChevronRight className="w-3.5 h-3.5 text-ring" />
                                <div className="text-xs font-bold text-foreground">{step.to}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Why local ──────────────────────────────────────────────── */}
                <section className="space-y-6">
                    <SectionHeader
                        icon={<Shield className="w-5 h-5" />}
                        title="Why does this run locally?"
                        subtitle="This is not a SaaS product you sign up for — it is a process you run on your own machine."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            {
                                title: "Your password never leaves your machine",
                                body: "Your DATABASE_URL contains your database password. Running locally means it goes directly from your machine to your database — no server in between ever sees it.",
                            },
                            {
                                title: "No accounts or API keys needed",
                                body: "There is nothing to sign up for. Clone the repo, set your connection string, point Claude at it. That is the entire setup.",
                            },
                            {
                                title: "Claude Desktop spawns the server",
                                body: "Claude Desktop starts the Python process automatically when you open it and kills it when you close it. You do not manage a running server.",
                            },
                            {
                                title: "This is how production database MCP servers work",
                                body: "The official Supabase MCP server, the Postgres MCP server, and every serious database tool in Anthropic's registry all use the same local stdio model.",
                            },
                        ].map((card) => (
                            <div key={card.title} className="p-5 bg-card border border-border rounded-2xl space-y-2">
                                <p className="font-bold text-sm text-foreground">{card.title}</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Prerequisites ──────────────────────────────────────────── */}
                <section className="space-y-5">
                    <SectionHeader
                        icon={<Laptop className="w-5 h-5" />}
                        title="Prerequisites"
                    />
                    <div className="space-y-2">
                        {[
                            ["Python 3.10+", "Check with: python --version"],
                            ["pip", "Comes with Python. Check with: pip --version"],
                            ["Claude Desktop", "Download from claude.ai/download"],
                            ["A PostgreSQL or Supabase database", "You will need the connection string (transaction pooler URL)"],
                            ["Git", "To clone the repository"],
                        ].map(([name, note]) => (
                            <div key={name} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-ring mt-2 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-foreground">{name}</p>
                                    <p className="text-xs text-muted-foreground">{note}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Setup ──────────────────────────────────────────────────── */}
                <section className="space-y-5">
                    <SectionHeader
                        step="1"
                        icon={<Terminal className="w-5 h-5" />}
                        title="Clone & install"
                        subtitle="Run these commands in your terminal."
                    />
                    <CodeBlock label="terminal" code={SETUP_COMMANDS} />
                    <div className="p-4 bg-card border border-border rounded-xl text-sm text-muted-foreground space-y-1">
                        <p className="font-bold text-foreground text-xs uppercase tracking-widest">Where to get your connection string</p>
                        <p>In Supabase: <strong>Project Settings → Database → Connection string → Transaction pooler</strong></p>
                        <p>It looks like: <Code>postgresql://postgres.xxxx:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres</Code></p>
                    </div>
                </section>

                {/* ── Claude Desktop config ──────────────────────────────────── */}
                <section className="space-y-5">
                    <SectionHeader
                        step="2"
                        icon={<Wrench className="w-5 h-5" />}
                        title="Configure Claude Desktop"
                        subtitle="Open the Claude Desktop config file and add the server entry below."
                    />

                    <div className="space-y-3">
                        <div className="p-4 bg-card border border-border rounded-xl text-sm text-muted-foreground space-y-1">
                            <p className="font-bold text-foreground text-xs uppercase tracking-widest">Config file location</p>
                            <p><strong className="text-foreground">macOS:</strong> <Code>~/Library/Application Support/Claude/claude_desktop_config.json</Code></p>
                            <p><strong className="text-foreground">Windows:</strong> <Code>%APPDATA%\Claude\claude_desktop_config.json</Code></p>
                        </div>

                        {/* OS tabs */}
                        <div className="flex gap-2">
                            {(["mac", "win"] as const).map((os) => (
                                <button
                                    key={os}
                                    onClick={() => setOsTab(os)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                        osTab === os
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary border border-border text-muted-foreground hover:bg-accent"
                                    }`}
                                >
                                    {os === "mac" ? "macOS / Linux" : "Windows"}
                                </button>
                            ))}
                        </div>

                        <CodeBlock
                            label="claude_desktop_config.json"
                            code={osTab === "mac" ? CLAUDE_CONFIG_MAC : CLAUDE_CONFIG_WIN}
                        />

                        <div className="p-4 bg-card border border-border rounded-xl text-sm space-y-1 text-muted-foreground">
                            <p className="font-bold text-foreground">Two things to update in the config:</p>
                            <p><Code>cwd</Code> — the absolute path to the <Code>backend</Code> folder on your machine</p>
                            <p><Code>DATABASE_URL</Code> — your actual connection string</p>
                        </div>
                    </div>
                </section>

                {/* ── Start ──────────────────────────────────────────────────── */}
                <section className="space-y-5">
                    <SectionHeader
                        step="3"
                        icon={<Plug className="w-5 h-5" />}
                        title="Restart Claude Desktop"
                        subtitle="That is all. Claude Desktop reads the config file on startup and launches the server automatically."
                    />
                    <div className="p-5 bg-card border border-border rounded-2xl space-y-2">
                        <p className="text-sm text-muted-foreground">
                            After restarting, look for the <strong className="text-foreground">hammer icon</strong> (🔨)
                            in the Claude chat input bar. Click it to see the list of available tools.
                            If you see <Code>list_tables</Code>, <Code>select_rows</Code>, etc. — you are connected.
                        </p>
                    </div>
                </section>

                {/* ── Example prompts ────────────────────────────────────────── */}
                <section className="space-y-5">
                    <SectionHeader
                        icon={<MessageSquare className="w-5 h-5" />}
                        title="What to say to Claude"
                        subtitle="Claude figures out which tools to call — you just talk to it in plain English."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {EXAMPLE_PROMPTS.map((prompt) => (
                            <div
                                key={prompt}
                                className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-ring/30 transition-colors"
                            >
                                <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-ring shrink-0" />
                                <p className="text-sm text-muted-foreground italic">"{prompt}"</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Tool reference ─────────────────────────────────────────── */}
                <section className="space-y-5">
                    <SectionHeader
                        icon={<Database className="w-5 h-5" />}
                        title="Tool reference"
                        subtitle="These 8 tools are registered with Claude. You never call them manually — Claude decides when to use each one."
                    />
                    <div className="space-y-3">
                        {TOOLS.map((tool) => (
                            <div key={tool.name} className="p-5 bg-card border border-border rounded-2xl space-y-2 hover:border-ring/30 transition-colors">
                                <div className="flex flex-wrap items-center gap-3">
                                    <code className="font-mono text-sm font-bold text-ring">{tool.name}</code>
                                    <code className="font-mono text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md">{tool.params}</code>
                                </div>
                                <p className="text-sm text-muted-foreground">{tool.desc}</p>
                                <p className="text-xs text-muted-foreground/60 italic">e.g. {tool.example}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Security tip ───────────────────────────────────────────── */}
                <section>
                    <div className="flex gap-4 p-6 bg-card border border-border rounded-2xl">
                        <Shield className="w-5 h-5 text-chart-5 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <p className="font-bold text-sm">Security tip — use a read-only user</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                The <Code>execute_sql</Code> and <Code>delete_rows</Code> tools can modify data.
                                For exploratory work, create a read-only Postgres role and use its credentials
                                in <Code>DATABASE_URL</Code>. Claude will be limited to exactly what that role can do.
                            </p>
                            <CodeBlock
                                label="supabase SQL editor"
                                code={`-- Run this in your Supabase SQL editor to create a safe read-only user
CREATE ROLE readonly_mcp WITH LOGIN PASSWORD 'choose-a-password';
GRANT CONNECT ON DATABASE postgres TO readonly_mcp;
GRANT USAGE ON SCHEMA public TO readonly_mcp;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_mcp;`}
                            />
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
