import os
from db_engine import DatabaseEngine

class RAGManager:
    def __init__(self, db_engine: DatabaseEngine, persist_directory: str = "./chroma_db"):
        self.db_engine = db_engine
        self.schema_cache = None
        
    def index_schema(self):
        """Extracts and caches the database schema."""
        self.schema_cache = self.db_engine.get_schema()
        print(f"✓ Schema indexed successfully")
        return self.schema_cache

    def retrieve_relevant_schema(self, query: str, k: int = 3) -> str:
        """
        Simple keyword-based retrieval of relevant schema.
        Returns the full schema for now - in production, you'd use vector similarity.
        """
        if not self.schema_cache:
            self.schema_cache = self.db_engine.get_schema()
            
        # Simple keyword matching to find relevant tables
        query_lower = query.lower()
        tables = self.db_engine.get_table_names()
        
        relevant_tables = []
        for table in tables:
            if table.lower() in query_lower:
                relevant_tables.append(table)
        
        # If no specific tables mentioned, return all schema
        if not relevant_tables:
            return self.schema_cache
            
        # Return schema for relevant tables
        return self.schema_cache  # For simplicity, return full schema
