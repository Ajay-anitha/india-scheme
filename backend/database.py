import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "schemes.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_name TEXT NOT NULL,
        ministry TEXT NOT NULL,
        state TEXT NOT NULL DEFAULT 'All India',
        eligibility TEXT NOT NULL,
        benefits TEXT NOT NULL,
        required_documents TEXT NOT NULL,
        apply_link TEXT NOT NULL,
        min_age INTEGER DEFAULT 0,
        max_age INTEGER DEFAULT 100,
        gender TEXT DEFAULT 'All',
        occupation TEXT DEFAULT 'All',
        max_income INTEGER DEFAULT 10000000,
        category TEXT DEFAULT 'All'
    )
    """)
    conn.commit()
    conn.close()

def get_all_schemes(search_query: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if search_query:
        query = "%" + search_query.strip().lower() + "%"
        cursor.execute("""
            SELECT * FROM schemes 
            WHERE LOWER(scheme_name) LIKE ? 
               OR LOWER(ministry) LIKE ? 
               OR LOWER(eligibility) LIKE ? 
               OR LOWER(benefits) LIKE ?
        """, (query, query, query, query))
    else:
        cursor.execute("SELECT * FROM schemes")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_scheme_by_id(scheme_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE id = ?", (scheme_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def check_eligibility_in_db(age: int = None, gender: str = None, state: str = None, 
                           occupation: str = None, annual_income: int = None, category: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    matched = []
    for s in rows:
        is_match = True
        
        # Age check
        if age is not None:
            if s.get("min_age", 0) > age or s.get("max_age", 100) < age:
                is_match = False
                
        # Gender check
        if gender and gender.lower() != "all" and s.get("gender") and s.get("gender").lower() != "all":
            if gender.lower() != s.get("gender").lower():
                is_match = False
                
        # State check
        if state and state.lower() != "all" and s.get("state") and s.get("state").lower() != "all india":
            if state.lower() not in s.get("state").lower() and s.get("state").lower() != "all":
                is_match = False

        # Occupation check
        if occupation and occupation.lower() != "all" and s.get("occupation") and s.get("occupation").lower() != "all":
            if occupation.lower() not in s.get("occupation").lower() and s.get("occupation").lower() != "any":
                is_match = False

        # Income check
        if annual_income is not None:
            if s.get("max_income", 10000000) < annual_income:
                is_match = False

        # Category check
        if category and category.lower() != "all" and s.get("category") and s.get("category").lower() != "all":
            if category.lower() not in s.get("category").lower() and s.get("category").lower() != "general":
                is_match = False

        if is_match:
            matched.append(s)
            
    return matched
