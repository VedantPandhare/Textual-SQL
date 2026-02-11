"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Database, Link as LinkIcon, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function SetupPage() {
    const [dbUrl, setDbUrl] = useState("");
    const [dbType, setDbType] = useState("postgresql");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
        type: "idle",
        message: "",
    });
    const router = useRouter();

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dbUrl.trim()) return;

        setLoading(true);
        setStatus({ type: "idle", message: "" });

        try {
            const response = await fetch("http://localhost:8000/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ db_url: dbUrl, db_type: dbType }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: "success", message: data.message || "Connected successfully!" });
                // Wait a bit before redirecting
                setTimeout(() => {
                    router.push("/chat");
                }, 1500);
            } else {
                setStatus({ type: "error", message: data.detail || "Failed to connect." });
            }
        } catch (error) {
            setStatus({ type: "error", message: "Could not reach the backend server." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-blue-500/30 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo/Icon Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 rounded-3xl bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.3)] animate-pulse">
                        <Database className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Get Started
                    </h1>
                    <p className="text-white/40 text-sm font-medium tracking-wide">
                        CONNECT YOUR DATABASE TO START CHATTING
                    </p>
                </div>

                {/* Card Section */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <form onSubmit={handleConnect} className="space-y-6 relative">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] font-bold text-white/30 ml-1">
                                Database Type
                            </label>
                            <select
                                value={dbType}
                                onChange={(e) => setDbType(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer hover:border-white/20"
                            >
                                <option value="postgresql">PostgreSQL (Supabase)</option>
                                <option value="sqlite">SQLite</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] font-bold text-white/30 ml-1">
                                Connection URL
                            </label>
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    value={dbUrl}
                                    onChange={(e) => setDbUrl(e.target.value)}
                                    placeholder="postgresql://user:pass@host:5432/db"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 pl-12 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/10 hover:border-white/20"
                                />
                                <LinkIcon className="absolute left-4 top-4.5 w-5 h-5 text-white/20 group-focus-within/input:text-blue-400 transition-colors" />
                            </div>
                        </div>

                        {status.message && (
                            <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
                                }`}>
                                {status.type === "success" ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                                <p className="text-sm font-medium">{status.message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !dbUrl.trim()}
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Connect Database
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium max-w-[280px] mx-auto leading-relaxed">
                    The connection URL will be validated and persisted for future sessions.
                </p>
            </div>
        </div>
    );
}
