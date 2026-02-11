"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Database, Code, Shield, Zap } from "lucide-react";
import { DottedSurface } from "@/components/DottedSurface";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#0a0a0b] text-white overflow-hidden flex flex-col items-center justify-center p-6 text-center">
      {/* Background Effect */}
      <DottedSurface />

      <div className="z-10 max-w-4xl space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-[0.3em] uppercase text-blue-400 mb-4">
          <Zap className="w-3 h-3 fill-current" />
          RAG-Powered Intelligence
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
          TEXTUAL<br />
          <span className="bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">
            SQL
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
          Bridge the gap between natural language and complex databases.
          Talk to your data in plain English and let AI handle the query generation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button
            onClick={() => router.push("/setup")}
            className="group relative px-8 py-5 bg-white text-black text-lg font-bold rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => window.open("https://github.com/VedantPandhare/Textual-SQL", "_blank")}
            className="px-8 py-5 bg-white/5 border border-white/10 text-lg font-bold rounded-2xl flex items-center gap-3 transition-all hover:bg-white/10 active:scale-95 text-white/60"
          >
            View Github
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20">
          {[
            { icon: <Database />, title: "Schema Aware", desc: "Instantly indexes your database schema for accurate queries." },
            { icon: <Code />, title: "SQL Generation", desc: "Converts natural language to optimized SQL in seconds." },
            { icon: <Shield />, title: "Secure Access", desc: "Uses standard pooler connections with local persistence." }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left space-y-3 backdrop-blur-sm transition-all hover:border-blue-500/50 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold font-sans uppercase tracking-widest text-[10px] text-white/40">{feature.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-white/20 uppercase tracking-[0.4em] font-black">
        Vedant Pandhare • Next.js • FastAPI • Groq
      </p>
    </div>
  );
}
