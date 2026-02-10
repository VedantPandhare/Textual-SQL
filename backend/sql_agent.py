from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from rag_manager import RAGManager
from db_engine import DatabaseEngine
import os
from dotenv import load_dotenv

load_dotenv()

class SQLAgent:
    def __init__(self, db_engine: DatabaseEngine, rag_manager: RAGManager):
        self.db_engine = db_engine
        self.rag_manager = rag_manager
        
        self.llm = None
        groq_key = os.getenv("GROQ_API_KEY")
        
        if groq_key:
            self.llm = ChatGroq(
                model_name="llama-3.3-70b-versatile",
                groq_api_key=groq_key,
                temperature=0
            )
            print("✓ Groq LLM initialized")
        else:
            raise ValueError("No GROQ_API_KEY found in .env")

    def generate_and_execute(self, user_query: str):
        print(f"🔍 Processing query: {user_query}")
        try:
            schema_context = self.rag_manager.retrieve_relevant_schema(user_query)
            print(f"✅ Schema retrieved (length: {len(schema_context)})")
        except Exception as e:
            print(f"❌ RAG Retrieval failed: {str(e)}")
            return {"error": f"RAG Retrieval failed: {str(e)}"}
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a SQL expert. 
            Given the database schema context below, translate the user's natural language question into a standard PostgreSQL query.
            
            Guidelines:
            - Return ONLY the SQL code.
            - Do not include any explanation or markdown formatting like ```sql.
            - Use ONLY the tables and columns provided in the context.
            - If the question cannot be answered with the given schema, return 'I cannot answer this question with the available data.'
            """),
            ("human", f"Schema Context:\n{schema_context}\n\nUser Question: {user_query}")
        ])
        
        try:
            print("🤖 Calling Groq...")
            chain = prompt | self.llm
            response = chain.invoke({})
            sql_query = response.content.strip().replace("```sql", "").replace("```", "").strip()
            print(f"✅ Generated SQL: {sql_query}")
            
            if "I cannot answer" in sql_query:
                return {"sql": None, "results": [], "message": sql_query}

            print("🚀 Executing SQL...")
            results = self.db_engine.execute_query(sql_query)
            print(f"✅ Execution successful, found {len(results)} rows")
            
            return {
                "sql": sql_query, 
                "results": results,
                "context_used": schema_context,
                "provider": "Groq"
            }
        except Exception as e:
            print(f"❌ Operation failed: {str(e)}")
            return {"error": str(e)}

