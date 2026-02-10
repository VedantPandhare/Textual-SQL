from db_engine import DatabaseEngine
import os
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    print("Testing Database Connection...")
    try:
        db = DatabaseEngine()
        print(f"URL: {db.db_url}")
        print(f"Type: {db.db_type}")
        
        print("\nAttempting to get table names...")
        tables = db.get_table_names()
        print(f"Tables found: {tables}")
        
        print("\nAttempting to get schema...")
        schema = db.get_schema()
        print("Schema retrieved successfully (first 100 chars):")
        print(schema[:100] + "...")
        
    except Exception as e:
        print(f"\n❌ CONNECTION FAILED!")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_connection()
