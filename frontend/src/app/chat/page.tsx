"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Database, Terminal, Table as TableIcon, Bot, User, RefreshCcw, Loader2, Settings } from "lucide-react";

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
  const [checkingConnection, setCheckingConnection] = useState(true);
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
      <div className="h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Initializing Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0b] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-white/10 p-4 flex justify-between items-center backdrop-blur-md bg-black/20 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              CRUDbot
            </h1>
            <p className="text-xs text-white/40 font-medium tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              RAG-POWERED ANALYTICS
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/setup")}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all border border-white/10 active:scale-95 text-white/60"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={indexSchema}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all border border-white/10 active:scale-95"
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
            <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${msg.role === "user" ? "bg-white/10 border border-white/10" : "bg-blue-600/10 border border-blue-500/20"
              }`}>
              {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-blue-400" />}
            </div>

            <div className={`flex flex-col gap-3 max-w-[85%] ${msg.role === "user" ? "items-end" : ""}`}>
              <div className={`p-4 rounded-2xl leading-relaxed text-[15px] ${msg.role === "user"
                ? "bg-blue-600 text-white rounded-tr-none shadow-[0_4px_20px_rgba(37,99,235,0.25)]"
                : "bg-white/[0.03] border border-white/10 rounded-tl-none backdrop-blur-md"
                }`}>
                {msg.content}
              </div>

              {msg.sql && (
                <div className="w-full bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs font-mono text-white/60 uppercase tracking-widest">
                      <Terminal className="w-3.5 h-3.5" />
                      Generated SQL
                    </div>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm font-mono text-blue-300">
                    <code>{msg.sql}</code>
                  </pre>
                </div>
              )}

              {msg.results && msg.results.length > 0 && (
                <div className="w-full bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs font-mono text-white/60 uppercase tracking-widest">
                      <TableIcon className="w-3.5 h-3.5" />
                      Query Results
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          {Object.keys(msg.results[0]).map((key) => (
                            <th key={key} className="px-4 py-3 font-semibold text-white/40 uppercase tracking-wider text-[10px]">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.results.map((row, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-4 py-3 text-white/80">{String(val)}</td>
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
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white/20" />
            </div>
            <div className="h-12 bg-white/5 border border-white/10 rounded-3xl rounded-tl-none w-32" />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b] to-transparent">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query your database (e.g., 'Show me all orders from Alice')"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-14 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg placeholder:text-white/20 hover:border-white/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-3 top-3 p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <p className="text-center text-[10px] text-white/20 mt-4 uppercase tracking-[0.2em] font-medium">
            Next.js 16 • FastAPI • Groq Llama 3 • RAG Architecture
          </p>
        </div>
      </div>
    </div>
  );
}
