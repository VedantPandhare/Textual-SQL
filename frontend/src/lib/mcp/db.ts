import { Pool } from "pg";

export class DatabaseService {
    private pool: Pool;

    constructor() {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error("DATABASE_URL environment variable is required");
        }
        this.pool = new Pool({
            connectionString: dbUrl,
            ssl: dbUrl.includes("supabase") || dbUrl.includes("neon")
                ? { rejectUnauthorized: false }
                : false,
        });
    }

    async executeQuery(sql: string, params?: any[]): Promise<any[]> {
        const client = await this.pool.connect();
        try {
            const res = await client.query(sql, params);
            return res.rows;
        } finally {
            client.release();
        }
    }

    async executeWrite(sql: string, params?: any[]): Promise<number> {
        const client = await this.pool.connect();
        try {
            const res = await client.query(sql, params);
            return res.rowCount ?? 0;
        } finally {
            client.release();
        }
    }

    async getTableNames(): Promise<string[]> {
        const rows = await this.executeQuery(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        return rows.map((r) => r.table_name);
    }

    async getTableSchema(tableName: string): Promise<any[]> {
        return this.executeQuery(
            `SELECT column_name, data_type, is_nullable, column_default
             FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = $1
             ORDER BY ordinal_position`,
            [tableName]
        );
    }

    async getFullSchema(): Promise<string> {
        const tables = await this.getTableNames();
        const lines: string[] = [];
        for (const table of tables) {
            lines.push(`\nTable: ${table}`);
            const cols = await this.getTableSchema(table);
            for (const col of cols) {
                const nullable = col.is_nullable === "YES" ? "" : " NOT NULL";
                lines.push(`  - ${col.column_name} (${col.data_type})${nullable}`);
            }
        }
        return lines.join("\n");
    }

    async selectRows(
        tableName: string,
        columns?: string[],
        where?: string,
        limit = 100,
        offset = 0,
        orderBy?: string,
        ascending = true
    ): Promise<any[]> {
        const cols = columns?.length
            ? columns.map((c) => `"${c}"`).join(", ")
            : "*";
        let sql = `SELECT ${cols} FROM "${tableName}"`;
        if (where) sql += ` WHERE ${where}`;
        if (orderBy) sql += ` ORDER BY "${orderBy}" ${ascending ? "ASC" : "DESC"}`;
        sql += ` LIMIT ${limit} OFFSET ${offset}`;
        return this.executeQuery(sql);
    }

    async insertRow(tableName: string, data: Record<string, any>): Promise<any> {
        const keys = Object.keys(data);
        const cols = keys.map((k) => `"${k}"`).join(", ");
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
        const sql = `INSERT INTO "${tableName}" (${cols}) VALUES (${placeholders}) RETURNING *`;
        const rows = await this.executeQuery(sql, Object.values(data));
        return rows[0] ?? { success: true };
    }

    async updateRows(
        tableName: string,
        data: Record<string, any>,
        where: string
    ): Promise<{ rows_affected: number }> {
        const keys = Object.keys(data);
        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
        const sql = `UPDATE "${tableName}" SET ${setClause} WHERE ${where}`;
        const rowCount = await this.executeWrite(sql, Object.values(data));
        return { rows_affected: rowCount };
    }

    async deleteRows(
        tableName: string,
        where: string
    ): Promise<{ rows_deleted: number }> {
        const sql = `DELETE FROM "${tableName}" WHERE ${where}`;
        const rowCount = await this.executeWrite(sql);
        return { rows_deleted: rowCount };
    }
}
