import { Database } from "sqlite3";
import { Client } from "pg";
import { promisify } from "util";

export class DatabaseService {
    private type: "sqlite" | "postgres";
    private url: string;

    constructor() {
        this.url = process.env.DATABASE_URL || "sqlite:./chinook.db";
        this.type = this.url.startsWith("postgres") ? "postgres" : "sqlite";
    }

    async executeQuery(sql: string): Promise<any[]> {
        if (this.type === "sqlite") {
            const dbPath = this.url.replace("sqlite:", "");
            const db = new Database(dbPath);
            const all = promisify(db.all).bind(db);
            try {
                const results = await all(sql);
                db.close();
                return results as any[];
            } catch (err) {
                db.close();
                throw err;
            }
        } else {
            const client = new Client({ connectionString: this.url });
            await client.connect();
            try {
                const res = await client.query(sql);
                await client.end();
                return res.rows;
            } catch (err) {
                await client.end();
                throw err;
            }
        }
    }

    async getSchema(): Promise<string> {
        let schemaText = "";
        if (this.type === "sqlite") {
            const tables = await this.executeQuery("SELECT name FROM sqlite_master WHERE type='table'");
            for (const table of tables) {
                schemaText += `\nTable: ${table.name}\nColumns:\n`;
                const columns = await this.executeQuery(`PRAGMA table_info(${table.name})`);
                for (const col of columns) {
                    schemaText += `  - ${col.name} (${col.type})\n`;
                }
            }
        } else {
            const tables = await this.executeQuery(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
            for (const table of tables) {
                schemaText += `\nTable: ${table.table_name}\nColumns:\n`;
                const columns = await this.executeQuery(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = '${table.table_name}'
        `);
                for (const col of columns) {
                    schemaText += `  - ${col.column_name} (${col.data_type})\n`;
                }
            }
        }
        return schemaText;
    }
}
