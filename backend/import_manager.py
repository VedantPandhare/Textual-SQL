import pandas as pd
import os
import re
from sqlalchemy import text
from db_engine import DatabaseEngine

class ImportManager:
    def __init__(self, db_engine: DatabaseEngine):
        self.db_engine = db_engine

    def sanitize_table_name(self, filename: str) -> str:
        """Sanitizes filename to be a valid SQL table name."""
        # Remove extension
        name = os.path.splitext(filename)[0]
        # Replace non-alphanumeric characters with underscores
        name = re.sub(r'[^a-zA-Z0-9]', '_', name)
        # Ensure it starts with a letter or underscore
        if not re.match(r'^[a-zA-Z_]', name):
            name = 't_' + name
        return name.lower()

    async def process_and_sync(self, file_content: bytes, filename: str) -> dict:
        """Parses file and syncs it to the database."""
        try:
            table_name = self.sanitize_table_name(filename)
            
            # Read file based on extension
            if filename.endswith('.csv'):
                from io import BytesIO
                df = pd.read_csv(BytesIO(file_content))
            elif filename.endswith(('.xlsx', '.xls')):
                from io import BytesIO
                df = pd.read_excel(BytesIO(file_content))
            else:
                return {"success": False, "error": "Unsupported file format. Please use CSV or Excel."}

            if df.empty:
                return {"success": False, "error": "The uploaded file is empty."}

            # Sync to database
            # We use the db_engine's sqlalchemy engine
            if not self.db_engine.engine:
                return {"success": False, "error": "Database not connected."}

            # Write to SQL
            df.to_sql(table_name, self.db_engine.engine, if_exists='replace', index=False)
            
            return {
                "success": True, 
                "message": f"Successfully imported '{filename}' as table '{table_name}'",
                "table_name": table_name,
                "rows_imported": len(df)
            }

        except Exception as e:
            print(f"❌ Error in ImportManager: {str(e)}")
            return {"success": False, "error": f"Import failed: {str(e)}"}
