import sqlite3
import pandas as pd
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.engine import Engine
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
        self.engine: Optional[Engine] = None
        self._initialize_engine()

    def _initialize_engine(self):
        """Sets up the SQLAlchemy engine."""
        if not self.db_url:
            self.engine = None
            return
            
        try:
            self.engine = create_engine(self.db_url)
            # Test connection immediately
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            print(f"⚠️ Warning: Connection to database failed during initialization: {str(e)}")
            self.engine = None

    def update_connection(self, db_url: str, db_type: str = "postgresql") -> bool:
        """Updates the database connection URL and re-initializes the engine."""
        try:
            # Validate URL by trying to create an engine and connect
            test_engine = create_engine(db_url)
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            # If successful, update state
            self.db_url = db_url
            self.db_type = db_type
            self.engine = test_engine
            
            # Optionally update .env file
            self._update_env_file(db_url, db_type)
            return True
        except Exception as e:
            raise Exception(f"Failed to connect with provided URL: {str(e)}")

    def _update_env_file(self, db_url: str, db_type: str):
        """Persists the new connection details to .env."""
        try:
            env_path = os.path.join(os.getcwd(), ".env")
            lines = []
            if os.path.exists(env_path):
                with open(env_path, "r") as f:
                    lines = f.readlines()
            
            new_lines = []
            db_url_found = False
            db_type_found = False
            
            for line in lines:
                if line.startswith("DATABASE_URL="):
                    new_lines.append(f"DATABASE_URL={db_url}\n")
                    db_url_found = True
                elif line.startswith("DATABASE_TYPE="):
                    new_lines.append(f"DATABASE_TYPE={db_type}\n")
                    db_type_found = True
                else:
                    new_lines.append(line)
            
            if not db_url_found:
                new_lines.append(f"DATABASE_URL={db_url}\n")
            if not db_type_found:
                new_lines.append(f"DATABASE_TYPE={db_type}\n")
                
            with open(env_path, "w") as f:
                f.writelines(new_lines)
        except Exception as e:
            print(f"⚠️ Could not update .env file: {str(e)}")

    def is_connected(self) -> bool:
        """Checks if the database engine is initialized and responsive."""
        if not self.engine:
            return False
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except:
            return False

    def execute_query(self, sql: str) -> List[Dict[str, Any]]:
        """Executes a SQL query and returns results as a list of dicts."""
        if not self.is_connected():
            raise Exception("Database not connected. Please configure connection.")
            
        try:
            with self.engine.connect() as conn:
                with conn.begin():
                    result = conn.execute(text(sql))
                    
                    if result.returns_rows:
                        rows = result.all()
                        if not rows:
                            return []
                        df = pd.DataFrame(rows, columns=result.keys())
                        return df.to_dict(orient='records')
                    else:
                        return [{"message": "Operation successful", "rows_affected": result.rowcount}]
        except Exception as e:
            raise Exception(f"Query execution failed: {str(e)}")

    def get_schema(self) -> str:
        """Returns the full schema of the database as a string."""
        if not self.is_connected():
            return "Database not connected."
            
        inspector = inspect(self.engine)
        schema_text = ""
        
        for table_name in inspector.get_table_names():
            columns = inspector.get_columns(table_name)
            schema_text += f"\nTable: {table_name}\n"
            schema_text += f"Columns:\n"
            
            for col in columns:
                schema_text += f"  - {col['name']} ({col['type']})\n"
            
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
        if not self.is_connected():
            return []
        inspector = inspect(self.engine)
        return inspector.get_table_names()
