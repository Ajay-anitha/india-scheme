import sqlite3
from database import DB_PATH, init_db, get_db_connection

SAMPLE_SCHEMES = [
    {
        "scheme_name": "PM-Kisan Samman Nidhi",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "state": "All India",
        "eligibility": "Small and marginal farmers holding cultivable land up to 2 hectares.",
        "benefits": "₹6,000 per year directly transferred to bank accounts in 3 equal installments of ₹2,000.",
        "required_documents": "Aadhaar Card, Land Holding Documents, Bank Account Details, Mobile Number.",
        "apply_link": "https://pmkisan.gov.in/",
        "min_age": 18,
        "max_age": 75,
        "gender": "All",
        "occupation": "Farmer",
        "max_income": 300000,
        "category": "All"
    },
    {
        "scheme_name": "Ayushman Bharat - PM-JAY",
        "ministry": "Ministry of Health and Family Welfare",
        "state": "All India",
        "eligibility": "Low-income families identified under SECC 2011 data.",
        "benefits": "Health insurance cover of up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization.",
        "required_documents": "Aadhaar Card, Ration Card / Family ID, Mobile Number.",
        "apply_link": "https://pmjay.gov.in/",
        "min_age": 0,
        "max_age": 100,
        "gender": "All",
        "occupation": "All",
        "max_income": 250000,
        "category": "All"
    },
    {
        "scheme_name": "Pradhan Mantri MUDRA Yojana (PMMY)",
        "ministry": "Ministry of Finance",
        "state": "All India",
        "eligibility": "Non-corporate, non-farm small/micro enterprises needing loans up to ₹10 Lakh.",
        "benefits": "Collateral-free loans up to ₹10 Lakh categorized into Shishu (up to ₹50k), Kishore (₹50k-5L), and Tarun (₹5L-10L).",
        "required_documents": "ID Proof, Residence Proof, Business Proposal / Plan, Bank Statements, Photographs.",
        "apply_link": "https://www.mudra.org.in/",
        "min_age": 18,
        "max_age": 65,
        "gender": "All",
        "occupation": "Entrepreneur",
        "max_income": 1000000,
        "category": "All"
    },
    {
        "scheme_name": "Sukanya Samriddhi Yojana (SSY)",
        "ministry": "Ministry of Finance / Women & Child Development",
        "state": "All India",
        "eligibility": "Parents or legal guardians of a girl child below the age of 10 years.",
        "benefits": "High-interest savings account (currently ~8.2%) with EEE tax exemption under Section 80C.",
        "required_documents": "Girl Child Birth Certificate, Guardian's Aadhaar & PAN Card, Address Proof.",
        "apply_link": "https://www.indiapost.gov.in/",
        "min_age": 0,
        "max_age": 10,
        "gender": "Female",
        "occupation": "Student",
        "max_income": 10000000,
        "category": "All"
    },
    {
        "scheme_name": "Pradhan Mantri SVANidhi",
        "ministry": "Ministry of Housing and Urban Affairs",
        "state": "All India",
        "eligibility": "Street vendors selling goods, snacks, or services in urban areas.",
        "benefits": "Working capital loan up to ₹10,000 (1st tranche), ₹20,000 (2nd tranche), and ₹50,000 (3rd tranche) with 7% interest subsidy.",
        "required_documents": "Vending Certificate / Urban Local Body ID Card, Aadhaar Card, Bank Account Details.",
        "apply_link": "https://pmsvanidhi.mohua.gov.in/",
        "min_age": 18,
        "max_age": 70,
        "gender": "All",
        "occupation": "Vendor",
        "max_income": 300000,
        "category": "All"
    },
    {
        "scheme_name": "Pradhan Mantri Awas Yojana (PMAY - Urban & Gramin)",
        "ministry": "Ministry of Housing and Urban Poverty Alleviation",
        "state": "All India",
        "eligibility": "Economically Weaker Section (EWS) and Low Income Group (LIG) families without a pucca house.",
        "benefits": "Financial assistance up to ₹2.67 Lakh for home purchase, construction, or renovation.",
        "required_documents": "Aadhaar Card, Income Certificate, Bank Account Details, Affidavit of non-ownership of house.",
        "apply_link": "https://pmaymis.gov.in/",
        "min_age": 18,
        "max_age": 70,
        "gender": "All",
        "occupation": "All",
        "max_income": 600000,
        "category": "All"
    },
    {
        "scheme_name": "National Social Assistance Programme (NSAP) - Old Age Pension",
        "ministry": "Ministry of Rural Development",
        "state": "All India",
        "eligibility": "Senior citizens aged 60 years and above belonging to Below Poverty Line (BPL) households.",
        "benefits": "Monthly financial pension ranging from ₹200 to ₹500 per month directly credited to bank account.",
        "required_documents": "Aadhaar Card, BPL Card, Age Proof, Bank Account Details.",
        "apply_link": "https://nsap.nic.in/",
        "min_age": 60,
        "max_age": 120,
        "gender": "All",
        "occupation": "Unemployed",
        "max_income": 120000,
        "category": "All"
    }
]

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM schemes")
    count = cursor.fetchone()[0]
    
    if count == 0:
        for s in SAMPLE_SCHEMES:
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
        conn.commit()
        print(f"Successfully seeded {len(SAMPLE_SCHEMES)} schemes into the database.")
    else:
        print(f"Database already contains {count} schemes. Skipping seed.")
        
    conn.close()

if __name__ == "__main__":
    seed_database()
