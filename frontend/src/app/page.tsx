"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Database, Code, Shield, Plug } from "lucide-react";
import { DottedSurface } from "@/components/DottedSurface";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen text-foreground overflow-hidden flex flex-col items-center justify-center p-6 text-center bg-background">
      {/* Background Layer */}
      <DottedSurface className="z-0 opacity-25" />

      <div className="relative z-10 max-w-4xl space-y-8 animate-in fade-in zoom-in duration-1000">

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
          QuerySense<br />
          <span className="text-ring">
            DB
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
          Bridge the gap between natural language and complex databases.
          Talk to your data in plain English and let AI handle the query generation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button
            onClick={() => router.push("/setup")}
            className="group relative px-10 py-4 bg-primary text-primary-foreground text-base font-semibold rounded-xl flex items-center gap-3 transition-all hover:scale-[1.03] active:scale-95 shadow-lg"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative">
            <button
              onClick={() => router.push("/mcp")}
              className="px-8 py-4 bg-secondary border border-border text-base font-semibold rounded-xl flex items-center gap-3 transition-all hover:bg-accent active:scale-95 text-secondary-foreground group"
            >
              <Plug className="w-4 h-4 group-hover:rotate-12 transition-transform text-ring" />
              MCP Server
            </button>
            <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[9px] font-bold shadow-sm">
              HYBRID
            </span>
          </div>

          <button
            onClick={() => window.open("https://github.com/VedantPandhare/Textual-SQL", "_blank")}
            className="px-8 py-4 bg-secondary border border-border text-base font-semibold rounded-xl flex items-center gap-3 transition-all hover:bg-accent active:scale-95 text-muted-foreground"
          >
            View Github
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-20">
          {[
            { icon: <Database className="w-5 h-5" />, title: "Schema Aware", desc: "Instantly indexes your database schema for accurate queries." },
            { icon: <Code className="w-5 h-5" />, title: "SQL Generation", desc: "Converts natural language to optimized SQL in seconds." },
            { icon: <Shield className="w-5 h-5" />, title: "Secure Access", desc: "Uses standard pooler connections with local persistence." }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-card border border-border rounded-2xl text-left space-y-3 backdrop-blur-sm transition-all hover:border-ring/50 group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-ring group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                {feature.icon}
              </div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{feature.title}</h3>
              <p className="text-sm text-popover-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
