import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { DatabaseService } from "@/lib/mcp/db";
import { SQLAgent } from "@/lib/mcp/agent";

const db = new DatabaseService();
const agent = new SQLAgent(db);

export const POST = createMcpHandler(async (server) => {
    server.tool(
        "query_database",
        "Ask a natural language question about the database. Uses RAG and LLM to generate SQL.",
        {
            question: z.string().describe("The user's question in plain English."),
        },
        async ({ question }) => {
            try {
                const result = await agent.generateAndExecute(question);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            } catch (err: any) {
                return {
                    content: [{ type: "text", text: `Error: ${err.message}` }],
                    isError: true,
                };
            }
        }
    );

    server.tool(
        "execute_sql",
        "Directly execute a SQL query against the database.",
        {
            sql: z.string().describe("The raw SQL query to run."),
        },
        async ({ sql }) => {
            try {
                const results = await db.executeQuery(sql);
                return {
                    content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
                };
            } catch (err: any) {
                return {
                    content: [{ type: "text", text: `Error: ${err.message}` }],
                    isError: true,
                };
            }
        }
    );
});

// Optional: Add a GET handler to provide basic info or setup guide
export async function GET() {
    return new Response(JSON.stringify({
        name: "QuerySense Hybrid MCP Server",
        version: "1.0.0",
        status: "active",
        transport: "Streamable HTTP"
    }), {
        headers: { "Content-Type": "application/json" }
    });
}
