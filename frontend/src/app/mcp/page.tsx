"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plug, Monitor, Terminal, Database, Shield } from "lucide-react";
import { DottedSurface } from "@/components/DottedSurface";

export default function MCPDocsPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen text-white overflow-hidden flex flex-col items-center p-6 py-20">
            {/* Background Layer */}
            <div className="absolute inset-0 bg-[#0a0a0b] -z-20" />
            <DottedSurface className="z-0 opacity-20" />

            <div className="relative z-10 max-w-4xl w-full space-y-12">
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold tracking-[0.3em] uppercase text-blue-400">
                        <Plug className="w-3 h-3" />
                        Extensibility Protocol
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                        Model Context <span className="text-blue-500">Protocol</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
                        Connect QuerySense DB directly to your favorite AI tools like Claude Desktop or Cursor.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold">Hybrid Power-App (Native)</h2>
                        <div className="space-y-4 text-white/60">
                            <p>1. Your MCP server is now built directly into the frontend.</p>
                            <p>2. No separate backend deployment required for AI tools.</p>
                            <p>3. Update Claude config with your Next.js URL:</p>
                            <pre className="p-4 bg-black/40 rounded-xl text-[11px] font-mono border border-white/5 overflow-x-auto text-blue-300">
                                {`{
  "mcpServers": {
    "querysense": {
      "type": "http",
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}`}
                            </pre>
                            <p className="text-xs italic text-white/30">※ This hybrid model combines LLM intelligence with Vercel's high-speed transport.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-blue-400" />
                                <h3 className="font-bold uppercase tracking-widest text-xs text-white/40">Tool Access</h3>
                            </div>
                            <p className="text-sm text-white/70">Your AI assistant will gain access to tools like <span className="text-blue-400 font-mono">query_database</span> and <span className="text-blue-400 font-mono">execute_sql</span>.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <Database className="w-5 h-5 text-indigo-400" />
                                <h3 className="font-bold uppercase tracking-widest text-xs text-white/40">Schema Resource</h3>
                            </div>
                            <p className="text-sm text-white/70">Models can browse the <span className="text-indigo-400 font-mono">sqlite://schema</span> resource to understand your data structure.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-bold uppercase tracking-widest text-xs text-white/40">Secure & Local</h3>
                            </div>
                            <p className="text-sm text-white/70">Data never leaves your machine unless explicitly requested by the model through your AI provider.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
