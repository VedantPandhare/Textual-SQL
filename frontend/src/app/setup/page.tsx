"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Link as LinkIcon, AlertCircle, CheckCircle2, Loader2, ArrowRight, PlayCircle, Eye, EyeOff } from "lucide-react";
import { DottedSurface } from "@/components/DottedSurface";

export default function SetupPage() {
    const [dbUrl, setDbUrl] = useState("");
    const [dbType, setDbType] = useState("postgresql");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isDemo, setIsDemo] = useState(false);
    const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
        type: "idle",
        message: "",
    });
    const router = useRouter();

    const handleConnect = async (e?: React.FormEvent, customUrl?: string) => {
        if (e) e.preventDefault();
        const finalUrl = customUrl || dbUrl;

        if (!finalUrl.trim() || finalUrl === "(Demo Database Connected)") {
            if (!customUrl) return;
        }

        setLoading(true);
        setStatus({ type: "idle", message: "" });

        try {
            const response = await fetch("http://localhost:8000/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ db_url: finalUrl, db_type: dbType }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: "success", message: data.message || "Connected successfully!" });
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

    const handleDemo = () => {
        const demoUrl = "postgresql://postgres.yedvxjptltirkwgtvehp:Supabase007@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
        setIsDemo(true);
        setDbUrl("(Demo Database Connected)");
        handleConnect(undefined, demoUrl);
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-blue-500/30 flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0b]">
            {/* Background Layer */}
            <DottedSurface className="z-0 opacity-60" />

            <div className="max-w-md w-full space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Logo/Icon Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 rounded-3xl bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-transform hover:scale-110 duration-500">
                        <Database className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                        Get Started
                    </h1>
                    <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase">
                        PROVISION YOUR DATA ENGINE
                    </p>
                </div>

                {/* Card Section */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group border-white/5 hover:border-white/10 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="space-y-6 relative">
                        {/* Demo Button */}
                        <button
                            onClick={handleDemo}
                            className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group/demo border ${isDemo
                                    ? "bg-blue-600 text-white border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60 hover:text-white"
                                }`}
                        >
                            <PlayCircle className={`w-5 h-5 transition-transform ${isDemo ? "animate-pulse" : "group-hover:scale-110"}`} />
                            {isDemo ? "Demo Data Connected" : "Try on the Demo data"}
                        </button>

                        <div className="flex items-center gap-4 py-2">
                            <div className="h-[1px] flex-1 bg-white/10" />
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">MANUAL CONFIGURATION</span>
                            <div className="h-[1px] flex-1 bg-white/10" />
                        </div>

                        <form onSubmit={(e) => handleConnect(e)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20 ml-1">
                                    Database Type
                                </label>
                                <select
                                    value={dbType}
                                    onChange={(e) => setDbType(e.target.value)}
                                    disabled={isDemo}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer hover:border-white/20 disabled:opacity-50"
                                >
                                    <option value="postgresql">PostgreSQL (Supabase)</option>
                                    <option value="sqlite">SQLite</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20 ml-1">
                                    Transaction pooler URL
                                </label>
                                <div className="relative group/input">
                                    <input
                                        type={showPassword || isDemo ? "text" : "password"}
                                        value={dbUrl}
                                        onChange={(e) => {
                                            setDbUrl(e.target.value);
                                            if (isDemo) setIsDemo(false);
                                        }}
                                        placeholder="postgresql://user:pass@host:6543/db"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 pl-12 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/5 hover:border-white/20 disabled:text-blue-400"
                                    />
                                    <LinkIcon className="absolute left-4 top-4.5 w-5 h-5 text-white/20 group-focus-within/input:text-blue-400 transition-colors" />
                                    {!isDemo && dbUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-4.5 text-white/20 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    )}
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
                                disabled={loading || !dbUrl.trim() || dbUrl === "(Demo Database Connected)"}
                                className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.98] shadow-xl text-sm tracking-widest uppercase"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Establish Connection
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.4em] font-black max-w-[280px] mx-auto leading-relaxed">
                    SECURED • ENCRYPTED • PERSISTED
                </p>
            </div>
        </div>
    );
}
