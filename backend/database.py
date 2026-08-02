import sqlite3
import os
import json
import re
from difflib import SequenceMatcher

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
        category TEXT DEFAULT 'All',
        official_page TEXT DEFAULT '',
        helpline TEXT DEFAULT '',
        last_updated TEXT DEFAULT '',
        status TEXT DEFAULT 'Active'
    )
    """)

    # Check and add new columns if upgrading existing table
    cursor.execute("PRAGMA table_info(schemes)")
    columns = [col[1] for col in cursor.fetchall()]
    if "official_page" not in columns:
        cursor.execute("ALTER TABLE schemes ADD COLUMN official_page TEXT DEFAULT '';")
    if "helpline" not in columns:
        cursor.execute("ALTER TABLE schemes ADD COLUMN helpline TEXT DEFAULT '';")
    if "last_updated" not in columns:
        cursor.execute("ALTER TABLE schemes ADD COLUMN last_updated TEXT DEFAULT '';")
    if "status" not in columns:
        cursor.execute("ALTER TABLE schemes ADD COLUMN status TEXT DEFAULT 'Active';")

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
    'kisan': ['farmer', 'farming', 'agriculture', 'kisan', 'krishi', 'pm-kisan'],
    'kisaan': ['farmer', 'farming', 'agriculture', 'kisan', 'krishi'],
    'farmer': ['kisan', 'farming', 'agriculture', 'farmer', 'krishi'],
    'farmers': ['kisan', 'farmer', 'agriculture', 'farming'],
    'agri': ['agriculture', 'farmer', 'kisan', 'krishi'],
    'agriculture': ['farmer', 'kisan', 'agriculture', 'krishi'],
    'loan': ['credit', 'financial assistance', 'subsidy', 'mudra', 'loan', 'grant', 'pmmy', 'svanidhi'],
    'mudra': ['mudra', 'loan', 'pmmy', 'business', 'entrepreneur'],
    'scholarship': ['education', 'student', 'stipend', 'fellowship', 'scholarship', 'nmmss', 'post-matric'],
    'scholarships': ['education', 'student', 'stipend', 'fellowship', 'scholarship'],
    'student': ['education', 'scholarship', 'study', 'student', 'fellowship'],
    'students': ['education', 'scholarship', 'study', 'student'],
    'health': ['ayushman', 'medical', 'hospital', 'insurance', 'health', 'chiranjeevi', 'pm-jay'],
    'medical': ['health', 'ayushman', 'hospital', 'medical'],
    'ayushman': ['ayushman', 'health', 'pm-jay', 'insurance', 'hospital'],
    'pension': ['senior', 'elderly', 'old age', 'vaya', 'nsap', 'pension', 'apy', 'maan-dhan'],
    'pensions': ['senior', 'elderly', 'old age', 'vaya', 'nsap', 'pension'],
    'senior': ['elderly', 'old age', 'pension', 'senior', 'vaya', 'rvy'],
    'seniors': ['elderly', 'old age', 'pension', 'senior'],
    'housing': ['awas', 'house', 'home', 'housing', 'shelter', 'pmay'],
    'house': ['housing', 'awas', 'home', 'pmay'],
    'home': ['housing', 'awas', 'home'],
    'women': ['mahila', 'lady', 'girl', 'female', 'sukanya', 'women', 'ssy', 'bbbp', 'pmmvy'],
    'woman': ['mahila', 'lady', 'girl', 'female', 'women'],
    'girl': ['women', 'mahila', 'sukanya', 'female', 'girl', 'beti'],
    'employment': ['job', 'skill', 'kaushal', 'rozgar', 'employment', 'work', 'pmkvy', 'naps'],
    'job': ['employment', 'skill', 'work', 'job', 'placement'],
    'jobs': ['employment', 'skill', 'work', 'job']
}

# Misspelling & Typo Auto-Correction Dictionary
TYPO_CORRECTIONS = {
    'adrikultuare': 'agriculture',
    'agriculutre': 'agriculture',
    'agrikulture': 'agriculture',
    'agri': 'agriculture',
    'scholrship': 'scholarship',
    'scholaship': 'scholarship',
    'sholarship': 'scholarship',
    'skolarship': 'scholarship',
    'mudraa': 'mudra',
    'mudra': 'mudra',
    'ayushman': 'ayushman',
    'ayusman': 'ayushman',
    'ayushaman': 'ayushman',
    'kisaan': 'kisan',
    'awas': 'awas',
    'aawas': 'awas',
    'vishwakarma': 'vishwakarma',
    'viswakarma': 'vishwakarma',
    'surya': 'surya',
    'soorya': 'surya',
}

CATEGORY_KEYWORDS = {
    'student': [{'label': 'Student Category', 'slug': 'student'}, {'label': 'Student Schemes', 'slug': 'student'}],
    'education': [{'label': 'Education Category', 'slug': 'education'}, {'label': 'Education & Scholarship Schemes', 'slug': 'education'}],
    'scholarship': [{'label': 'Student Category', 'slug': 'student'}, {'label': 'Scholarship Schemes', 'slug': 'education'}],
    'health': [{'label': 'Health Category', 'slug': 'health'}, {'label': 'Health & Medical Schemes', 'slug': 'health'}],
    'medical': [{'label': 'Health Category', 'slug': 'health'}, {'label': 'Health Schemes', 'slug': 'health'}],
    'agriculture': [{'label': 'Agriculture Category', 'slug': 'agriculture'}, {'label': 'Agriculture & Farmer Schemes', 'slug': 'agriculture'}],
    'farmer': [{'label': 'Agriculture Category', 'slug': 'agriculture'}, {'label': 'Farmer Welfare Schemes', 'slug': 'agriculture'}],
    'loan': [{'label': 'Financial Inclusion Category', 'slug': 'finance'}, {'label': 'Credit & Loan Schemes', 'slug': 'finance'}],
    'housing': [{'label': 'Housing Category', 'slug': 'housing'}, {'label': 'Housing & Shelter Schemes', 'slug': 'housing'}],
    'women': [{'label': 'Women & Child Welfare Category', 'slug': 'women'}, {'label': 'Women Schemes', 'slug': 'women'}],
    'employment': [{'label': 'Employment Category', 'slug': 'employment'}, {'label': 'Skill & Training Schemes', 'slug': 'employment'}],
    'senior': [{'label': 'Senior Citizen Support Category', 'slug': 'senior-citizen'}, {'label': 'Senior Pension Schemes', 'slug': 'senior-citizen'}],
}

def correct_query_terms(query: str) -> str:
    """Auto-correct misspelled query terms using dictionary and fuzzy distance."""
    if not query:
        return ""
    words = query.strip().lower().split()
    corrected_words = []
    
    for w in words:
        w_clean = re.sub(r'[^a-z0-9]', '', w)
        if not w_clean:
            continue
            
        if w_clean in TYPO_CORRECTIONS:
            corrected_words.append(TYPO_CORRECTIONS[w_clean])
            continue
            
        # Try fuzzy match against known dictionary keys
        best_match = w
        highest_ratio = 0.0
        for target in list(TYPO_CORRECTIONS.keys()) + list(SYNONYMS.keys()):
            ratio = SequenceMatcher(None, w_clean, target).ratio()
            if ratio > highest_ratio and ratio >= 0.70:
                highest_ratio = ratio
                best_match = TYPO_CORRECTIONS.get(target, target)
                
        corrected_words.append(best_match)
        
    return " ".join(corrected_words) if corrected_words else query

def get_all_schemes(search_query: str = None):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM schemes")
        rows = [dict(row) for row in cursor.fetchall()]
        
        if not search_query or not search_query.strip():
            return rows

        raw_query = search_query.strip().lower()
        corrected_query = correct_query_terms(raw_query)

        norm_query = re.sub(r'[\-/_\,\.\(\)]+', ' ', raw_query)
        compact_query = re.sub(r'[\s\-/_\,\.\(\)]+', '', raw_query)
        
        norm_corr = re.sub(r'[\-/_\,\.\(\)]+', ' ', corrected_query)
        compact_corr = re.sub(r'[\s\-/_\,\.\(\)]+', '', corrected_query)
        
        query_tokens = [t for t in norm_query.split() if t not in STOP_WORDS and len(t) > 1]
        corr_tokens = [t for t in norm_corr.split() if t not in STOP_WORDS and len(t) > 1]
        
        all_tokens = list(set(query_tokens + corr_tokens))
        if not all_tokens:
            all_tokens = [raw_query]

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

            # 1. Exact or compact matches
            if norm_query == norm_name or compact_query == compact_name or compact_corr == compact_name:
                score += 250
            elif norm_name.startswith(norm_query) or compact_name.startswith(compact_query) or compact_name.startswith(compact_corr):
                score += 200
            elif norm_query in norm_name or compact_query in compact_name or compact_corr in compact_name:
                score += 150
            elif norm_query in full_text or compact_query in compact_full or compact_corr in compact_full:
                score += 90

            # 2. Token & Fuzzy Token matches
            matched_tokens = 0
            for t in all_tokens:
                t_syns = SYNONYMS.get(t, [t])
                t_matched = False

                for syn in t_syns:
                    if syn in norm_name:
                        score += 50
                        t_matched = True
                    elif syn in ministry or syn in category or syn in occupation or syn in state:
                        score += 30
                        t_matched = True
                    elif syn in benefits or syn in eligibility or syn in req_docs:
                        score += 20
                        t_matched = True

                # Fuzzy token matching against name words
                if not t_matched:
                    name_words = norm_name.split()
                    for nw in name_words:
                        ratio = SequenceMatcher(None, t, nw).ratio()
                        if ratio >= 0.70:
                            score += int(40 * ratio)
                            t_matched = True
                            break

                if t_matched:
                    matched_tokens += 1

            if matched_tokens == len(all_tokens) and len(all_tokens) > 0:
                score += 60

            if score > 0:
                scored.append((score, s))

        # Sort by relevance score descending
        scored.sort(key=lambda x: x[0], reverse=True)
        results = [item[1] for item in scored]

        # 3. Intelligent Fallback if no direct score > 0
        if not results:
            fallback_scored = []
            for s in rows:
                name = s['scheme_name'].lower()
                ratio = SequenceMatcher(None, corrected_query, name).ratio()
                full_ratio = SequenceMatcher(None, raw_query, f"{name} {s['benefits']}").ratio()
                max_r = max(ratio, full_ratio)
                fallback_scored.append((max_r, s))
                
            fallback_scored.sort(key=lambda x: x[0], reverse=True)
            results = [item[1] for item in fallback_scored[:6]]

        return results
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
    if not query or len(query.strip()) < 1:
        return {"query": query, "corrected_query": "", "suggestions": []}

    raw_query = query.strip().lower()
    corrected_query = correct_query_terms(raw_query)
    
    matched_schemes = get_all_schemes(raw_query)
    suggestions = []

    # 1. Category Suggestions for terms like 'student', 'health', 'agriculture', etc.
    matched_cat_keys = []
    for k, cat_list in CATEGORY_KEYWORDS.items():
        if k in raw_query or k in corrected_query:
            matched_cat_keys.extend(cat_list)
        else:
            ratio = SequenceMatcher(None, raw_query, k).ratio()
            if ratio >= 0.70:
                matched_cat_keys.extend(cat_list)

    seen_cats = set()
    for cat in matched_cat_keys:
        if cat['label'] not in seen_cats:
            seen_cats.add(cat['label'])
            suggestions.append({
                "type": "category",
                "label": cat['label'],
                "slug": cat['slug']
            })

    # 2. Scheme Suggestions
    for s in matched_schemes:
        if len(suggestions) >= limit:
            break
        suggestions.append({
            "type": "scheme",
            "id": s["id"],
            "scheme_name": s["scheme_name"],
            "ministry": s["ministry"],
            "category": s.get("category", "General"),
            "state": s.get("state", "All India")
        })

    return {
        "query": query,
        "corrected_query": corrected_query if corrected_query != raw_query else "",
        "suggestions": suggestions[:limit]
    }

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
