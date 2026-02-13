import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DatabaseService } from "./db";

export class SQLAgent {
    private llm: ChatGroq;
    private db: DatabaseService;

    constructor(db: DatabaseService) {
        this.db = db;
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY not found in environment variables");
        }
        this.llm = new ChatGroq({
            model: "llama-3.3-70b-versatile",
            apiKey: apiKey,
            temperature: 0,
        });
    }

    async generateAndExecute(userQuery: string) {
        // Porting RAG logic (Simple version for now: get full schema)
        const schemaContext = await this.db.getSchema();

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", `You are a SQL expert. 
Given the database schema context below, translate the user's natural language question into a standard SQL query.

Guidelines:
- Return ONLY the SQL code.
- Do not include any explanation or markdown formatting like \`\`\`sql.
- Use ONLY the tables and columns provided in the context.
- If the question cannot be answered with the given schema, return 'I cannot answer this question with the available data.'
`],
            ["human", `Schema Context:
{schemaContext}

User Question: {userQuery}`],
        ]);

        try {
            const chain = prompt.pipe(this.llm);
            const response = await chain.invoke({
                schemaContext: schemaContext,
                userQuery: userQuery,
            });

            const sqlQuery = (response.content as string)
                .replace(/```sql/g, "")
                .replace(/```/g, "")
                .trim();

            if (sqlQuery.includes("I cannot answer")) {
                return { sql: null, results: [], message: sqlQuery };
            }

            const results = await this.db.executeQuery(sqlQuery);
            return {
                sql: sqlQuery,
                results: results,
                provider: "Groq",
            };
        } catch (err: any) {
            return { error: err.message };
        }
    }
}
