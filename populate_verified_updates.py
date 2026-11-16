import sqlite3
import datetime
import os

DB_PATHS = [
    os.path.abspath("backend/scheme_saarthi.db"),
    os.path.abspath("scheme_saarthi.db")
]

OFFICIAL_UPDATES = [
    {
        "keyword": "PM-KISAN",
        "update_type": "Disbursement Notice",
        "title": "19th Installment DBT Credit Verification Completed",
        "summary": "Ministry of Agriculture announced the successful verification of Aadhaar eKYC for the 19th installment. Eligible landholding farmers receive ₹2,000 directly via DBT into bank accounts.",
        "previous_val": "18th Installment Disbursed",
        "new_val": "19th Installment Scheduled",
        "status": "Approved",
        "days_ago": 1,
        "source": "https://pmkisan.gov.in"
    },
    {
        "keyword": "Ayushman Bharat",
        "update_type": "Eligibility Expansion",
        "title": "Universal Health Coverage for All Senior Citizens 70+ Implemented",
        "summary": "Union Cabinet approved health insurance coverage up to ₹5 lakh per year to all senior citizens aged 70 and above, irrespective of family income or economic status.",
        "previous_val": "Income & SECC Restricted",
        "new_val": "All Senior Citizens 70+ Eligible",
        "status": "Approved",
        "days_ago": 2,
        "source": "https://nha.gov.in"
    },
    {
        "keyword": "Pradhan Mantri MUDRA",
        "update_type": "Benefit Enhancement",
        "title": "MUDRA Loan Ceiling Enhanced to ₹20 Lakh",
        "summary": "Union Budget notification increased the maximum credit limit under the Tarun Plus category from ₹10 Lakh to ₹20 Lakh for entrepreneurs with good repayment track record.",
        "previous_val": "₹10,00,000 Maximum Ceiling",
        "new_val": "₹20,00,000 Maximum Ceiling (Tarun Plus)",
        "status": "Approved",
        "days_ago": 3,
        "source": "https://mudra.org.in"
    },
    {
        "keyword": "Post Matric Scholarship",
        "update_type": "Application Deadline",
        "title": "Tamil Nadu Post-Matric Scholarship Portal Opened for AY 2026-27",
        "summary": "Adi Dravidar and Tribal Welfare Department announced opening of online application verification portal for Post-Matric SC/ST and converted Christian college students.",
        "previous_val": "Portal Closed",
        "new_val": "Active - Open for Enrollment",
        "status": "Approved",
        "days_ago": 4,
        "source": "https://scholarships.gov.in"
    },
    {
        "keyword": "Comprehensive Health Insurance",
        "update_type": "Network Expansion",
        "title": "CMCHIS Hospital Empanelment Network Reaches 1,850 Hospitals",
        "summary": "Tamil Nadu Health Department expanded cashless empanelled private and government hospital network to include 85 new tertiary multi-specialty healthcare centers.",
        "previous_val": "1,765 Empaneled Hospitals",
        "new_val": "1,850+ Empaneled Hospitals",
        "status": "Approved",
        "days_ago": 5,
        "source": "https://cmchistn.com"
    },
    {
        "keyword": "Breakfast Scheme",
        "update_type": "Coverage Extension",
        "title": "Chief Minister's Breakfast Scheme Expanded to All Rural Schools",
        "summary": "Government of Tamil Nadu expanded nutritious hot breakfast coverage to 31,008 government primary schools across the state, benefiting over 17 lakh students daily.",
        "previous_val": "Corporation & Municipal Schools",
        "new_val": "All 31,008 Government Primary Schools",
        "status": "Approved",
        "days_ago": 6,
        "source": "https://tn.gov.in"
    },
    {
        "keyword": "Pradhan Mantri Awas Yojana",
        "update_type": "Policy Revision",
        "title": "PMAY Housing Subsidy Extended with 2 Crore Additional Homes",
        "summary": "Ministry of Rural Development notified continuation of PMAY-Gramin with ₹1.20 lakh assistance in plains and ₹1.30 lakh in hilly areas for 2 crore additional rural households.",
        "previous_val": "Phase-1 Targets Completed",
        "new_val": "2 Crore Additional Homes Approved",
        "status": "Approved",
        "days_ago": 7,
        "source": "https://pmayg.nic.in"
    },
    {
        "keyword": "Deendayal Antyodaya",
        "update_type": "Credit Enhancement",
        "title": "Collateral-free Loan Ceiling for Women SHGs Raised to ₹20 Lakh",
        "summary": "Reserve Bank of India & Ministry of Rural Development notified increased limit of collateral-free credit for Women Self-Help Groups under DAY-NRLM from ₹10 lakh to ₹20 lakh.",
        "previous_val": "₹10,00,000 Collateral-free",
        "new_val": "₹20,00,000 Collateral-free",
        "status": "Approved",
        "days_ago": 8,
        "source": "https://aajeevika.gov.in"
    },
    {
        "keyword": "Stand-Up India",
        "update_type": "Policy Revision",
        "title": "Margin Money Requirement Reduced to 15% for SC/ST and Women",
        "summary": "Small business entrepreneurs from SC, ST and Women categories can now avail composite loans between ₹10 lakh and ₹1 crore with reduced margin money obligation of only 15%.",
        "previous_val": "Up to 25% Margin Money",
        "new_val": "15% Margin Money Obligation",
        "status": "Approved",
        "days_ago": 9,
        "source": "https://standupmitra.in"
    },
    {
        "keyword": "Fasal Bima",
        "update_type": "Disbursement Notice",
        "title": "PMFBY Kharif Weather Claim Processing Timeline Reduced to 21 Days",
        "summary": "Ministry of Agriculture implemented automated satellite-based yield estimation and remote sensing technology to settle crop damage claims within 21 days directly to DBT accounts.",
        "previous_val": "45-60 Days Settlement",
        "new_val": "21 Days Fast-track DBT",
        "status": "Approved",
        "days_ago": 10,
        "source": "https://pmfby.gov.in"
    }
]

def populate_database(db_path):
    if not os.path.exists(db_path):
        print(f"Skipping non-existent {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Check existing updates
    cur.execute("SELECT count(*) FROM scheme_updates")
    initial_count = cur.fetchone()[0]
    print(f"\nProcessing {db_path} (Existing updates: {initial_count})")
    
    now = datetime.datetime.utcnow()
    added = 0
    
    for u in OFFICIAL_UPDATES:
        # Check if an update with this title already exists
        cur.execute("SELECT id FROM scheme_updates WHERE title = ?", (u["title"],))
        if cur.fetchone():
            continue
        
        # Find matching scheme
        cur.execute("SELECT id, name FROM schemes WHERE name LIKE ? LIMIT 1", (f"%{u['keyword']}%",))
        scheme_row = cur.fetchone()
        
        if not scheme_row:
            # Fallback to any scheme
            cur.execute("SELECT id, name FROM schemes LIMIT 1")
            scheme_row = cur.fetchone()
            
        if not scheme_row:
            continue
            
        scheme_id, scheme_name = scheme_row
        detected_time = now - datetime.timedelta(days=u["days_ago"], hours=2)
        verified_time = now - datetime.timedelta(days=u["days_ago"])
        
        cur.execute("""
            INSERT INTO scheme_updates (
                scheme_id, update_type, title, change_summary,
                previous_value, new_value, verification_status,
                verified_by, verified_at, source_url, detected_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            scheme_id,
            u["update_type"],
            u["title"],
            u["summary"],
            u["previous_val"],
            u["new_val"],
            u["status"],
            1, # Admin ID
            verified_time.strftime("%Y-%m-%d %H:%M:%S"),
            u["source"],
            detected_time.strftime("%Y-%m-%d %H:%M:%S")
        ))
        added += 1
        print(f"  + Added update: '{u['title']}' for scheme '{scheme_name[:40]}...'")
        
    conn.commit()
    cur.execute("SELECT count(*) FROM scheme_updates")
    final_count = cur.fetchone()[0]
    conn.close()
    print(f"Finished {db_path}: Added {added} new verified updates. Total now: {final_count}")

if __name__ == "__main__":
    for p in DB_PATHS:
        populate_database(p)
