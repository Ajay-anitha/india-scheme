import sqlite3
import os
import json

def get_db_path():
    db_url = os.getenv("DATABASE_URL")
    if db_url and db_url.startswith("sqlite:///"):
        rel_path = db_url.replace("sqlite:///", "")
        if rel_path.startswith("./"):
            return os.path.join(os.path.dirname(__file__), rel_path[2:])
        return rel_path
    return os.path.join(os.path.dirname(__file__), "schemes.db")

DB_PATH = get_db_path()

def get_db_connection():
    conn = sqlite3.connect(get_db_path())
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
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_scheme_name ON schemes(scheme_name);
    """)
    conn.commit()
    conn.close()

STOP_WORDS = {
    'scheme', 'schemes', 'yojana', 'for', 'in', 'the', 'a', 'an', 'of', 
    'and', 'or', 'to', 'with', 'india', 'central', 'national', 'state', 'gov', 'government'
}

SYNONYMS = {
    'kisan': ['farmer', 'farming', 'agriculture', 'kisan'],
    'kisaan': ['farmer', 'farming', 'agriculture', 'kisan'],
    'farmer': ['kisan', 'farming', 'agriculture', 'farmer'],
    'farmers': ['kisan', 'farmer', 'agriculture', 'farming'],
    'agri': ['agriculture', 'farmer', 'kisan'],
    'agriculture': ['farmer', 'kisan', 'agriculture'],
    'loan': ['credit', 'financial assistance', 'subsidy', 'mudra', 'loan', 'grant'],
    'scholarship': ['education', 'student', 'stipend', 'fellowship', 'scholarship'],
    'scholarships': ['education', 'student', 'stipend', 'fellowship', 'scholarship'],
    'student': ['education', 'scholarship', 'study', 'student'],
    'students': ['education', 'scholarship', 'study', 'student'],
    'health': ['ayushman', 'medical', 'hospital', 'insurance', 'health', 'chiranjeevi'],
    'medical': ['health', 'ayushman', 'hospital', 'medical'],
    'pension': ['senior', 'elderly', 'old age', 'vaya', 'nsap', 'pension'],
    'pensions': ['senior', 'elderly', 'old age', 'vaya', 'nsap', 'pension'],
    'senior': ['elderly', 'old age', 'pension', 'senior', 'vaya'],
    'seniors': ['elderly', 'old age', 'pension', 'senior'],
    'housing': ['awas', 'house', 'home', 'housing', 'shelter'],
    'house': ['housing', 'awas', 'home'],
    'home': ['housing', 'awas', 'home'],
    'women': ['mahila', 'lady', 'girl', 'female', 'sukanya', 'women'],
    'woman': ['mahila', 'lady', 'girl', 'female', 'women'],
    'girl': ['women', 'mahila', 'sukanya', 'female', 'girl'],
    'employment': ['job', 'skill', 'kaushal', 'rozgar', 'employment', 'work'],
    'job': ['employment', 'skill', 'work', 'job', 'placement'],
    'jobs': ['employment', 'skill', 'work', 'job']
}

import re

def get_all_schemes(search_query: str = None):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM schemes")
        rows = [dict(row) for row in cursor.fetchall()]
        
        if not search_query or not search_query.strip():
            return rows

        raw_query = search_query.strip().lower()
        norm_query = re.sub(r'[\-/_\,\.\(\)]+', ' ', raw_query)
        compact_query = re.sub(r'[\s\-/_\,\.\(\)]+', '', raw_query)
        
        tokens = [t for t in norm_query.split() if t not in STOP_WORDS and len(t) > 1]
        if not tokens:
            tokens = [raw_query]

        scored = []
        for s in rows:
            score = 0
            name = s['scheme_name'].lower()
            norm_name = re.sub(r'[\-/_\,\.\(\)]+', ' ', name)
            compact_name = re.sub(r'[\s\-/_\,\.\(\)]+', '', name)

            ministry = (s['ministry'] or '').lower()
            eligibility = (s['eligibility'] or '').lower()
            benefits = (s['benefits'] or '').lower()
            state = (s['state'] or '').lower()
            occupation = (s['occupation'] or '').lower()
            category = (s['category'] or '').lower()
            req_docs = (s['required_documents'] or '').lower()

            full_text = f"{norm_name} {ministry} {eligibility} {benefits} {state} {occupation} {category} {req_docs}"
            compact_full = re.sub(r'[\s\-/_\,\.\(\)]+', '', full_text)

            # 1. Exact or compact query matches
            if norm_query in norm_name or compact_query in compact_name:
                score += 150
            elif norm_query in full_text or compact_query in compact_full:
                score += 80

            # 2. Token matches
            matched_tokens = 0
            for t in tokens:
                t_syns = SYNONYMS.get(t, [t])
                t_matched = False

                for syn in t_syns:
                    if syn in norm_name:
                        score += 40
                        t_matched = True
                    elif syn in ministry:
                        score += 25
                        t_matched = True
                    elif syn in occupation or syn in category or syn in state:
                        score += 20
                        t_matched = True
                    elif syn in benefits or syn in eligibility:
                        score += 15
                        t_matched = True
                    elif syn in req_docs:
                        score += 10
                        t_matched = True

                if t_matched:
                    matched_tokens += 1

            # Bonus if all query tokens matched
            if matched_tokens == len(tokens):
                score += 50

            if score > 0:
                scored.append((score, s))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored]
    finally:
        conn.close()

def get_scheme_by_id(scheme_id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM schemes WHERE id = ?", (scheme_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def check_eligibility_in_db(age: int = None, gender: str = None, state: str = None, 
                           occupation: str = None, annual_income: int = None, category: str = None):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM schemes")
        rows = [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()
    
    matched = []
    for s in rows:
        is_match = True
        
        # Age check
        if age is not None:
            min_age = s.get("min_age") or 0
            max_age = s.get("max_age") or 120
            if min_age > age or max_age < age:
                is_match = False
                
        # Gender check
        if is_match and gender and gender.lower() not in ["all", "any"]:
            s_gender = (s.get("gender") or "all").lower()
            if s_gender not in ["all", "any"] and gender.lower() != s_gender:
                is_match = False
                
        # State check: If user selected 'All India' or 'All', show all schemes; otherwise match state or All India schemes
        if is_match and state and state.lower() not in ["all", "all india"]:
            s_state = (s.get("state") or "all india").lower()
            if s_state not in ["all", "all india"] and state.lower() not in s_state and s_state not in state.lower():
                is_match = False

        # Occupation check
        if is_match and occupation and occupation.lower() not in ["all", "any"]:
            s_occ = (s.get("occupation") or "all").lower()
            if s_occ not in ["all", "any"] and occupation.lower() not in s_occ and s_occ not in occupation.lower():
                is_match = False

        # Income check
        if is_match and annual_income is not None:
            max_inc = s.get("max_income") if s.get("max_income") is not None else 10000000
            if max_inc < annual_income:
                is_match = False

        # Category check
        if is_match and category and category.lower() not in ["all", "general / unreserved"]:
            s_cat = (s.get("category") or "all").lower()
            if s_cat not in ["all", "general", "unreserved"] and category.lower() not in s_cat:
                is_match = False

        if is_match:
            matched.append(s)
            
    return matched

def get_scheme_suggestions(query: str = "", limit: int = 6):
    if not query or len(query.strip()) < 2:
        return []
    all_matched = get_all_schemes(query)
    suggestions = []
    for s in all_matched[:limit]:
        suggestions.append({
            "id": s["id"],
            "scheme_name": s["scheme_name"],
            "ministry": s["ministry"],
            "category": s.get("category", "General"),
            "state": s.get("state", "All India")
        })
    return suggestions

def get_related_schemes(scheme_id: int, limit: int = 4):
    target = get_scheme_by_id(scheme_id)
    if not target:
        return []
    cat = target.get("category") or ""
    all_cat = get_all_schemes(cat)
    related = [s for s in all_cat if s["id"] != scheme_id]
    if len(related) < limit:
        all_schemes = get_all_schemes()
        for s in all_schemes:
            if s["id"] != scheme_id and s not in related:
                related.append(s)
            if len(related) >= limit:
                break
    return related[:limit]
