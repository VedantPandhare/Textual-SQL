from langchain_google_genai import ChatGoogleGenerativeAI
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
        
        self.gemini_llm = None
        self.groq_llm = None
        
        gemini_key = os.getenv("GOOGLE_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")
        
        if gemini_key:
            self.gemini_llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=gemini_key,
                temperature=0
            )
            print("✓ Gemini LLM initialized")
            
        if groq_key:
            self.groq_llm = ChatGroq(
                model_name="llama-3.1-70b-versatile",
                groq_api_key=groq_key,
                temperature=0
            )
            print("✓ Groq LLM initialized")
            
        if not self.gemini_llm and not self.groq_llm:
            raise ValueError(
                "No API key found! Please set either GOOGLE_API_KEY or GROQ_API_KEY in .env"
            )

    def generate_and_execute(self, user_query: str):
        print(f"🔍 Processing query: {user_query}")
        # 1. Retrieve relevant schema (RAG step)
        try:
            schema_context = self.rag_manager.retrieve_relevant_schema(user_query)
            print(f"✅ Schema retrieved (length: {len(schema_context)})")
        except Exception as e:
            print(f"❌ RAG Retrieval failed: {str(e)}")
            return {"error": f"RAG Retrieval failed: {str(e)}"}
        
        # 2. Prompt for SQL generation
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
        
        # Try Gemini first, then fall back to Groq
        errors = []
        sql_query = None
        
        # Priority 1: Gemini
        if self.gemini_llm:
            try:
                print("🤖 Calling Gemini...")
                chain = prompt | self.gemini_llm
                response = chain.invoke({})
                sql_query = response.content.strip().replace("```sql", "").replace("```", "").strip()
                print(f"✅ Gemini generated SQL: {sql_query}")
            except Exception as e:
                err_msg = str(e)
                print(f"⚠️ Gemini failed: {err_msg}")
                errors.append(f"Gemini error: {err_msg}")
                
        # Priority 2: Groq (if Gemini failed or was unavailable)
        if not sql_query and self.groq_llm:
            try:
                print("🤖 Calling Groq (Fallback)...")
                chain = prompt | self.groq_llm
                response = chain.invoke({})
                sql_query = response.content.strip().replace("```sql", "").replace("```", "").strip()
                print(f"✅ Groq generated SQL: {sql_query}")
            except Exception as e:
                err_msg = str(e)
                print(f"❌ Groq failed: {err_msg}")
                errors.append(f"Groq error: {err_msg}")
        
        if not sql_query:
            return {"error": "All LLM providers failed. " + " | ".join(errors)}

        try:
            if "I cannot answer" in sql_query:
                return {"sql": None, "results": [], "message": sql_query}

            # 3. Execute SQL
            print("🚀 Executing SQL...")
            results = self.db_engine.execute_query(sql_query)
            print(f"✅ Execution successful, found {len(results)} rows")
            return {
                "sql": sql_query, 
                "results": results,
                "context_used": schema_context,
                "provider": "Gemini" if response == chain.invoke({}) else "Groq" # This is a bit pseudo, using logic above instead
            }
        except Exception as e:
            print(f"❌ SQL Execution failed: {str(e)}")
            return {"error": f"SQL Execution failed: {str(e)}", "sql": sql_query}
