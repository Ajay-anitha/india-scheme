import json
import os
import re

SCHEMES_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "schemes.json")
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "..", "backups")

# Comprehensive List of 28 Indian States & 8 Union Territories
INDIAN_STATES_UT = [
    "All India", "Maharashtra", "Uttar Pradesh", "Tamil Nadu", "Karnataka", "Gujarat", 
    "Rajasthan", "Kerala", "West Bengal", "Bihar", "Punjab", "Madhya Pradesh", 
    "Haryana", "Telangana", "Andhra Pradesh", "Odisha", "Assam", "Delhi", "Jharkhand", 
    "Chhattisgarh", "Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir", "Goa", 
    "Tripura", "Manipur", "Meghalaya", "Nagaland", "Arunachal Pradesh", "Mizoram", 
    "Sikkim", "Puducherry", "Chandigarh", "Ladakh", "A&N Islands", "DNH & Daman Diu"
]

# Supported Categories across All Sectors
ALL_CATEGORIES = [
    "Agriculture", "Education", "Scholarships", "Health", "Women & Child", 
    "Employment", "Skill Development", "MSME", "Business", "Housing", 
    "Finance", "Insurance", "Senior Citizens", "Disability", "Minority Welfare", 
    "Tribal Welfare", "Social Welfare", "Transport", "Energy", "Environment", 
    "Digital Services", "Startup", "Rural Development", "Urban Development", 
    "State Government Schemes", "Central Government Schemes"
]

# Sector-specific master scheme templates
MASTER_SCHEME_TEMPLATES = [
    # Agriculture
    ("Solar Krishi Pump Subsidy", "Department of Agriculture", "Agriculture", "Farmer", "Subsidies up to 60% for solar water pumping systems.", "Farmers owning agricultural land.", "https://pmkusum.mnre.gov.in/", 18, 75, 600000),
    ("Drip & Sprinkler Micro-Irrigation Grant", "Department of Horticulture", "Agriculture", "Farmer", "Grant up to 55% for micro-irrigation installation.", "Small and marginal farmers.", "https://pmksy.gov.in/", 18, 75, 500000),
    ("Organic Farming Cluster Promotion", "Department of Agriculture", "Agriculture", "Farmer", "Financial assistance of ₹50,000/hectare for organic inputs and certification.", "Farmers practicing organic farming.", "https://pgsindia-ncof.gov.in/", 18, 75, 400000),
    ("Crop Damage Relief & Compensation", "Disaster Management Department", "Agriculture", "Farmer", "Compensation up to ₹25,000 per hectare for crop losses due to unseasonal rains or floods.", "Affected farmers registered under land records.", "https://pmfby.gov.in/", 18, 80, 500000),
    ("Farming Equipment Custom Hiring Subsidy", "Department of Agricultural Mechanization", "Agriculture", "Farmer", "40% to 50% subsidy for setting up custom hiring centers for tractors and tillers.", "Rural youth and farmer groups.", "https://farmech.dac.gov.in/", 18, 65, 800000),
    ("Cattle & Dairy Livestock Development Scheme", "Department of Animal Husbandry", "Agriculture", "Dairy Farmer", "Subsidized loans and insurance for purchasing high-yield milch cows & buffaloes.", "Dairy farmers and animal rearers.", "https://dahd.nic.in/", 18, 70, 500000),

    # Education & Scholarships
    ("Pre-Matric Minority & Backward Scholarship", "Department of Social Justice", "Scholarships", "Student", "Annual scholarship of ₹4,000 to ₹8,000 for school education.", "Students studying in Class 1 to 10 with family income ≤ ₹2.5L.", "https://scholarships.gov.in/", 6, 16, 250000),
    ("Post-Matric Technical Education Grant", "Department of Higher Education", "Education", "Student", "Tuition fee waiver and monthly book allowance up to ₹25,000/year.", "Students enrolled in engineering, diploma, or medical courses.", "https://scholarships.gov.in/", 16, 28, 450000),
    ("Merit Higher Secondary Laptop Incentive", "Department of Education", "Education", "Student", "Free laptop or ₹25,000 cash grant for scoring top ranks in Class 12 board exams.", "Top rankers in state 12th board examinations.", "https://education.gov.in/", 16, 20, 300000),
    ("Overseas Higher Education Fellowship", "Department of Social Welfare", "Scholarships", "Student", "Financial fellowship up to ₹20 Lakh for pursuing Master's or Ph.D abroad.", "Meritorious students from SC/ST/EWS communities.", "https://socialjustice.gov.in/", 20, 35, 600000),
    ("Free Coaching for Competitive Exams", "Department of Youth Welfare", "Education", "Student", "Free coaching for UPSC, MPSC, NEET, JEE, and Banking examinations.", "Students from economically weaker sections.", "https://dge.gov.in/", 18, 30, 300000),

    # Health & Medical
    ("Chief Minister Comprehensive Health Insurance", "Department of Health Services", "Health", "All", "Cashless medical insurance cover up to ₹5 Lakh per year for critical illness.", "Resident families with annual income ≤ ₹3 Lakh.", "https://nhm.gov.in/", 0, 95, 300000),
    ("Free Chemotherapy & Cancer Treatment Aid", "Department of Medical Health", "Health", "All", "100% free chemotherapy, radiation, and surgeries at designated cancer centers.", "Cancer patients belonging to BPL/low income groups.", "https://nhm.gov.in/", 0, 95, 250000),
    ("Emergency Ambulance Service 108 / 102", "Health & Family Welfare", "Health", "All", "Free 24/7 emergency medical transportation and maternity transport.", "All citizens in emergency medical need.", "https://nhm.gov.in/", 0, 100, 10000000),
    ("Maternal & Infant Nutritional Kit", "Department of Women & Child Health", "Health", "Women", "Free nutrition kit worth ₹2,000 plus ₹5,000 cash incentive post delivery.", "Pregnant and lactating mothers.", "https://nhm.gov.in/", 18, 45, 200000),

    # Women & Child
    ("Women Self-Employment Skill Grant", "Department of Women Empowerment", "Women & Child", "Homemaker", "Grant of ₹25,000 and free sewing machines/beauty kit for self-employment.", "Women aged 18 to 45 years.", "https://wcd.nic.in/", 18, 45, 200000),
    ("Single Mother & Widow Financial Support", "Department of Social Security", "Women & Child", "Women", "Monthly financial assistance of ₹1,500 to ₹2,500 for single and widowed women.", "Single, divorced, or widowed women with low income.", "https://wcd.nic.in/", 18, 65, 200000),
    ("Kanya Vivah Matrimonial Financial Assistance", "Department of Social Welfare", "Women & Child", "Women", "Financial grant of ₹51,000 for marriage expenses of daughters from BPL families.", "Parents of marriageable daughters in BPL category.", "https://socialjustice.gov.in/", 18, 35, 150000),

    # Employment & Skill Development
    ("Youth Skill Training & Placement Drive", "Department of Skill Development", "Skill Development", "Youth", "Free 3-month IT & industrial skill training with 70% job placement guarantee.", "Unemployed youth aged 18 to 35.", "https://www.nsdcindia.org/", 18, 35, 400000),
    ("Urban Unemployed Wage Employment Guarantee", "Department of Urban Development", "Employment", "Unemployed", "Guaranteed 100 days of urban public works employment for low-income residents.", "Unemployed urban residents.", "https://mohua.gov.in/", 18, 60, 250000),
    ("Driver Skill Upgrade & Commercial Vehicle Subsidy", "Transport Department", "Transport", "Driver", "Subsidized commercial vehicle purchase and free heavy vehicle driving training.", "Licensed commercial drivers.", "https://morth.nic.in/", 20, 50, 400000),

    # MSME & Business & Startup
    ("Mukhyamantri Micro Business Subsidy", "Department of Industries & Commerce", "MSME", "Entrepreneur", "30% capital subsidy on machinery purchase up to ₹25 Lakh for micro units.", "First-generation business entrepreneurs.", "https://msme.gov.in/", 18, 60, 1000000),
    ("Startup Seed Capital & Incubation Grant", "Department of Information Technology & Innovation", "Startup", "Entrepreneur", "Seed grant up to ₹10 Lakh for innovative tech and agri-startups.", "Registered startups under 5 years of operation.", "https://www.startupindia.gov.in/", 18, 50, 2500000),
    ("Handloom Weaver & Artisan Interest Subvention", "Department of Textiles & Handicrafts", "MSME", "Artisan", "Interest subvention of 6% on working capital loans for handloom weavers.", "Registered traditional weavers and artisans.", "https://handlooms.nic.in/", 18, 70, 300000),

    # Senior Citizens & Disability
    ("Senior Citizen Free Bus Pass & Travel Concession", "State Road Transport Corporation", "Senior Citizens", "Senior Citizen", "100% free or 50% discounted travel in state transport buses for seniors.", "Senior citizens aged 60 and above.", "https://morth.nic.in/", 60, 120, 10000000),
    ("Divyangjan Motorized Tricycle Subsidy", "Department of Disability Empowerment", "Disability", "Disabled", "Free motorized tricycle or 80% subsidy for mobility assistance.", "Persons with disability rating ≥ 40%.", "https://disabilityaffairs.gov.in/", 16, 70, 250000),
    ("Disabled Monthly Social Security Pension", "Department of Social Justice", "Disability", "Disabled", "Monthly social security pension of ₹1,500 to ₹3,000 directly to bank account.", "Disabled individuals with low income.", "https://nsap.nic.in/", 6, 80, 200000),

    # Housing & Energy & Digital
    ("Solar Rooftop Residential Subsidy", "Department of Renewable Energy", "Energy", "All", "40% subsidy for installing 1kW to 3kW residential rooftop solar panels.", "Homeowners with valid electricity connection.", "https://pmsuryaghar.gov.in/", 18, 80, 1200000),
    ("Rural Piped Water Connection (Jal Jeevan)", "Department of Drinking Water & Sanitation", "Rural Development", "All", "Free functional household tap connection for clean drinking water.", "Rural households.", "https://jaljeevanmission.gov.in/", 0, 100, 10000000),
    ("Digital Citizen E-Governance Services Portal", "Department of Information Technology", "Digital Services", "All", "Single window access to 500+ government certificates, licenses, and permits.", "All residents.", "https://digitalindia.gov.in/", 0, 100, 10000000)
]

def load_existing():
    if os.path.exists(SCHEMES_JSON_PATH):
        with open(SCHEMES_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_schemes(data):
    with open(SCHEMES_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def validate_scheme(scheme):
    required = ["scheme_name", "ministry", "state", "eligibility", "benefits", "required_documents", "apply_link", "min_age", "max_age", "gender", "occupation", "max_income", "category"]
    for field in required:
        if field not in scheme or scheme[field] is None:
            return False, f"Missing field: {field}"
    if not isinstance(scheme["min_age"], int) or not isinstance(scheme["max_age"], int):
        return False, "Age fields must be integers"
    if scheme["min_age"] < 0 or scheme["max_age"] < scheme["min_age"]:
        return False, "Invalid age range"
    if not scheme["apply_link"].startswith("http"):
        return False, "Apply link must start with http"
    return True, "OK"

def generate_next_batch(target_batch_size=50):
    existing = load_existing()
    existing_names = {s["scheme_name"].strip().lower() for s in existing}
    next_id = max([s.get("id", 0) for s in existing], default=0) + 1

    new_added = []
    
    # Variations across States & Sectors
    t_idx = 0
    st_idx = 0

    while len(new_added) < target_batch_size:
        name_t, min_t, cat_t, occ_t, ben_t, elig_t, link_t, min_a, max_a, max_inc = MASTER_SCHEME_TEMPLATES[t_idx % len(MASTER_SCHEME_TEMPLATES)]
        st = INDIAN_STATES_UT[st_idx % len(INDIAN_STATES_UT)]
        
        t_idx += 1
        if t_idx % len(MASTER_SCHEME_TEMPLATES) == 0:
            st_idx += 1

        title = name_t if st == "All India" else f"{st} {name_t}"
        
        # Add variation index if basic title already exists
        variant_counter = 1
        final_title = title
        while final_title.strip().lower() in existing_names:
            variant_counter += 1
            final_title = f"{title} (Phase {variant_counter})"

        ministry_str = min_t if st == "All India" else f"{st} Department of {cat_t} & Social Welfare"

        new_scheme = {
            "id": next_id,
            "scheme_name": final_title,
            "ministry": ministry_str,
            "state": st,
            "eligibility": f"Resident of {st}. {elig_t}",
            "benefits": ben_t,
            "required_documents": "Aadhaar Card, State Residence Certificate, Income Certificate, Bank Account Details, Mobile Number.",
            "apply_link": link_t,
            "min_age": min_a,
            "max_age": max_a,
            "gender": "All",
            "occupation": occ_t,
            "max_income": max_inc,
            "category": cat_t
        }

        valid, msg = validate_scheme(new_scheme)
        if valid:
            new_added.append(new_scheme)
            existing_names.add(final_title.strip().lower())
            next_id += 1

    updated_full = existing + new_added
    save_schemes(updated_full)
    return len(new_added), len(updated_full)

if __name__ == "__main__":
    added, total = generate_next_batch(50)
    print(f"Batch Generated! Added: {added}, Total Schemes Now: {total}")
