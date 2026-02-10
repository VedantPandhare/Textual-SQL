from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

def test_alt():
    # Try with just 'postgres' and project ref in the password if needed, or other variations
    # But usually pooler is postgres.ref
    url = "postgresql://postgres:Supabase007@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"
    print(f"Testing with URL: {url.replace('Supabase007', '****')}")
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"Success! {result.fetchone()}")
    except Exception as e:
        print(f"Failed: {str(e)}")

if __name__ == "__main__":
    test_alt()
