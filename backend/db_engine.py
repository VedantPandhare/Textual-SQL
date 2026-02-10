import sqlite3
import pandas as pd
from typing import List, Dict, Any
from sqlalchemy import create_engine, text, inspect
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseEngine:
    def __init__(self, db_url: str = None):
        """
        Initialize database engine with support for SQLite and PostgreSQL.
        
        Args:
            db_url: Database URL. If None, reads from DATABASE_URL env variable.
                   SQLite: sqlite:///./chinook.db
                   PostgreSQL: postgresql://user:password@host:port/database
        """
        self.db_url = db_url or os.getenv("DATABASE_URL", "sqlite:///./chinook.db")
        self.db_type = os.getenv("DATABASE_TYPE", "sqlite")
        self.engine = create_engine(self.db_url)

    def execute_query(self, sql: str) -> List[Dict[str, Any]]:
        """Executes a SQL query and returns results as a list of dicts."""
        try:
            with self.engine.connect() as conn:
                # Use a transaction for operations like INSERT, UPDATE, ALTER
                with conn.begin():
                    result = conn.execute(text(sql))
                    
                    if result.returns_rows:
                        # For SELECT statements
                        rows = result.all()
                        if not rows:
                            return []
                        df = pd.DataFrame(rows, columns=result.keys())
                        return df.to_dict(orient='records')
                    else:
                        # For INSERT, UPDATE, DELETE, ALTER, etc.
                        return [{"message": "Operation successful", "rows_affected": result.rowcount}]
        except Exception as e:
            raise Exception(f"Query execution failed: {str(e)}")

    def get_schema(self) -> str:
        """Returns the full schema of the database as a string."""
        inspector = inspect(self.engine)
        schema_text = ""
        
        for table_name in inspector.get_table_names():
            columns = inspector.get_columns(table_name)
            schema_text += f"\nTable: {table_name}\n"
            schema_text += f"Columns:\n"
            
            for col in columns:
                schema_text += f"  - {col['name']} ({col['type']})\n"
            
            # Get sample data
            try:
                with self.engine.connect() as conn:
                    sample_query = text(f"SELECT * FROM {table_name} LIMIT 3")
                    result = conn.execute(sample_query)
                    sample_data = result.fetchall()
                    if sample_data:
                        schema_text += f"Sample Data: {sample_data[:3]}\n"
            except:
                pass
                
        return schema_text

    def get_table_names(self) -> List[str]:
        inspector = inspect(self.engine)
        return inspector.get_table_names()
