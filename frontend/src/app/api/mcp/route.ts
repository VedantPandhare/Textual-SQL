import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { DatabaseService } from "@/lib/mcp/db";

export const maxDuration = 60;

export const POST = createMcpHandler(async (server) => {
    const db = new DatabaseService();

    server.tool(
        "list_tables",
        "List all tables in the connected database.",
        {},
        async () => {
            const tables = await db.getTableNames();
            return { content: [{ type: "text", text: JSON.stringify(tables) }] };
        }
    );

    server.tool(
        "describe_table",
        "Get columns and their data types for a specific table.",
        {
            table_name: z.string().describe("Name of the table to inspect."),
        },
        async ({ table_name }) => {
            const schema = await db.getTableSchema(table_name);
            return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
        }
    );

    server.tool(
        "get_schema",
        "Get the complete schema of all tables in the database.",
        {},
        async () => {
            const schema = await db.getFullSchema();
            return { content: [{ type: "text", text: schema }] };
        }
    );

    server.tool(
        "execute_sql",
        "Execute a raw SQL query and return results.",
        {
            sql: z.string().describe("SQL to execute (SELECT, INSERT, UPDATE, DELETE, etc.)"),
        },
        async ({ sql }) => {
            try {
                const results = await db.executeQuery(sql);
                return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
            } catch (err: any) {
                return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
            }
        }
    );

    server.tool(
        "select_rows",
        "Select rows from a table with optional filtering, sorting, and pagination.",
        {
            table_name: z.string().describe("Table to query."),
            columns: z.array(z.string()).optional().describe("Column names to return. Omit for all columns."),
            where: z.string().optional().describe("SQL WHERE clause without the WHERE keyword. E.g. \"status = 'active'\"."),
            limit: z.number().default(100).describe("Max rows to return (default 100)."),
            offset: z.number().default(0).describe("Rows to skip for pagination (default 0)."),
            order_by: z.string().optional().describe("Column to sort by."),
            ascending: z.boolean().default(true).describe("True for ASC, False for DESC (default true)."),
        },
        async ({ table_name, columns, where, limit, offset, order_by, ascending }) => {
            try {
                const results = await db.selectRows(table_name, columns, where, limit, offset, order_by, ascending);
                return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
            } catch (err: any) {
                return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
            }
        }
    );

    server.tool(
        "insert_row",
        "Insert a new row into a database table.",
        {
            table_name: z.string().describe("Table to insert into."),
            data: z.record(z.string(), z.any()).describe("Object mapping column names to values."),
        },
        async ({ table_name, data }) => {
            try {
                const result = await db.insertRow(table_name, data);
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (err: any) {
                return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
            }
        }
    );

    server.tool(
        "update_rows",
        "Update rows in a table matching the WHERE condition.",
        {
            table_name: z.string().describe("Table to update."),
            data: z.record(z.string(), z.any()).describe("Object mapping column names to new values."),
            where: z.string().describe("SQL WHERE clause without WHERE. E.g. \"id = '123'\"."),
        },
        async ({ table_name, data, where }) => {
            try {
                const result = await db.updateRows(table_name, data, where);
                return { content: [{ type: "text", text: JSON.stringify(result) }] };
            } catch (err: any) {
                return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
            }
        }
    );

    server.tool(
        "delete_rows",
        "Delete rows from a table matching the WHERE condition.",
        {
            table_name: z.string().describe("Table to delete from."),
            where: z.string().describe("SQL WHERE clause without WHERE. E.g. \"id = '123'\"."),
        },
        async ({ table_name, where }) => {
            try {
                const result = await db.deleteRows(table_name, where);
                return { content: [{ type: "text", text: JSON.stringify(result) }] };
            } catch (err: any) {
                return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
            }
        }
    );
});

export async function GET() {
    return Response.json({
        name: "Database MCP Server",
        version: "1.0.0",
        status: "active",
        transport: "Streamable HTTP",
        tools: [
            "list_tables",
            "describe_table",
            "get_schema",
            "execute_sql",
            "select_rows",
            "insert_row",
            "update_rows",
            "delete_rows",
        ],
    });
}
