import sqlite3
import os
import json
try:
    from backend.database import get_db_path, init_db, get_db_connection
except ImportError:
    from database import get_db_path, init_db, get_db_connection

SCHEMES_JSON_PATH = os.path.join(os.path.dirname(__file__), "schemes.json")

def load_schemes_from_json():
    if os.path.exists(SCHEMES_JSON_PATH):
        with open(SCHEMES_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

SAMPLE_SCHEMES = load_schemes_from_json()



def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    schemes_data = load_schemes_from_json()
    
    seeded_count = 0
    updated_count = 0
    
    for s in schemes_data:
        cursor.execute("SELECT id FROM schemes WHERE scheme_name = ?", (s["scheme_name"],))
        row = cursor.fetchone()
        
        if row is None:
            cursor.execute("""
            INSERT INTO schemes (
                scheme_name, ministry, state, eligibility, benefits, 
                required_documents, apply_link, min_age, max_age, 
                gender, occupation, max_income, category
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s["scheme_name"], s["ministry"], s["state"], s["eligibility"],
                s["benefits"], s["required_documents"], s["apply_link"],
                s["min_age"], s["max_age"], s["gender"], s["occupation"],
                s["max_income"], s["category"]
            ))
            seeded_count += 1
        else:
            cursor.execute("""
            UPDATE schemes SET
                ministry = ?, state = ?, eligibility = ?, benefits = ?,
                required_documents = ?, apply_link = ?, min_age = ?, max_age = ?,
                gender = ?, occupation = ?, max_income = ?, category = ?
            WHERE scheme_name = ?
            """, (
                s["ministry"], s["state"], s["eligibility"], s["benefits"],
                s["required_documents"], s["apply_link"], s["min_age"], s["max_age"],
                s["gender"], s["occupation"], s["max_income"], s["category"],
                s["scheme_name"]
            ))
            updated_count += 1

    conn.commit()
    
    cursor.execute("SELECT COUNT(*) FROM schemes")
    total_count = cursor.fetchone()[0]
    conn.close()
    
    print(f"Seed Completed! Total Schemes in DB: {total_count} (Inserted: {seeded_count}, Updated: {updated_count})")

if __name__ == "__main__":
    seed_database()

