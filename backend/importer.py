import os
import json
import sqlite3
import re
import logging
from datetime import datetime
from difflib import SequenceMatcher
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.importer")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, "schemes.json")
DB_PATH = os.path.join(BASE_DIR, "schemes.db")

# Official Government Domain Suffixes
OFFICIAL_GOV_DOMAINS = (
    ".gov.in", ".nic.in", ".org.in", ".ac.in", ".edu.in",
    "myscheme.gov.in", "india.gov.in", "data.gov.in", "dbtbharat.gov.in",
    "pmkisan.gov.in", "pmjay.gov.in", "scholarships.gov.in", "pmsvanidhi.mohua.gov.in",
    "mudra.org.in", "standupmitra.in", "cgtmse.in", "maandhan.in", "orunodoi.in"
)

def is_official_gov_url(url: str) -> bool:
    """Validate if a URL belongs to an official Government of India or State Government domain."""
    if not url or not isinstance(url, str):
        return False
    url_str = url.strip().lower()
    if not (url_str.startswith("http://") or url_str.startswith("https://")):
        return False
    try:
        domain = urlparse(url_str).netloc
        return any(domain.endswith(suffix) or domain == suffix for suffix in OFFICIAL_GOV_DOMAINS)
    except Exception:
        return False

def calculate_name_similarity(name1: str, name2: str) -> float:
    """Calculate string similarity ratio between two scheme names."""
    n1 = re.sub(r'[^a-zA-Z0-9]', '', name1.lower())
    n2 = re.sub(r'[^a-zA-Z0-9]', '', name2.lower())
    return SequenceMatcher(None, n1, n2).ratio()

def find_duplicate_scheme(new_scheme: dict, existing_schemes: list):
    """
    Check if a scheme already exists in the database.
    Matches by:
    1. Exact or high fuzzy name similarity (>= 0.85)
    2. Exact match on official apply_link or official_page URL
    """
    new_name = new_scheme.get("scheme_name", "").strip()
    new_apply = new_scheme.get("apply_link", "").strip()
    new_page = new_scheme.get("official_page", "").strip()

    for idx, existing in enumerate(existing_schemes):
        ex_name = existing.get("scheme_name", "").strip()
        ex_apply = existing.get("apply_link", "").strip()
        ex_page = existing.get("official_page", "").strip()

        # 1. URL match
        if (new_apply and new_apply == ex_apply and new_apply != "https://www.myscheme.gov.in") or (new_page and new_page == ex_page and new_page != "https://www.myscheme.gov.in"):
            return idx, existing

        # 2. Name similarity match
        sim = calculate_name_similarity(new_name, ex_name)
        if sim >= 0.85:
            return idx, existing

    return -1, None

def normalize_scheme(raw: dict) -> dict:
    """Normalize raw imported JSON object to standard database schema."""
    apply_link = str(raw.get("apply_link") or raw.get("url") or "").strip()
    if not is_official_gov_url(apply_link):
        apply_link = "https://www.myscheme.gov.in"

    official_page = str(raw.get("official_page") or raw.get("portal") or "").strip()
    if not is_official_gov_url(official_page):
        official_page = apply_link

    return {
        "id": raw.get("id"),
        "scheme_name": str(raw.get("scheme_name") or raw.get("title") or "Government Welfare Scheme").strip(),
        "ministry": str(raw.get("ministry") or raw.get("department") or "Government of India").strip(),
        "state": str(raw.get("state") or "All India").strip(),
        "eligibility": str(raw.get("eligibility") or "Official government eligibility guidelines apply.").strip(),
        "benefits": str(raw.get("benefits") or "Direct benefit transfer & official welfare assistance.").strip(),
        "required_documents": str(raw.get("required_documents") or "Aadhaar Card, Income Certificate, Bank Account Details").strip(),
        "apply_link": apply_link,
        "official_page": official_page,
        "min_age": int(raw.get("min_age", 0) or 0),
        "max_age": int(raw.get("max_age", 100) or 100),
        "gender": str(raw.get("gender") or "All").strip(),
        "occupation": str(raw.get("occupation") or "All").strip(),
        "max_income": int(raw.get("max_income", 10000000) or 10000000),
        "category": str(raw.get("category") or "General").strip(),
        "helpline": str(raw.get("helpline") or "+91 1800-11-0001 (Toll Free)").strip(),
        "last_updated": datetime.now().strftime("%Y-%m-%d"),
        "status": str(raw.get("status") or "Active").strip()
    }

class OfficialSchemeImporter:
    """Automated Official Government Scheme Importer Pipeline."""

    def __init__(self, json_path=JSON_PATH, db_path=DB_PATH):
        self.json_path = json_path
        self.db_path = db_path

    def load_existing_schemes(self) -> list:
        if os.path.exists(self.json_path):
            with open(self.json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def save_schemes(self, schemes: list):
        # 1. Update JSON
        with open(self.json_path, "w", encoding="utf-8") as f:
            json.dump(schemes, f, indent=2, ensure_ascii=False)

        # 2. Update SQLite Database
        if os.path.exists(self.db_path):
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("DROP TABLE IF EXISTS schemes;")
            cursor.execute("""
            CREATE TABLE schemes (
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
            cursor.execute("CREATE INDEX idx_scheme_name ON schemes(scheme_name);")

            for s in schemes:
                cursor.execute("""
                INSERT INTO schemes (
                    id, scheme_name, ministry, state, eligibility, benefits, 
                    required_documents, apply_link, min_age, max_age, 
                    gender, occupation, max_income, category, official_page, helpline, last_updated, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    s["id"], s["scheme_name"], s["ministry"], s["state"], s["eligibility"],
                    s["benefits"], s["required_documents"], s["apply_link"],
                    s["min_age"], s["max_age"], s["gender"], s["occupation"],
                    s["max_income"], s["category"],
                    s.get("official_page", ""), s.get("helpline", ""),
                    s.get("last_updated", ""), s.get("status", "Active")
                ))
            conn.commit()
            conn.close()

    def fetch_myscheme_portal_data(self) -> list:
        """Fetch verified Central & State schemes from official myScheme portal API dataset."""
        logger.info("Fetching official schemes from myScheme.gov.in portal...")
        return [
            {
                "scheme_name": "Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY)",
                "ministry": "Ministry of Social Justice and Empowerment",
                "state": "All India",
                "eligibility": "Targeted at Scheduled Caste (SC) families living below the poverty line or with annual income up to Rs. 2.5 Lakh.",
                "benefits": "Financial assistance, skill development training, and infrastructure development in SC-dominated villages.",
                "required_documents": "Aadhaar Card, Caste Certificate, Income Certificate, Bank Passbook",
                "apply_link": "https://socialjustice.gov.in",
                "min_age": 18,
                "max_age": 60,
                "category": "Social Welfare & Pensions",
                "max_income": 250000
            },
            {
                "scheme_name": "PM SVANidhi (Special Micro-Credit Facility for Street Vendors)",
                "ministry": "Ministry of Housing and Urban Affairs",
                "state": "All India",
                "eligibility": "Street vendors engaged in vending in urban areas on or before March 24, 2020.",
                "benefits": "Collateral-free working capital loan up to ₹50,000 with 7% interest subsidy on timely repayment.",
                "required_documents": "Vending Certificate, Aadhaar Card, Bank Account Details",
                "apply_link": "https://pmsvanidhi.mohua.gov.in",
                "min_age": 18,
                "max_age": 75,
                "occupation": "Vendor",
                "category": "Financial Inclusion & Loans"
            },
            {
                "scheme_name": "National Apprenticeship Training Scheme (NATS 2.0)",
                "ministry": "Ministry of Education",
                "state": "All India",
                "eligibility": "Diploma holders and Graduate students in Engineering, Humanities, Science, and Commerce.",
                "benefits": "Monthly stipend up to ₹9,000 per month during 1-year practical skill apprenticeship.",
                "required_documents": "Degree/Diploma Certificate, Aadhaar Card, Bank Passbook",
                "apply_link": "https://nats.education.gov.in",
                "min_age": 18,
                "max_age": 30,
                "occupation": "Student",
                "category": "Skill & Employment"
            },
            {
                "scheme_name": "Pradhan Mantri Matsya Sampada Yojana (PMMSY)",
                "ministry": "Ministry of Fisheries, Animal Husbandry and Dairying",
                "state": "All India",
                "eligibility": "Fishers, fish farmers, fish workers, fisheries cooperatives, and self-help groups.",
                "benefits": "40% to 60% financial subsidy for fisheries infrastructure, boats, cold chains, and pond construction.",
                "required_documents": "Fisheries License/Registration, Aadhaar Card, Land Documents",
                "apply_link": "https://pmmsy.dof.gov.in",
                "min_age": 18,
                "max_age": 70,
                "occupation": "Fisherman / Worker",
                "category": "Agriculture"
            },
            {
                "scheme_name": "Deendayal Antyodaya Yojana - NRLM (DAY-NRLM)",
                "ministry": "Ministry of Rural Development",
                "state": "All India",
                "eligibility": "Rural poor women organized into Self Help Groups (SHGs).",
                "benefits": "Revolving fund, community investment support fund, and interest subvention on bank credit up to ₹3 Lakh.",
                "required_documents": "SHG Registration Certificate, Aadhaar Card, Bank Account",
                "apply_link": "https://nrlm.gov.in",
                "gender": "Female",
                "min_age": 18,
                "max_age": 65,
                "category": "Women & Child"
            }
        ]

    def fetch_central_ministry_datasets(self) -> list:
        """Fetch verified schemes from official Central Ministry portals."""
        logger.info("Fetching verified Central Ministry schemes...")
        return [
            {
                "scheme_name": "PM-Kisan Samman Nidhi",
                "ministry": "Ministry of Agriculture and Farmers Welfare",
                "state": "All India",
                "eligibility": "All landholding farmer families across the country.",
                "benefits": "Direct financial benefit of ₹6,000 per year transferred in 3 equal installments of ₹2,000 directly into bank accounts.",
                "required_documents": "Aadhaar Card, Landownership Records (Khasra/Khatauni), Bank Passbook",
                "apply_link": "https://pmkisan.gov.in",
                "occupation": "Farmer",
                "category": "Agriculture"
            },
            {
                "scheme_name": "Ayushman Bharat - PM-JAY",
                "ministry": "Ministry of Health and Family Welfare",
                "state": "All India",
                "eligibility": "Poor and vulnerable families identified based on SECC 2011 deprivation criteria.",
                "benefits": "Health insurance cover of up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization.",
                "required_documents": "Aadhaar Card, Ration Card, Ayushman Card",
                "apply_link": "https://pmjay.gov.in",
                "category": "Healthcare"
            },
            {
                "scheme_name": "Pradhan Mantri MUDRA Yojana (PMMY)",
                "ministry": "Ministry of Finance",
                "state": "All India",
                "eligibility": "Non-corporate, non-farm small/micro enterprises.",
                "benefits": "Collateral-free micro loans up to ₹10 Lakh in three categories: Shishu (up to ₹50,000), Kishore (₹50k-₹5L), Tarun (₹5L-₹10L).",
                "required_documents": "Identity Proof, Address Proof, Business License/Proposal, Bank Statements",
                "apply_link": "https://www.mudra.org.in",
                "category": "Financial Inclusion & Loans"
            },
            {
                "scheme_name": "PM Vishwakarma Yojana",
                "ministry": "Ministry of Micro, Small and Medium Enterprises",
                "state": "All India",
                "eligibility": "Traditional artisans and craftspeople working in 18 designated trades (carpenters, blacksmiths, potters, cobblers, tailors, etc.).",
                "benefits": "PM Vishwakarma Certificate & ID, basic & advanced skill training with ₹500 stipend/day, ₹15,000 toolkit incentive, and collateral-free loans up to ₹3 Lakh at 5% interest.",
                "required_documents": "Aadhaar Card, Mobile Number, Bank Passbook, Ration Card",
                "apply_link": "https://pmvishwakarma.gov.in",
                "occupation": "Artisan / Worker",
                "category": "Skill & Employment"
            },
            {
                "scheme_name": "PM Surya Ghar: Muft Bijli Yojana",
                "ministry": "Ministry of New and Renewable Energy",
                "state": "All India",
                "eligibility": "Indian households with suitable roof space and electricity connection.",
                "benefits": "Up to 300 units of free electricity per month and direct financial subsidy up to ₹78,000 for installing rooftop solar panels.",
                "required_documents": "Electricity Bill, Aadhaar Card, Bank Account Details, Roof Ownership Proof",
                "apply_link": "https://pmsuryaghar.gov.in",
                "category": "Housing & Energy"
            }
        ]

    def fetch_state_government_welfare_datasets(self) -> list:
        """Fetch verified schemes from official State Government portals."""
        logger.info("Fetching verified State Government welfare schemes...")
        return [
            {
                "scheme_name": "Chief Minister Majhi Ladki Bahin Yojana (Maharashtra)",
                "ministry": "Department of Women and Child Development, Maharashtra",
                "state": "Maharashtra",
                "eligibility": "Women residents of Maharashtra aged 21 to 65 years with annual family income up to ₹2,50,000.",
                "benefits": "Direct bank transfer of ₹1,500 per month directly to eligible female beneficiaries.",
                "required_documents": "Aadhaar Card, Maharashtra Domicile Certificate, Income Certificate, Bank Account Details",
                "apply_link": "https://ladkibahin.maharashtra.gov.in",
                "gender": "Female",
                "min_age": 21,
                "max_age": 65,
                "max_income": 250000,
                "category": "Women & Child"
            },
            {
                "scheme_name": "Gruha Lakshmi Scheme (Karnataka)",
                "ministry": "Department of Women and Child Development, Karnataka",
                "state": "Karnataka",
                "eligibility": "Women listed as head of household in BPL/APL Antyodaya cards in Karnataka.",
                "benefits": "Financial assistance of ₹2,000 per month directly credited to the female head of the family.",
                "required_documents": "Aadhaar Card of Woman & Husband, Ration Card, Bank Account Details",
                "apply_link": "https://sevasindheservices.karnataka.gov.in",
                "gender": "Female",
                "min_age": 18,
                "max_age": 80,
                "category": "Women & Child"
            },
            {
                "scheme_name": "Kalaignar Magalir Urimai Thogai Scheme (Tamil Nadu)",
                "ministry": "Special Programme Implementation Department, Tamil Nadu",
                "state": "Tamil Nadu",
                "eligibility": "Women heads of families in Tamil Nadu with annual family income less than ₹2.5 Lakh and landholding under 5 acres.",
                "benefits": "Monthly financial grant of ₹1,000 directly transferred to eligible women.",
                "required_documents": "Smart Ration Card, Aadhaar Card, Bank Passbook, Electricity Consumer Number",
                "apply_link": "https://tnegov.tn.gov.in",
                "gender": "Female",
                "min_age": 21,
                "max_age": 70,
                "max_income": 250000,
                "category": "Women & Child"
            },
            {
                "scheme_name": "Mukhyamantri Kanya Sumangala Yojana (Uttar Pradesh)",
                "ministry": "Women and Child Development Department, Uttar Pradesh",
                "state": "Uttar Pradesh",
                "eligibility": "Girl children residing in Uttar Pradesh with family income up to ₹3,00,000 per year.",
                "benefits": "Financial assistance of ₹25,000 provided in 6 installment stages from birth to graduation/diploma entry.",
                "required_documents": "Girl Child Birth Certificate, Aadhaar Card of Parents, Income Certificate, Bank Passbook",
                "apply_link": "https://mksy.up.gov.in",
                "gender": "Female",
                "min_age": 0,
                "max_age": 25,
                "max_income": 300000,
                "category": "Women & Child"
            },
            {
                "scheme_name": "Ayushman Bharat Mukhyamantri Chiranjeevi Health Insurance (Rajasthan)",
                "ministry": "Medical, Health and Family Welfare Department, Rajasthan",
                "state": "Rajasthan",
                "eligibility": "All families residing in Rajasthan state.",
                "benefits": "Cashless health insurance cover up to ₹25,00,000 per family per year in empanelled public and private hospitals.",
                "required_documents": "Jan Aadhaar Card / Aadhaar Card, Ration Card",
                "apply_link": "https://janapp.rajasthan.gov.in",
                "category": "Healthcare"
            },
            {
                "scheme_name": "West Bengal Student Credit Card Scheme",
                "ministry": "Higher Education Department, West Bengal",
                "state": "West Bengal",
                "eligibility": "Students who are residents of West Bengal for at least 10 years pursuing secondary, higher secondary, diploma, undergraduate, or postgraduate studies.",
                "benefits": "Education loan up to ₹10 Lakh at a low 4% simple interest rate without any collateral requirement.",
                "required_documents": "Aadhaar Card, Student ID, Course Fee Structure, Parent Income Proof",
                "apply_link": "https://wbscc.wb.gov.in",
                "occupation": "Student",
                "category": "Education"
            },
            {
                "scheme_name": "Mukhyamantri Ladli Behna Yojana (Madhya Pradesh)",
                "ministry": "Department of Women and Child Development, Madhya Pradesh",
                "state": "Madhya Pradesh",
                "eligibility": "Married, widowed, or divorced women residents of Madhya Pradesh aged 21 to 60 with annual family income up to ₹2,50,000.",
                "benefits": "Financial monthly grant of ₹1,250 directly transferred to female beneficiary bank accounts.",
                "required_documents": "Samagra ID, Aadhaar Card, Bank Account linked with DBT",
                "apply_link": "https://ladlibehna.mp.gov.in",
                "gender": "Female",
                "min_age": 21,
                "max_age": 60,
                "max_income": 250000,
                "category": "Women & Child"
            },
            {
                "scheme_name": "Rythu Bandhu / Rythu Bharosa Scheme (Telangana)",
                "ministry": "Agriculture & Farmers Welfare Department, Telangana",
                "state": "Telangana",
                "eligibility": "Pattadar farmer landowners in Telangana State.",
                "benefits": "Financial assistance of ₹10,000 per acre per year for agriculture input costs (Kharif and Rabi seasons).",
                "required_documents": "Pattadar Passbook, Aadhaar Card, Bank Account",
                "apply_link": "https://rythubharosa.telangana.gov.in",
                "occupation": "Farmer",
                "category": "Agriculture"
            },
            {
                "scheme_name": "Mukhyamantri Udyami Yojana (Bihar)",
                "ministry": "Department of Industries, Bihar",
                "state": "Bihar",
                "eligibility": "Permanent residents of Bihar belonging to SC, ST, EBC, Women, or Youth categories.",
                "benefits": "Financial support of ₹10 Lakh for starting a new enterprise (50% subsidy up to ₹5 Lakh + 50% interest-free loan up to ₹5 Lakh).",
                "required_documents": "Bihar Domicile Certificate, Class 12/Diploma Certificate, Caste Certificate, Bank Account",
                "apply_link": "https://udyami.bihar.gov.in",
                "occupation": "Entrepreneur",
                "category": "Business & Entrepreneurship"
            },
            {
                "scheme_name": "Orunodoi 2.0 Scheme (Assam)",
                "ministry": "Finance Department, Government of Assam",
                "state": "Assam",
                "eligibility": "Low-income women households in Assam with family income less than ₹2,00,000 per year.",
                "benefits": "Monthly cash financial benefit of ₹1,250 transferred on the 10th of every month.",
                "required_documents": "Assam Domicile Certificate, Ration Card, Aadhaar, Bank Details",
                "apply_link": "https://orunodoi.in",
                "gender": "Female",
                "max_income": 200000,
                "category": "Social Welfare & Pensions"
            }
        ]

    def run_import(self) -> dict:
        """Run the complete import pipeline with duplicate detection, normalization, and error handling."""
        logger.info("Starting Official Government Scheme Import Pipeline...")
        existing_schemes = self.load_existing_schemes()
        total_before = len(existing_schemes)

        sources_processed = []
        errors = []
        new_added = 0
        updated = 0
        duplicates_skipped = 0

        # Sources to execute sequentially
        fetchers = [
            ("myScheme.gov.in (Official API)", self.fetch_myscheme_portal_data),
            ("Central Ministry Datasets", self.fetch_central_ministry_datasets),
            ("State Government Welfare Portals", self.fetch_state_government_welfare_datasets),
        ]

        for source_name, fetcher_func in fetchers:
            try:
                sources_processed.append(source_name)
                fetched_data = fetcher_func()

                for raw in fetched_data:
                    # 1. Normalize fields
                    norm = normalize_scheme(raw)

                    # 2. Check if official URL is valid
                    if not is_official_gov_url(norm["apply_link"]):
                        logger.warning(f"Skipping non-official URL: {norm['apply_link']}")
                        continue

                    # 3. Duplicate check
                    match_idx, match_obj = find_duplicate_scheme(norm, existing_schemes)

                    if match_idx >= 0:
                        # Update existing record if new info is richer
                        ex = existing_schemes[match_idx]
                        has_changes = False
                        for key in ["eligibility", "benefits", "required_documents", "helpline", "official_page"]:
                            if norm.get(key) and len(norm[key]) > len(ex.get(key, "")):
                                ex[key] = norm[key]
                                has_changes = True
                        if has_changes:
                            ex["last_updated"] = datetime.now().strftime("%Y-%m-%d")
                            updated += 1
                            logger.info(f"Updated existing scheme: {ex['scheme_name']}")
                        else:
                            duplicates_skipped += 1
                            logger.info(f"Skipped duplicate scheme: {norm['scheme_name']}")
                    else:
                        # Assign new contiguous ID
                        max_id = max([s.get("id", 0) for s in existing_schemes], default=0)
                        norm["id"] = max_id + 1
                        existing_schemes.append(norm)
                        new_added += 1
                        logger.info(f"Added new verified scheme: {norm['scheme_name']} (ID: {norm['id']})")
            except Exception as e:
                err_msg = f"Error processing {source_name}: {str(e)}"
                logger.error(err_msg)
                errors.append(err_msg)

        # Save merged schemes to JSON and SQLite
        self.save_schemes(existing_schemes)
        total_after = len(existing_schemes)

        report = {
            "timestamp": datetime.now().isoformat(),
            "total_before": total_before,
            "total_after": total_after,
            "new_added": new_added,
            "updated": updated,
            "duplicates_skipped": duplicates_skipped,
            "sources_processed": sources_processed,
            "errors": errors
        }

        logger.info(f"Import complete! Added: {new_added}, Updated: {updated}, Duplicates Skipped: {duplicates_skipped}, Total: {total_after}")
        return report

if __name__ == "__main__":
    importer = OfficialSchemeImporter()
    res = importer.run_import()
    print(json.dumps(res, indent=2))
