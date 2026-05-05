import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Engine

load_dotenv()


class DatabaseEngine:
    def __init__(self):
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            raise ValueError("DATABASE_URL environment variable is required")
        self.engine: Engine = create_engine(db_url)

    def ping(self) -> bool:
        """Test the connection. Called lazily, not at startup."""
        with self.engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True

    def get_table_names(self) -> List[str]:
        return inspect(self.engine).get_table_names()

    def get_table_schema(self, table_name: str) -> List[Dict]:
        cols = inspect(self.engine).get_columns(table_name)
        return [
            {
                "name": col["name"],
                "type": str(col["type"]),
                "nullable": col.get("nullable", True),
            }
            for col in cols
        ]

    def get_full_schema(self) -> str:
        inspector = inspect(self.engine)
        lines = []
        for table in inspector.get_table_names():
            lines.append(f"\nTable: {table}")
            for col in inspector.get_columns(table):
                nullable = "" if col.get("nullable", True) else " NOT NULL"
                lines.append(f"  - {col['name']} ({col['type']}){nullable}")
        return "\n".join(lines)

    def execute_query(self, sql: str) -> List[Dict]:
        with self.engine.connect() as conn:
            with conn.begin():
                result = conn.execute(text(sql))
                if result.returns_rows:
                    keys = list(result.keys())
                    return [dict(zip(keys, row)) for row in result.all()]
                return [{"rows_affected": result.rowcount}]

    def select_rows(
        self,
        table_name: str,
        columns: Optional[List[str]] = None,
        where: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        order_by: Optional[str] = None,
        ascending: bool = True,
    ) -> List[Dict]:
        cols = ", ".join(f'"{c}"' for c in columns) if columns else "*"
        sql = f'SELECT {cols} FROM "{table_name}"'
        if where:
            sql += f" WHERE {where}"
        if order_by:
            direction = "ASC" if ascending else "DESC"
            sql += f' ORDER BY "{order_by}" {direction}'
        sql += f" LIMIT {limit} OFFSET {offset}"
        return self.execute_query(sql)

    def insert_row(self, table_name: str, data: Dict[str, Any]) -> Dict:
        keys = list(data.keys())
        cols = ", ".join(f'"{k}"' for k in keys)
        placeholders = ", ".join(f":{k}" for k in keys)
        sql = f'INSERT INTO "{table_name}" ({cols}) VALUES ({placeholders})'
        with self.engine.connect() as conn:
            with conn.begin():
                conn.execute(text(sql), data)
        return {"success": True, "message": f"Row inserted into {table_name}"}

    def update_rows(self, table_name: str, data: Dict[str, Any], where: str) -> Dict:
        set_clause = ", ".join(f'"{k}" = :{k}' for k in data.keys())
        sql = f'UPDATE "{table_name}" SET {set_clause} WHERE {where}'
        with self.engine.connect() as conn:
            with conn.begin():
                result = conn.execute(text(sql), data)
        return {"success": True, "rows_affected": result.rowcount}

    def delete_rows(self, table_name: str, where: str) -> Dict:
        sql = f'DELETE FROM "{table_name}" WHERE {where}'
        with self.engine.connect() as conn:
            with conn.begin():
                result = conn.execute(text(sql))
        return {"success": True, "rows_deleted": result.rowcount}
