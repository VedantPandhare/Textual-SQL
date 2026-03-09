"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Database, Terminal, Table as TableIcon, Bot, User, RefreshCcw, Loader2, Settings, Plus, Paperclip } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Message {
  role: "user" | "bot";
  content: string;
  sql?: string;
  results?: any[];
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Hello! I'm CRUDbot. I can help you explore and manage your database using natural language. What can I help you with today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/connection-status`);
      const data = await response.json();
      if (!data.connected) {
        router.push("/setup");
      } else {
        setCheckingConnection(false);
      }
    } catch (error) {
      console.error("Failed to check connection status:", error);
      setCheckingConnection(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: data.message || "Here are the results for your query:",
            sql: data.sql,
            results: data.results,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: `Error: ${data.detail || "Something went wrong"}` },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Failed to connect to the backend server. Please ensure FastAPI is running." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessages((prev) => [...prev, { role: "user", content: `Importing file: ${file.name}...` }]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/import`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: `✅ ${data.message}. You can now query the '${data.table_name}' table.`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: `❌ Import failed: ${data.detail || "Unknown error"}` },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "❌ Failed to connect to the backend server for file import." },
      ]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const indexSchema = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/index-schema`, { method: "POST" });
      const data = await resp.json();
      alert(data.message || "Schema indexed!");
    } catch (err) {
      alert("Failed to index schema.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingConnection) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-ring animate-spin" />
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">Initializing Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans selection:bg-ring/30">
      {/* Header */}
      <header className="border-b border-border p-4 flex justify-between items-center backdrop-blur-md bg-card/80 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-lg">
            <Database className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              CRUDbot
            </h1>
            <p className="text-xs text-muted-foreground font-medium tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-ring rounded-full animate-pulse" />
              INTELLIGENT ANALYTICS
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/setup")}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent rounded-lg text-sm transition-all border border-border active:scale-95 text-muted-foreground"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={indexSchema}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent rounded-lg text-sm transition-all border border-border active:scale-95 text-foreground"
          >
            <RefreshCcw className="w-4 h-4" />
            Sync Schema
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full scrollbar-hide" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${msg.role === "user" ? "bg-secondary border border-border" : "bg-primary/10 border border-primary/20"
              }`}>
              {msg.role === "user" ? <User className="w-5 h-5 text-foreground" /> : <Bot className="w-5 h-5 text-ring" />}
            </div>

            <div className={`flex flex-col gap-3 max-w-[85%] ${msg.role === "user" ? "items-end" : ""}`}>
              <div className={`p-4 rounded-2xl leading-relaxed text-[15px] ${msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg"
                : "bg-card border border-border rounded-tl-none backdrop-blur-md"
                }`}>
                {msg.content}
              </div>

              {msg.sql && (
                <div className="w-full bg-muted border border-border rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-secondary px-4 py-2 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                      <Terminal className="w-3.5 h-3.5" />
                      Generated SQL
                    </div>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm font-mono text-ring">
                    <code>{msg.sql}</code>
                  </pre>
                </div>
              )}

              {msg.results && msg.results.length > 0 && (
                <div className="w-full bg-muted border border-border rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-secondary px-4 py-2 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                      <TableIcon className="w-3.5 h-3.5" />
                      Query Results
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-border bg-secondary">
                          {Object.keys(msg.results[0]).map((key) => (
                            <th key={key} className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.results.map((row, idx) => (
                          <tr key={idx} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-4 py-3 text-foreground">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center">
              <Bot className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="h-12 bg-secondary border border-border rounded-3xl rounded-tl-none w-32" />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".csv, .xlsx, .xls"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query your database (e.g., 'Show me all orders from Alice')"
              className="w-full bg-input border border-border rounded-2xl px-6 py-5 pr-28 outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring/50 transition-all text-lg placeholder:text-muted-foreground/40 hover:border-border"
            />
            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || loading}
                className="p-3 bg-secondary border border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 transition-all active:scale-95"
                title="Import CSV or Excel"
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
              </button>
              <button
                type="submit"
                disabled={loading || !input.trim() || uploading}
                className="p-3 bg-primary rounded-xl text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all shadow-lg active:scale-95"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
