"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Database, Lock, Cpu } from "lucide-react";
import { DottedSurface } from "@/components/DottedSurface";

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen text-foreground overflow-hidden flex flex-col items-center justify-center p-6 bg-background">
            <DottedSurface className="z-0 opacity-20" />

            <div className="relative z-10 max-w-3xl w-full space-y-12 text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold tracking-[0.3em] uppercase text-ring">
                    <Database className="w-3 h-3" />
                    MCP Server · Local · Open Source
                </div>

                {/* Headline */}
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                        Database<br />
                        <span className="text-ring">MCP Server</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Give Claude Desktop direct access to your PostgreSQL or Supabase database —
                        runs locally on your machine, your credentials never leave.
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => router.push("/mcp")}
                        className="group px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-lg text-base"
                    >
                        Setup Guide
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                        href="https://github.com/VedantPandhare/Textual-SQL"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-secondary border border-border text-muted-foreground font-bold rounded-xl hover:bg-accent transition-all active:scale-95 text-base"
                    >
                        View on GitHub
                    </a>
                </div>

                {/* Feature pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    {[
                        {
                            icon: <Lock className="w-5 h-5" />,
                            title: "Credentials Stay Local",
                            desc: "Your database password never touches a third-party server.",
                        },
                        {
                            icon: <Cpu className="w-5 h-5" />,
                            title: "No LLM Middleware",
                            desc: "Claude speaks directly to your database through MCP tools.",
                        },
                        {
                            icon: <Database className="w-5 h-5" />,
                            title: "PostgreSQL & Supabase",
                            desc: "Works with any PostgreSQL-compatible connection string.",
                        },
                    ].map((f) => (
                        <div
                            key={f.title}
                            className="p-5 bg-card border border-border rounded-2xl text-left space-y-2 hover:border-ring/30 transition-colors group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-ring group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                {f.icon}
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{f.title}</p>
                            <p className="text-sm text-muted-foreground/80 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
