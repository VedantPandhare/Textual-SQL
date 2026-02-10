from sqlalchemy import create_engine, text, inspect
import os
from dotenv import load_dotenv

load_dotenv()

def setup_database():
    db_url = os.getenv("DATABASE_URL", "sqlite:///./chinook.db")
    print(f"Connecting to: {db_url.split('@')[-1] if '@' in db_url else db_url}")
    engine = create_engine(db_url)
    
    with engine.begin() as conn:
        # Create Tables
        print("Creating tables...")
        conn.execute(text('''
        CREATE TABLE IF NOT EXISTS Users (
            id SERIAL PRIMARY KEY,
            name TEXT,
            email TEXT,
            role TEXT
        )
        '''))
        
        conn.execute(text('''
        CREATE TABLE IF NOT EXISTS Orders (
            order_id SERIAL PRIMARY KEY,
            user_id INTEGER,
            product_name TEXT,
            amount REAL,
            order_date DATE,
            FOREIGN KEY (user_id) REFERENCES Users(id)
        )
        '''))
        
        # Check if data exists
        result = conn.execute(text("SELECT COUNT(*) FROM Users"))
        count = result.scalar()
        if count == 0:
            print("Inserting sample data...")
            # Insert sample data
            conn.execute(text("INSERT INTO Users (id, name, email, role) VALUES (:id, :name, :email, :role)"),
                         [{"id": 1, "name": 'Alice Smith', "email": 'alice@example.com', "role": 'Admin'},
                          {"id": 2, "name": 'Bob Johnson', "email": 'bob@example.com', "role": 'User'},
                          {"id": 3, "name": 'Charlie Brown', "email": 'charlie@example.com', "role": 'User'}])
            
            conn.execute(text("INSERT INTO Orders (order_id, user_id, product_name, amount, order_date) VALUES (:order_id, :user_id, :product_name, :amount, :order_date)"),
                         [{"order_id": 101, "user_id": 1, "product_name": 'Laptop', "amount": 1200.00, "order_date": '2024-01-15'},
                          {"order_id": 102, "user_id": 2, "product_name": 'Mouse', "amount": 25.00, "order_date": '2024-01-16'},
                          {"order_id": 103, "user_id": 1, "product_name": 'Monitor', "amount": 300.00, "order_date": '2024-01-17'},
                          {"order_id": 104, "user_id": 3, "product_name": 'Keyboard', "amount": 75.00, "order_date": '2024-01-18'}])
            print("Database setup complete.")
        else:
            print(f"Database already has {count} users. Skipping insertion.")

    # Verification
    inspector = inspect(engine)
    print(f"Verified tables: {inspector.get_table_names()}")

if __name__ == "__main__":
    setup_database()
