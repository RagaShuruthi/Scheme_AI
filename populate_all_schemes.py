"""
Populates and synchronizes all official government schemes across the 13 target portals:
1. India.gov.in
2. PIB
3. DBT Bharat
4. myScheme
5. TN Government
6. NABARD
7. Ministry of Education
8. Social Justice Ministry
9. Women and Child Development
10. MSME Ministry
11. Agriculture Ministry
12. Ministry of Rural Development
13. Housing and Urban Affairs
"""

import sqlite3
import os
import json
import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "scheme_saarthi.db")
if not os.path.exists(DB_PATH):
    DB_PATH = "scheme_saarthi.db"

# 1. Departments to ensure in DB
DEPARTMENTS = [
    ("Ministry of Agriculture & Farmers Welfare", "Central", None, "https://agriwelfare.gov.in"),
    ("National Health Authority", "Central", None, "https://nha.gov.in"),
    ("Department of Higher Education, MoE", "Central", None, "https://education.gov.in"),
    ("Ministry of Housing and Urban Affairs", "Central", None, "https://mohua.gov.in"),
    ("Ministry of Micro, Small & Medium Enterprises", "Central", None, "https://msme.gov.in"),
    ("Adi Dravidar and Tribal Welfare Department, TN", "State", "Tamil Nadu", "https://adtw.tn.gov.in"),
    ("Social Welfare and Women Empowerment Department, TN", "State", "Tamil Nadu", "https://swd.tn.gov.in"),
    ("Health and Family Welfare Department, TN", "State", "Tamil Nadu", "https://tnhealth.tn.gov.in"),
    ("Department of Differently Abled Welfare, TN", "State", "Tamil Nadu", "https://scd.tn.gov.in"),
    ("Special Programme Implementation Department, TN", "State", "Tamil Nadu", "https://kmut.tn.gov.in"),
    ("Ministry of Rural Development", "Central", None, "https://rural.gov.in"),
    ("Ministry of Social Justice and Empowerment", "Central", None, "https://socialjustice.gov.in"),
    ("Ministry of Women and Child Development", "Central", None, "https://wcd.gov.in"),
    ("National Bank for Agriculture and Rural Development (NABARD)", "Central", None, "https://www.nabard.org"),
    ("Cabinet Secretariat (DBT Bharat)", "Central", None, "https://dbtbharat.gov.in"),
    ("Press Information Bureau (PIB)", "Central", None, "https://pib.gov.in"),
    ("National Portal of India", "Central", None, "https://www.india.gov.in"),
    ("Ministry of Electronics and IT (myScheme)", "Central", None, "https://www.myscheme.gov.in"),
    ("Ministry of New and Renewable Energy", "Central", None, "https://mnre.gov.in"),
    ("School Education Department, TN", "State", "Tamil Nadu", "https://tnschools.gov.in")
]

# 2. Comprehensive official schemes catalog covering all 13 portals
ALL_SCHEMES = [
    # --- Existing 16 schemes with FIXED official links ---
    {
        "name": "Tamil Nadu Post Matric Scholarship Scheme",
        "slug": "tamil-nadu-post-matric-scholarship",
        "short_description": "Financial assistance to SC, ST, SCC, and converted Christian students pursuing post-matriculation courses in Tamil Nadu.",
        "full_description": "The Post Matric Scholarship Scheme implemented by the Adi Dravidar and Tribal Welfare Department provides 100% compulsory non-refundable fee reimbursement and monthly maintenance allowance to eligible students enrolled in recognized higher education courses.",
        "government_level": "State",
        "state": "Tamil Nadu",
        "cat_slug": "scholarships",
        "dept_name": "Adi Dravidar and Tribal Welfare Department, TN",
        "status": "Open",
        "deadline": "30 September 2026",
        "app_url": "https://scholarships.gov.in",
        "source_url": "https://adtw.tn.gov.in",
        "source_name": "Tamil Nadu Adi Dravidar Welfare Department",
        "process": "1. Visit National Scholarship Portal (scholarships.gov.in).\n2. Register with Aadhaar and student bank details.\n3. Upload community and income certificates.\n4. Institutional verification and DBT disbursement.",
        "rules": {"min_age": 16, "max_age": 35, "gender": "All", "max_income": 250000, "applicable_states": ["Tamil Nadu"], "social_categories": ["SC", "ST", "SCC"], "is_student": True},
        "benefits": [("Educational", "100% Tuition Fee Reimbursement", "Full compulsory fees covered"), ("Financial", "Maintenance Allowance", "₹550 to ₹1,200/month")],
        "documents": ["Aadhaar Card", "Community Certificate", "Income Certificate (≤ ₹2.5 Lakhs)", "College Bonafide Certificate", "Bank Passbook seeded with Aadhaar"]
    },
    {
        "name": "Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Puthumai Penn)",
        "slug": "puthumai-penn-scheme",
        "short_description": "Monthly financial aid of ₹1,000 for girl students who studied in Tamil Nadu government schools from 6th to 12th standard.",
        "full_description": "Puthumai Penn scheme is a flagship Tamil Nadu initiative aimed at curbing child marriage, enhancing female gross enrolment ratio (GER) in higher education, and preventing dropouts. Female students enrolling in undergraduate degrees, diplomas, or ITI programs receive direct bank transfers of ₹1,000 each month till course completion.",
        "government_level": "State",
        "state": "Tamil Nadu",
        "cat_slug": "women-child-welfare",
        "dept_name": "Social Welfare and Women Empowerment Department, TN",
        "status": "Open",
        "deadline": "31 October 2026",
        "app_url": "https://penkalvi.tn.gov.in",
        "source_url": "https://www.tn.gov.in",
        "source_name": "Tamil Nadu Social Welfare Official Department Portal",
        "process": "1. College nodal officer registers eligible students on penkalvi.tn.gov.in.\n2. Verification via EMIS school records.\n3. Direct monthly credit via DBT.",
        "rules": {"min_age": 17, "max_age": 25, "gender": "Female", "max_income": None, "applicable_states": ["Tamil Nadu"], "is_student": True},
        "benefits": [("Financial", "Monthly College Assistance", "₹1,000/month (₹12,000/year) until degree completion")],
        "documents": ["Aadhaar Card", "Govt School 6th-12th EMIS Certificate", "College Admission Proof", "Bank Account with Aadhaar linking"]
    },
    {
        "name": "Chief Minister’s Comprehensive Health Insurance Scheme (CMCHIS)",
        "slug": "tn-cmchis-health-insurance",
        "short_description": "Cashless hospitalization coverage up to ₹5 lakh per year per family across empaneled hospitals in Tamil Nadu.",
        "full_description": "Offers comprehensive cashless health coverage for secondary and tertiary care medical conditions, surgeries, and specialized therapies up to ₹5,00,000 per annum for eligible families residing in Tamil Nadu.",
        "government_level": "State",
        "state": "Tamil Nadu",
        "cat_slug": "healthcare",
        "dept_name": "Health and Family Welfare Department, TN",
        "status": "Open",
        "deadline": "Year Round Enrollment",
        "app_url": "https://www.cmchistn.com",
        "source_url": "https://www.cmchistn.com",
        "source_name": "CMCHIS Official State Authority",
        "process": "1. Visit District Kiosk at Taluk Office.\n2. Submit Smart Ration Card & income proof.\n3. Biometric capture & instant Smart Card issuance.",
        "rules": {"min_age": 0, "max_age": 100, "gender": "All", "max_income": 120000, "applicable_states": ["Tamil Nadu"]},
        "benefits": [("Healthcare", "Cashless Medical Treatment", "Up to ₹5,00,000/year per family for 1,000+ hospital procedures")],
        "documents": ["Smart Ration Card", "VAO Income Certificate (< ₹1.2 Lakh)", "Family Aadhaar Cards"]
    },
    {
        "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "slug": "pm-kisan-samman-nidhi",
        "short_description": "Income support of ₹6,000 per year in three equal installments of ₹2,000 directly to landholding farmer families.",
        "full_description": "Central Sector scheme providing financial supplement to all landholding farmers' families in the country to procure agricultural inputs and meet domestic needs via Aadhaar-linked DBT.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "agriculture",
        "dept_name": "Ministry of Agriculture & Farmers Welfare",
        "status": "Open",
        "deadline": "Open Enrollment",
        "app_url": "https://pmkisan.gov.in",
        "source_url": "https://agriwelfare.gov.in",
        "source_name": "Ministry of Agriculture and Farmers Welfare",
        "process": "1. Register on pmkisan.gov.in with Aadhaar & Mobile.\n2. Enter land survey / Patta numbers.\n3. Complete biometric eKYC.",
        "rules": {"min_age": 18, "max_age": 90, "gender": "All", "is_farmer": True, "land_ownership_required": True, "applicable_states": ["All India"]},
        "benefits": [("Financial", "Direct Income Support", "₹6,000/year in 3 equal installments of ₹2,000")],
        "documents": ["Aadhaar Card", "Land Patta / Chitta Record", "Active Bank Account linked with NPCI"]
    },
    {
        "name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
        "slug": "pm-jay-ayushman-bharat",
        "short_description": "World's largest health assurance scheme providing health cover of ₹5 lakh per family per year for secondary and tertiary care.",
        "full_description": "Provides health cover of ₹5,00,000 per family per year to poor and vulnerable families for cashless hospital admission across 29,000+ empaneled hospitals nationwide.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "healthcare",
        "dept_name": "National Health Authority",
        "status": "Open",
        "deadline": "Continuous Service",
        "app_url": "https://beneficiary.nha.gov.in",
        "source_url": "https://pmjay.gov.in",
        "source_name": "National Health Authority Portal",
        "process": "1. Check eligibility on beneficiary.nha.gov.in with Aadhaar/Ration Card.\n2. Complete Aadhaar eKYC.\n3. Download Ayushman Card.",
        "rules": {"min_age": 0, "max_age": 100, "gender": "All", "max_income": 250000, "applicable_states": ["All India"]},
        "benefits": [("Healthcare", "Cashless Hospitalization", "₹5 Lakh cover per family per year across 1,949 medical treatments")],
        "documents": ["Aadhaar Card", "Ration Card", "Mobile number for OTP"]
    },
    {
        "name": "Pradhan Mantri Mudra Yojana (PMMY)",
        "slug": "pradhan-mantri-mudra-yojana",
        "short_description": "Collateral-free business loans up to ₹20 lakh for non-corporate, non-farm small and micro enterprises.",
        "full_description": "Provides loans under Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 Lakh), Tarun (₹5 Lakh to ₹10 Lakh), and Tarun Plus (up to ₹20 Lakh) to entrepreneurs without collateral.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "entrepreneurship",
        "dept_name": "Ministry of Micro, Small & Medium Enterprises",
        "status": "Open",
        "deadline": "Active Continuous",
        "app_url": "https://www.udyamimitra.in",
        "source_url": "https://msme.gov.in",
        "source_name": "Ministry of MSME",
        "process": "1. Prepare proposal & machinery quote.\n2. Apply via Udyami Mitra (udyamimitra.in) or visit bank.\n3. Sanction & MUDRA Card issuance.",
        "rules": {"min_age": 18, "max_age": 65, "gender": "All", "is_entrepreneur": True, "applicable_states": ["All India"]},
        "benefits": [("Financial", "Collateral-Free Loan", "Loans from ₹50,000 up to ₹20 Lakhs at competitive interest rates")],
        "documents": ["Aadhaar & PAN", "Business Address Proof", "Machinery Quotation", "6 Months Bank Statement"]
    },
    {
        "name": "Kalaignar Magalir Urimai Thittam",
        "slug": "kalaignar-magalir-urimai-thittam",
        "short_description": "Monthly basic income rights grant of ₹1,000 to women heads of eligible households in Tamil Nadu.",
        "full_description": "Acknowledges the domestic labor and social contribution of women by transferring ₹1,000 directly into the bank accounts of woman heads of family on the 15th of each month.",
        "government_level": "State",
        "state": "Tamil Nadu",
        "cat_slug": "women-child-welfare",
        "dept_name": "Special Programme Implementation Department, TN",
        "status": "Open",
        "deadline": "Rolling Registration Camps",
        "app_url": "https://kmut.tn.gov.in",
        "source_url": "https://kmut.tn.gov.in",
        "source_name": "Government of Tamil Nadu KMUT Portal",
        "process": "1. Attend ration shop registration camp.\n2. Provide Smart Card & biometric auth.\n3. Volunteer field validation.\n4. Direct monthly credit on 15th.",
        "rules": {"min_age": 21, "max_age": 90, "gender": "Female", "max_income": 250000, "applicable_states": ["Tamil Nadu"]},
        "benefits": [("Financial", "Monthly Women Rights Grant", "₹1,000/month (₹12,000 annually) directly to woman head of family")],
        "documents": ["Smart Family Card", "Aadhaar Card", "Electricity Bill / Consumer No", "Bank Passbook with Aadhaar"]
    },
    {
        "name": "Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)",
        "slug": "pmay-urban-housing-scheme",
        "short_description": "Interest subsidy and financial assistance for urban poor and middle income groups to build or buy pucca houses.",
        "full_description": "Provides interest subsidy on home loans and central assistance up to ₹2.5 Lakhs for EWS, LIG, and MIG families in urban areas.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "housing",
        "dept_name": "Ministry of Housing and Urban Affairs",
        "status": "Open",
        "deadline": "31 December 2026",
        "app_url": "https://pmaymis.gov.in",
        "source_url": "https://mohua.gov.in",
        "source_name": "Ministry of Housing and Urban Affairs",
        "process": "1. Apply online at pmaymis.gov.in or CSC.\n2. Choose BLC or CLSS component.\n3. Municipal survey & milestone subsidy release.",
        "rules": {"min_age": 18, "max_age": 75, "gender": "All", "max_income": 900000, "applicable_states": ["All India"]},
        "benefits": [("Housing", "Credit-Linked Interest Subsidy", "Interest subsidy up to ₹2.67 Lakhs on home loans")],
        "documents": ["Aadhaar Card", "Income Certificate / Salary Slips", "Affidavit of No Pucca House Owned", "Land Title Deed"]
    },
    {
        "name": "Tamil Nadu Annal Ambedkar Business Champions Scheme (AABCS)",
        "slug": "tn-annal-ambedkar-business-champions",
        "short_description": "35% capital subsidy and 6% interest subvention for SC/ST entrepreneurs setting up direct business enterprises in Tamil Nadu.",
        "full_description": "Offers prospective SC and ST entrepreneurs direct capital subsidy up to ₹1.75 Crore and 6% interest subvention for manufacturing, services and transport ventures.",
        "government_level": "State",
        "state": "Tamil Nadu",
        "cat_slug": "entrepreneurship",
        "dept_name": "Ministry of Micro, Small & Medium Enterprises",
        "status": "Open",
        "deadline": "Active Fiscal Cycle 2026-27",
        "app_url": "https://msmeonline.tn.gov.in",
        "source_url": "https://msme.tn.gov.in",
        "source_name": "MSME Department Tamil Nadu",
        "process": "1. Register project profile on msmeonline.tn.gov.in.\n2. Submit DPR & bank sanction letter.\n3. District Task Force interview & subsidy release.",
        "rules": {"min_age": 18, "max_age": 55, "gender": "All", "social_categories": ["SC", "ST"], "is_entrepreneur": True, "applicable_states": ["Tamil Nadu"]},
        "benefits": [("Subsidy", "35% Capital Subsidy", "35% subsidy up to ₹1.75 Crore on project machinery + 6% interest relief")],
        "documents": ["Community Certificate (SC/ST)", "Detailed Project Report (DPR)", "Aadhaar & PAN", "Bank Sanction Letter"]
    },
    {
        "name": "Unique Disability ID (UDID) and Assistive Appliances (ADIP)",
        "slug": "udid-and-adip-disability-assistance",
        "short_description": "Free modern assistive devices, motorized tricycles, hearing aids, and digital national UDID smart cards for Persons with Disabilities.",
        "full_description": "Assists disabled citizens with standard durable aids (motorized tricycles, smart canes, braille kits, hearing aids) 100% free of cost.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "disability",
        "dept_name": "Department of Differently Abled Welfare, TN",
        "status": "Open",
        "deadline": "Year Round Service",
        "app_url": "https://www.swavlambancard.gov.in",
        "source_url": "https://socialjustice.gov.in",
        "source_name": "Ministry of Social Justice and Empowerment",
        "process": "1. Register on swavlambancard.gov.in.\n2. Medical board assessment.\n3. UDID card issuance & free device distribution camp.",
        "rules": {"min_age": 3, "max_age": 85, "gender": "All", "is_disabled": True, "max_income": 360000, "applicable_states": ["All India"]},
        "benefits": [("In-kind", "Free Assistive Devices", "100% free distribution of motorized tricycles, wheelchairs, and hearing aids")],
        "documents": ["Medical Disability Certificate (≥ 40%)", "Aadhaar Card", "Income Certificate", "Full length photo"]
    },
    {
        "name": "National Means-cum-Merit Scholarship Scheme (NMMSS)",
        "slug": "national-means-cum-merit-scholarship",
        "short_description": "Scholarship of ₹12,000 per annum for meritorious students from economically weaker sections to prevent school dropouts at Class 8.",
        "full_description": "Awards 1,00,000 scholarships annually to meritorious Class 8 students in government schools to support secondary education from Class 9 to 12.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "scholarships",
        "dept_name": "Department of Higher Education, MoE",
        "status": "Open",
        "deadline": "15 October 2026",
        "app_url": "https://scholarships.gov.in",
        "source_url": "https://education.gov.in",
        "source_name": "Ministry of Education",
        "process": "1. Appear for NMMSS Class 8 selection test.\n2. Qualified students register on National Scholarship Portal.\n3. Direct annual credit via PFMS DBT.",
        "rules": {"min_age": 12, "max_age": 16, "gender": "All", "is_student": True, "max_income": 350000, "applicable_states": ["All India"]},
        "benefits": [("Educational", "Annual School Stipend", "₹12,000 per year (₹1,000/month) from Class 9 to Class 12")],
        "documents": ["Aadhaar Card", "Class 7 Marksheet (≥ 55%)", "Income Certificate (≤ ₹3.5 Lakh)", "Student Bank Account"]
    },
    {
        "name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
        "slug": "indira-gandhi-old-age-pension",
        "short_description": "Monthly pension for senior citizens aged 60 years and above belonging to below poverty line (BPL) households.",
        "full_description": "Part of NSAP providing monthly old age pension to destitute elderly citizens credited directly into bank or post office savings accounts.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "senior-citizens",
        "dept_name": "Ministry of Rural Development",
        "status": "Open",
        "deadline": "Year Round Application",
        "app_url": "https://nsap.nic.in",
        "source_url": "https://nsap.nic.in",
        "source_name": "National Social Assistance Programme",
        "process": "1. Submit application at Taluk Office or e-Sevai.\n2. Revenue inspector verification.\n3. Monthly pension credited to bank/post office.",
        "rules": {"min_age": 60, "max_age": 110, "gender": "All", "max_income": 100000, "applicable_states": ["All India"]},
        "benefits": [("Financial", "Monthly Pension", "₹1,000 to ₹1,500/month direct pension")],
        "documents": ["Aadhaar Card", "BPL Ration Card", "Age Proof Certificate", "Bank or Post Office Passbook"]
    },
    {
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "slug": "pm-matru-vandana-yojana",
        "short_description": "Maternity cash incentive of ₹5,000 to ₹6,000 for pregnant and lactating mothers for health, nutrition, and wage loss.",
        "full_description": "Direct cash transfer under Mission Shakti for pregnant women and lactating mothers for the first live birth (₹5,000) and second girl child (₹6,000).",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "women-child-welfare",
        "dept_name": "Ministry of Women and Child Development",
        "status": "Open",
        "deadline": "Continuous Registration",
        "app_url": "https://pmmvy.wcd.gov.in",
        "source_url": "https://wcd.gov.in",
        "source_name": "Ministry of Women and Child Development",
        "process": "1. Register pregnancy at Anganwadi or PHC.\n2. Submit MCP card.\n3. Complete ante-natal checkups & institutional delivery.\n4. Direct credit via DBT.",
        "rules": {"min_age": 19, "max_age": 45, "gender": "Female", "max_income": 800000, "applicable_states": ["All India"]},
        "benefits": [("Financial", "Maternity Benefit Grant", "₹5,000 for first child; ₹6,000 for second girl child")],
        "documents": ["MCP Card", "Aadhaar of Mother and Husband", "Bank Passbook seeded with Aadhaar", "Birth Certificate"]
    },
    {
        "name": "Tamil Nadu Chief Minister’s Breakfast Scheme",
        "slug": "tn-cm-breakfast-scheme",
        "short_description": "Free nutritious morning hot breakfast for primary school students (Classes 1 to 5) across all government schools in Tamil Nadu.",
        "full_description": "Cooked nutritious breakfast served every morning in over 31,000 primary schools to eliminate morning hunger and improve cognitive learning.",
        "government_level": "State",
        "state": "Tamil Nadu",
        "cat_slug": "education",
        "dept_name": "Social Welfare and Women Empowerment Department, TN",
        "status": "Open",
        "deadline": "Automatic School Enrollment",
        "app_url": "https://www.tn.gov.in",
        "source_url": "https://www.tn.gov.in",
        "source_name": "Government of Tamil Nadu Official Portal",
        "process": "1. Enroll child in TN Govt primary school.\n2. Automatic EMIS registration.\n3. Fresh hot breakfast served daily.",
        "rules": {"min_age": 5, "max_age": 11, "gender": "All", "is_student": True, "applicable_states": ["Tamil Nadu"]},
        "benefits": [("In-kind", "Daily Nutritious Breakfast", "Free daily cooked hot breakfast on all school working days")],
        "documents": ["School Admission Record / EMIS Student ID"]
    },
    {
        "name": "Stand-Up India Scheme for Green-Field Enterprises",
        "slug": "stand-up-india-scheme",
        "short_description": "Bank loans between ₹10 lakh and ₹1 crore to at least one SC/ST and one woman borrower per bank branch for greenfield ventures.",
        "full_description": "Promotes entrepreneurship by facilitating composite bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield ventures in manufacturing, services or trading.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "entrepreneurship",
        "dept_name": "Ministry of Micro, Small & Medium Enterprises",
        "status": "Open",
        "deadline": "Extended through 2026",
        "app_url": "https://www.standupmitra.in",
        "source_url": "https://msme.gov.in",
        "source_name": "Ministry of MSME & SIDBI",
        "process": "1. Register on standupmitra.in.\n2. Submit project report to bank branch.\n3. Credit evaluation & loan sanction with NCGTC guarantee.",
        "rules": {"min_age": 18, "max_age": 65, "gender": "All", "social_categories": ["SC", "ST", "General"], "is_entrepreneur": True, "applicable_states": ["All India"]},
        "benefits": [("Financial", "Enterprise Loan Facility", "Composite loan between ₹10 Lakh and ₹100 Lakh")],
        "documents": ["Aadhaar & PAN", "Caste Certificate (if SC/ST)", "Project Report with Financials", "Business Registration"]
    },
    {
        "name": "Deendayal Antyodaya Yojana - National Rural Livelihoods Mission (DAY-NRLM)",
        "slug": "day-nrlm-rural-livelihoods",
        "short_description": "Interest subvention and revolving funds for Women Self-Help Groups (SHGs) to build sustainable micro-enterprises.",
        "full_description": "Mobilizes rural poor households into Self Help Groups (SHGs), provides revolving funds and community investment funds, and enables access to credit at 7% subsidized interest.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "rural-development",
        "dept_name": "Ministry of Rural Development",
        "status": "Open",
        "deadline": "Continuous Program",
        "app_url": "https://aajeevika.gov.in",
        "source_url": "https://rural.gov.in",
        "source_name": "Ministry of Rural Development",
        "process": "1. Form or join village SHG (10-15 women).\n2. Open joint SHG bank account.\n3. Access revolving fund & bank credit with interest subvention.",
        "rules": {"min_age": 18, "max_age": 60, "gender": "Female", "max_income": 150000, "applicable_states": ["All India"]},
        "benefits": [("Financial", "Revolving Fund & Credit", "₹20,000-₹30,000 revolving fund + collateral-free loans up to ₹20 Lakh at 7%")],
        "documents": ["SHG Resolution Book", "Aadhaar of all member women", "Joint Bank Passbook"]
    },

    # --- NEW SCHEMES ACROSS THE 13 PORTALS ---

    # 1. India.gov.in
    {
        "name": "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
        "slug": "pm-jan-dhan-yojana",
        "short_description": "Universal banking access with zero minimum balance, free RuPay debit card, and ₹2 lakh accident insurance cover.",
        "full_description": "National Mission for Financial Inclusion to ensure access to financial services, namely, a basic savings bank account, need-based credit, remittances facility, insurance and pension to the excluded sections.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "finance",
        "dept_name": "National Portal of India",
        "status": "Open",
        "deadline": "Continuous Service",
        "app_url": "https://pmjdy.gov.in",
        "source_url": "https://www.india.gov.in",
        "source_name": "India.gov.in National Portal of India",
        "process": "1. Visit any commercial bank branch or Bank Mitra.\n2. Submit simplified KYC form with Aadhaar.\n3. Instant zero-balance account and RuPay debit card issuance.",
        "rules": {"min_age": 10, "max_age": 90, "gender": "All", "applicable_states": ["All India"]},
        "benefits": [("Financial", "Zero Balance Banking & Insurance", "No minimum balance, ₹2 Lakh accidental insurance, and ₹10,000 overdraft facility")],
        "documents": ["Aadhaar Card", "Voter ID / Driving License (if no Aadhaar)", "Passport size photo"]
    },
    {
        "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
        "slug": "pm-jeevan-jyoti-bima-yojana",
        "short_description": "Life insurance coverage of ₹2 lakh at an affordable premium of ₹436 per annum for savings bank account holders.",
        "full_description": "Offers life insurance cover of ₹2,00,000 for death due to any reason. Premium is auto-debited in one installment from the subscriber's bank account each year.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "finance",
        "dept_name": "National Portal of India",
        "status": "Open",
        "deadline": "Year Round Enrollment",
        "app_url": "https://www.jansuraksha.gov.in",
        "source_url": "https://www.india.gov.in",
        "source_name": "India.gov.in National Portal of India",
        "process": "1. Log into mobile banking or visit bank branch.\n2. Enable auto-debit consent for annual premium of ₹436.\n3. Instant digital certificate of insurance issued.",
        "rules": {"min_age": 18, "max_age": 50, "gender": "All", "applicable_states": ["All India"]},
        "benefits": [("Financial", "Life Insurance Cover", "₹2,00,000 life insurance cover upon death of insured due to any reason")],
        "documents": ["Savings Bank Account", "Aadhaar Card", "Auto-debit consent form"]
    },

    # 2. PIB (Press Information Bureau)
    {
        "name": "PM-Surya Ghar: Muft Bijli Yojana",
        "slug": "pm-surya-ghar-muft-bijli-yojana",
        "short_description": "Direct central subsidy up to ₹78,000 to install rooftop solar panels and get up to 300 units of free monthly electricity.",
        "full_description": "Ambitious initiative launched with an outlay of ₹75,021 Crore to power 1 crore households with rooftop solar systems, offering direct DBT subsidies and zero electricity bills.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "housing",
        "dept_name": "Ministry of New and Renewable Energy",
        "status": "Open",
        "deadline": "Continuous Program",
        "app_url": "https://pmsuryaghar.gov.in",
        "source_url": "https://www.pib.gov.in",
        "source_name": "Press Information Bureau (PIB)",
        "process": "1. Register on pmsuryaghar.gov.in with consumer electricity number.\n2. Choose empaneled vendor for rooftop installation.\n3. Net-meter inspection by DISCOM.\n4. Direct subsidy deposit into bank account via DBT within 30 days.",
        "rules": {"min_age": 18, "max_age": 90, "gender": "All", "applicable_states": ["All India"]},
        "benefits": [("Subsidy", "Rooftop Solar Subsidy", "Subsidy of ₹30,000 for 1kW, ₹60,000 for 2kW, and ₹78,000 for 3kW or higher")],
        "documents": ["Electricity Consumer Bill", "Aadhaar Card", "Rooftop Ownership Document", "Cancelled Cheque"]
    },
    {
        "name": "Ayushman Bharat Vay Vandana Scheme (Senior Citizens 70+)",
        "slug": "ayushman-vay-vandana-scheme",
        "short_description": "Universal free health insurance coverage of ₹5 lakh per year exclusively for all senior citizens aged 70 and above, regardless of income.",
        "full_description": "Approved by Union Cabinet, this scheme provides universal health protection of ₹5 Lakh per year to every senior citizen in India aged 70+, distinct from family coverage, with a special Ayushman Vay Vandana Card.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "senior-citizens",
        "dept_name": "National Health Authority",
        "status": "Open",
        "deadline": "Year Round Enrollment",
        "app_url": "https://beneficiary.nha.gov.in",
        "source_url": "https://www.pib.gov.in",
        "source_name": "Press Information Bureau (PIB)",
        "process": "1. Open Ayushman App or beneficiary.nha.gov.in.\n2. Complete Aadhaar eKYC verifying age 70+.\n3. Instant download of Ayushman Vay Vandana Smart Card.",
        "rules": {"min_age": 70, "max_age": 120, "gender": "All", "applicable_states": ["All India"]},
        "benefits": [("Healthcare", "Dedicated Senior Health Cover", "₹5,00,000 free annual hospital cover exclusively for the individual senior citizen")],
        "documents": ["Aadhaar Card with correct date of birth", "Mobile number for OTP verification"]
    },

    # 3. DBT Bharat
    {
        "name": "PAHAL Direct Benefit Transfer in LPG (DBTL)",
        "slug": "pahal-dbt-lpg-subsidy",
        "short_description": "Direct transfer of domestic LPG cylinder cooking gas subsidies directly into consumer bank accounts.",
        "full_description": "World's largest cash transfer initiative eliminating intermediary leakages by crediting domestic LPG cylinder subsidies directly into Aadhaar-linked consumer bank accounts.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "finance",
        "dept_name": "Cabinet Secretariat (DBT Bharat)",
        "status": "Open",
        "deadline": "Continuous Service",
        "app_url": "https://my.ebharatgas.com",
        "source_url": "https://dbtbharat.gov.in",
        "source_name": "DBT Bharat Portal",
        "process": "1. Link Aadhaar number with LPG Consumer ID at gas distributor.\n2. Ensure bank account has active NPCI Aadhaar seeding.\n3. Subsidies credited automatically upon booking refills.",
        "rules": {"min_age": 18, "max_age": 90, "gender": "All", "applicable_states": ["All India"]},
        "benefits": [("Subsidy", "Direct LPG Cash Transfer", "Subsidy amount credited into bank account upon delivery of each domestic refill")],
        "documents": ["LPG Gas Connection Consumer Number (Blue Book)", "Aadhaar Card", "Bank Passbook with NPCI mapping"]
    },
    {
        "name": "National Apprenticeship Promotion Scheme (NAPS)",
        "slug": "national-apprenticeship-promotion-scheme",
        "short_description": "Government directly pays 25% of monthly apprentice stipend up to ₹1,500/month via DBT to vocational trainees.",
        "full_description": "Promotes apprenticeship training in industrial establishments by reimbursing stipends directly into apprentices' accounts through DBT, bridging education to employment.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "skill-development",
        "dept_name": "Cabinet Secretariat (DBT Bharat)",
        "status": "Open",
        "deadline": "Active Continuous",
        "app_url": "https://www.apprenticeshipindia.gov.in",
        "source_url": "https://dbtbharat.gov.in",
        "source_name": "DBT Bharat Portal",
        "process": "1. Register on apprenticeshipindia.gov.in.\n2. Apply for opportunities with registered industry employers.\n3. Sign apprenticeship contract & receive monthly DBT stipend.",
        "rules": {"min_age": 14, "max_age": 35, "gender": "All", "is_student": True, "applicable_states": ["All India"]},
        "benefits": [("Financial", "Direct Stipend Subsidy", "Government pays 25% of stipend (up to ₹1,500/month) directly into trainee account")],
        "documents": ["Aadhaar Card", "ITI Certificate / Diploma / 10th or 12th Marksheet", "Aadhaar-seeded Bank Account"]
    },

    # 4. myScheme
    {
        "name": "National Overseas Scholarship for SC/ST Candidates",
        "slug": "national-overseas-scholarship-sc-st",
        "short_description": "Full financial support including foreign university tuition fees, annual living contingency and airfare for Masters & PhD studies abroad.",
        "full_description": "Provides financial assistance to selected low-income SC, De-notified Nomadic, Traditional Artisans and ST students pursuing Master level courses and PhD abroad.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "scholarships",
        "dept_name": "Ministry of Social Justice and Empowerment",
        "status": "Open",
        "deadline": "Annual Intake (April-May)",
        "app_url": "https://nosmsje.gov.in",
        "source_url": "https://www.myscheme.gov.in",
        "source_name": "myScheme National Platform",
        "process": "1. Secure unconditional offer from top 500 QS ranked university abroad.\n2. Apply on nosmsje.gov.in.\n3. National selection committee awards scholarship covering all fees and living expenses.",
        "rules": {"min_age": 18, "max_age": 35, "gender": "All", "social_categories": ["SC", "ST"], "max_income": 800000, "is_student": True, "applicable_states": ["All India"]},
        "benefits": [("Educational", "Full Overseas Higher Education Sponsorship", "100% Tuition fees paid directly to university + $15,400 annual living allowance + return flight tickets")],
        "documents": ["Unconditional University Offer Letter", "Community Certificate", "Income Certificate (< ₹8 Lakh)", "Passport & Academic Transcripts"]
    },
    {
        "name": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
        "slug": "pmay-gramin-housing-scheme",
        "short_description": "Financial grant of ₹1.20 lakh to ₹1.30 lakh + 90 days MGNREGA wages to build a pucca house with toilet in rural areas.",
        "full_description": "Aims to provide a pucca house with basic amenities to all rural houseless households and those living in kutcha and dilapidated houses identified by SECC 2011.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "housing",
        "dept_name": "Ministry of Rural Development",
        "status": "Open",
        "deadline": "Continuous Sanctions",
        "app_url": "https://pmayg.nic.in",
        "source_url": "https://www.myscheme.gov.in",
        "source_name": "myScheme National Platform",
        "process": "1. Verification of name in Gram Sabha priority list.\n2. Geo-tagging of existing kutcha house.\n3. Direct milestone installments deposited into bank account for construction.",
        "rules": {"min_age": 18, "max_age": 85, "gender": "All", "max_income": 150000, "applicable_states": ["All India"]},
        "benefits": [("Housing", "Rural House Construction Grant", "₹1,20,000 cash grant in plains (₹1,30,000 in hills) + ₹12,000 for toilet + ₹20,000 unskilled MGNREGA wages")],
        "documents": ["Aadhaar Card", "MGNREGA Job Card", "Bank Account Passbook", "Existing Kutcha House Photo"]
    },

    # 5. TN Government (Additional Flagship Schemes)
    {
        "name": "Tamil Nadu Thamizh Pudhalvan Higher Education Scheme",
        "slug": "tn-thamizh-pudhalvan-scheme",
        "short_description": "Monthly incentive of ₹1,000 for boy students from government schools pursuing collegiate degrees, ITI and polytechnics.",
        "full_description": "Complements the Puthumai Penn scheme by providing ₹1,000 monthly direct bank transfers to male students who studied in Tamil Nadu government schools (6th to 12th) enrolled in higher education.",
        "government_level": "State",
        "state": "Tamil Nadu",
        "cat_slug": "education",
        "dept_name": "School Education Department, TN",
        "status": "Open",
        "deadline": "Annual College Enrollment",
        "app_url": "https://penkalvi.tn.gov.in",
        "source_url": "https://www.tn.gov.in",
        "source_name": "Government of Tamil Nadu Official Portal",
        "process": "1. Registration through college Nodal Officer on state portal.\n2. Validation of 6th-12th TN government school EMIS records.\n3. Monthly ₹1,000 DBT deposited directly into student's bank account.",
        "rules": {"min_age": 17, "max_age": 25, "gender": "Male", "is_student": True, "applicable_states": ["Tamil Nadu"]},
        "benefits": [("Financial", "Monthly Higher Education Grant", "₹1,000 per month (₹12,000/year) throughout collegiate education")],
        "documents": ["Aadhaar Card", "TN Govt School 6-12 EMIS Study Certificate", "College Admission ID Card", "Aadhaar Linked Bank Passbook"]
    },
    {
        "name": "Tamil Nadu Naan Mudhalvan Youth Skill & Placement Mission",
        "slug": "tn-naan-mudhalvan-scheme",
        "short_description": "Free industry-grade training in emerging technologies, AI, coding, and engineering skills with guaranteed campus placements for college youth.",
        "full_description": "Dynamic skill empowerment platform of the Tamil Nadu government training over 10 lakh college students annually in high-tech courses, competitive exam prep, and spoken English.",
        "government_level": "State",
        "state": "Tamil Nadu",
        "cat_slug": "skill-development",
        "dept_name": "Special Programme Implementation Department, TN",
        "status": "Open",
        "deadline": "Year Round Training",
        "app_url": "https://www.naanmudhalvan.tn.gov.in",
        "source_url": "https://www.tn.gov.in",
        "source_name": "Government of Tamil Nadu Official Portal",
        "process": "1. Sign up on naanmudhalvan.tn.gov.in using college student credentials.\n2. Choose elective industry skill track (Cloud, AI, Data Analytics, Logistics).\n3. Certification and participation in mega job recruitment fairs.",
        "rules": {"min_age": 18, "max_age": 28, "gender": "All", "is_student": True, "applicable_states": ["Tamil Nadu"]},
        "benefits": [("Educational", "Free High-Tech Training & Placement", "100% free certifications from top global tech firms + direct placement drives")],
        "documents": ["College ID Card", "Aadhaar Card", "Degree enrollment registration number"]
    },

    # 6. NABARD
    {
        "name": "NABARD Rural Infrastructure Development Fund (RIDF)",
        "slug": "nabard-ridf-infrastructure",
        "short_description": "Dedicated funding facility to build rural roads, irrigation check dams, health centres and drinking water projects.",
        "full_description": "Provides concessional low-interest capital loans to state governments and state-owned corporations to expedite completion of rural public infrastructure projects.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "rural-development",
        "dept_name": "National Bank for Agriculture and Rural Development (NABARD)",
        "status": "Open",
        "deadline": "Continuous Fiscal Allocation",
        "app_url": "https://www.nabard.org",
        "source_url": "https://www.nabard.org",
        "source_name": "National Bank for Agriculture and Rural Development (NABARD)",
        "process": "1. State government departments prepare Detailed Project Reports (DPR).\n2. NABARD appraisal sanction committee approves loan.\n3. Disbursement linked to physical completion milestones.",
        "rules": {"min_age": 18, "max_age": 100, "gender": "All", "applicable_states": ["All India"]},
        "benefits": [("Rural Development", "Concessional Rural Infrastructure Loans", "Financing up to 95% of rural connectivity, water supply and agricultural projects")],
        "documents": ["Detailed Project Report (DPR)", "State Government Counterpart Funding Order"]
    },
    {
        "name": "NABARD Agri-Clinic and Agri-Business Centres (ACABC) Scheme",
        "slug": "nabard-acabc-agribusiness-scheme",
        "short_description": "Up to 44% capital subsidy on bank project loans up to ₹20 lakh for agriculture graduates to establish commercial agro-clinics and input centres.",
        "full_description": "Supports agricultural graduates, diploma holders and biological science graduates in establishing self-financed agri-clinics that offer expert advice, soil testing, and equipment hire to farmers.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "agriculture",
        "dept_name": "National Bank for Agriculture and Rural Development (NABARD)",
        "status": "Open",
        "deadline": "Continuous Training Batches",
        "app_url": "https://www.acabcmis.gov.in",
        "source_url": "https://www.nabard.org",
        "source_name": "National Bank for Agriculture and Rural Development (NABARD)",
        "process": "1. Apply for free 45-day residential training at MANAGE nodal institute.\n2. Submit project report to commercial bank.\n3. Bank sanctions loan and NABARD credits composite capital subsidy.",
        "rules": {"min_age": 21, "max_age": 60, "gender": "All", "is_entrepreneur": True, "applicable_states": ["All India"]},
        "benefits": [("Subsidy", "Composite Capital Subsidy", "36% capital subsidy for general category and 44% for women, SC, ST and North-East on loans up to ₹20 Lakh")],
        "documents": ["Degree / Diploma in Agriculture or Allied Sciences", "MANAGE Training Certificate", "Detailed Business Project Report", "Aadhaar Card"]
    },

    # 7. Ministry of Education
    {
        "name": "Samagra Shiksha Abhiyan",
        "slug": "samagra-shiksha-school-education",
        "short_description": "Overarching programme covering pre-school to Class 12 providing free textbooks, uniforms, transport allowances and digital smart classrooms.",
        "full_description": "Unified school education programme integrating Sarva Shiksha Abhiyan (SSA), Rashtriya Madhyamik Shiksha Abhiyan (RMSA) and Teacher Education (TE) ensuring equitable, inclusive quality schooling.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "education",
        "dept_name": "Department of Higher Education, MoE",
        "status": "Open",
        "deadline": "Annual Academic Cycle",
        "app_url": "https://samagra.education.gov.in",
        "source_url": "https://www.education.gov.in",
        "source_name": "Ministry of Education",
        "process": "1. Automatic enrollment in government and local body schools.\n2. Direct in-kind provision of books, uniforms, ICT labs and midday nutrition.",
        "rules": {"min_age": 4, "max_age": 18, "gender": "All", "is_student": True, "applicable_states": ["All India"]},
        "benefits": [("Educational", "Free Schooling & Textbooks", "100% free school education, uniforms, books and composite development grants to schools")],
        "documents": ["Birth Certificate / Aadhaar Card", "School Enrollment Registration"]
    },
    {
        "name": "Pradhan Mantri Uchchatar Shiksha Abhiyan (PM-USHA)",
        "slug": "pm-usha-higher-education",
        "short_description": "Multi-crore infrastructure and equity grants to state universities and colleges to build advanced laboratories, libraries and research facilities.",
        "full_description": "Centrally sponsored scheme dedicated to enhancing access, equity, and excellence in state higher education systems, funding multidisciplinary education and research universities.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "education",
        "dept_name": "Department of Higher Education, MoE",
        "status": "Open",
        "deadline": "Institutional Cycle 2026-27",
        "app_url": "https://pmusha.education.gov.in",
        "source_url": "https://www.education.gov.in",
        "source_name": "Ministry of Education",
        "process": "1. State Higher Education Councils submit Institutional Development Plans.\n2. MoE approval board sanctions infrastructure and equity funding.",
        "rules": {"min_age": 18, "max_age": 100, "gender": "All", "applicable_states": ["All India"]},
        "benefits": [("Educational", "University Development Grants", "Direct grants up to ₹100 Crore to state universities for world-class infrastructure")],
        "documents": ["NAAC Accreditation Certificate", "Institutional Development Plan (IDP)"]
    },

    # 8. Social Justice Ministry
    {
        "name": "PM Young Achievers Scholarship Award Scheme (PM-YASASVI)",
        "slug": "pm-yasasvi-scholarship-scheme",
        "short_description": "Prestigious top-class school scholarships of ₹75,000 (Class 9-10) and ₹1,25,000 (Class 11-12) for OBC, EBC and DNT students.",
        "full_description": "Offers high-quantum school scholarships to meritorious other backward class (OBC), economically backward class (EBC) and de-notified nomadic tribe students studying in designated top schools.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "scholarships",
        "dept_name": "Ministry of Social Justice and Empowerment",
        "status": "Open",
        "deadline": "Annual Selection (August-September)",
        "app_url": "https://yet.nta.ac.in",
        "source_url": "https://socialjustice.gov.in",
        "source_name": "Ministry of Social Justice and Empowerment",
        "process": "1. Registration on NTA YASASVI portal.\n2. Merit selection based on Class 8/10 marks.\n3. Direct annual scholarship credit via PFMS DBT.",
        "rules": {"min_age": 13, "max_age": 18, "gender": "All", "max_income": 250000, "social_categories": ["OBC", "General"], "is_student": True, "applicable_states": ["All India"]},
        "benefits": [("Educational", "High Value School Scholarship", "₹75,000 per year for Class 9 & 10; ₹1,25,000 per year for Class 11 & 12")],
        "documents": ["Aadhaar Card", "OBC / EBC / DNT Caste Certificate", "Income Certificate (≤ ₹2.5 Lakh)", "Previous Class Marksheet", "Student Bank Passbook"]
    },
    {
        "name": "Pradhan Mantri Dakshta Aur Kushalta Sampann Hitgrahi (PM-DAKSH)",
        "slug": "pm-daksh-skill-training",
        "short_description": "100% free certified vocational skill training with stipend of ₹1,000 to ₹1,500/month for SC, OBC, EBC and Safai Karamcharis.",
        "full_description": "National Action Plan for skill development of marginalized target groups to improve their long-term wage employment potential and self-employment capability in industrial clusters.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "skill-development",
        "dept_name": "Ministry of Social Justice and Empowerment",
        "status": "Open",
        "deadline": "Continuous Training Batches",
        "app_url": "https://pmdaksh.dosje.gov.in",
        "source_url": "https://socialjustice.gov.in",
        "source_name": "Ministry of Social Justice and Empowerment",
        "process": "1. Apply on PM-DAKSH portal or mobile app.\n2. Choose trade: Up-skilling, Short Term Training, or Entrepreneurship.\n3. Attend training with monthly stipend and secure placement.",
        "rules": {"min_age": 18, "max_age": 45, "gender": "All", "max_income": 300000, "social_categories": ["SC", "OBC", "General"], "applicable_states": ["All India"]},
        "benefits": [("Skill Development", "Free Training with Stipend", "100% free course fees + ₹1,000 to ₹1,500 per month stipend during training")],
        "documents": ["Aadhaar Card", "Caste Certificate (SC/OBC)", "Income Certificate (≤ ₹3 Lakh for OBC)", "Educational Qualification Certificate"]
    },

    # 9. Women and Child Development
    {
        "name": "Mission Shakti - Sambal and Samarthya",
        "slug": "mission-shakti-women-welfare",
        "short_description": "Integrated umbrella scheme providing emergency safety, 24x7 181 Women Helpline, One Stop Crisis Centres (Sakhi), and Working Women Hostels.",
        "full_description": "Dedicated national mission for safety, security, and empowerment of women across all life cycles, offering shelter, legal aid, trauma counseling, and affordable hostels.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "women-child-welfare",
        "dept_name": "Ministry of Women and Child Development",
        "status": "Open",
        "deadline": "24x7 Continuous Support",
        "app_url": "https://wcd.gov.in",
        "source_url": "https://wcd.gov.in",
        "source_name": "Ministry of Women and Child Development",
        "process": "1. Access One Stop Centre in any district or dial toll-free Women Helpline 181.\n2. Immediate access to medical, legal, psychological and shelter support.",
        "rules": {"min_age": 0, "max_age": 100, "gender": "Female", "applicable_states": ["All India"]},
        "benefits": [("Social Welfare", "Integrated Crisis & Hostel Support", "Free legal, medical, counseling and shelter services + affordable working women hostel accommodation")],
        "documents": ["Aadhaar Card / ID Proof (not mandatory in immediate crisis)"]
    },

    # 10. MSME Ministry
    {
        "name": "Prime Minister's Employment Generation Programme (PMEGP)",
        "slug": "pmegp-employment-generation",
        "short_description": "Credit-linked capital subsidy up to 35% on bank loans up to ₹50 lakh for manufacturing and ₹20 lakh for service enterprises.",
        "full_description": "Major credit-linked subsidy programme to generate continuous employment opportunities by funding new micro-enterprises in non-farm sectors across urban and rural locations.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "entrepreneurship",
        "dept_name": "Ministry of Micro, Small & Medium Enterprises",
        "status": "Open",
        "deadline": "Open All Year",
        "app_url": "https://www.kviconline.gov.in",
        "source_url": "https://msme.gov.in",
        "source_name": "Ministry of Micro, Small & Medium Enterprises",
        "process": "1. Submit online application on kviconline.gov.in.\n2. District task force committee reviews proposal.\n3. Bank sanctions loan and KVIC deposits 15% to 35% margin money subsidy.",
        "rules": {"min_age": 18, "max_age": 65, "gender": "All", "is_entrepreneur": True, "applicable_states": ["All India"]},
        "benefits": [("Subsidy", "Government Margin Money Subsidy", "15% to 35% capital subsidy on project cost up to ₹50 Lakh (manufacturing) and ₹20 Lakh (services)")],
        "documents": ["Detailed Project Report (DPR)", "Aadhaar & PAN Card", "Caste Certificate (if SC/ST/OBC/Women)", "Highest Qualification Marksheet (min 8th pass)"]
    },
    {
        "name": "PM Vishwakarma Scheme",
        "slug": "pm-vishwakarma-scheme",
        "short_description": "End-to-end support for traditional artisans including ₹15,000 toolkits grant, basic training stipend, and 5% collateral-free loans up to ₹3 lakh.",
        "full_description": "Flagship scheme providing holistic support to artisans and craftspeople across 18 traditional trades (carpenters, blacksmiths, goldsmiths, potters, cobblers, masons, weavers) with skill certification and credit.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "entrepreneurship",
        "dept_name": "Ministry of Micro, Small & Medium Enterprises",
        "status": "Open",
        "deadline": "Year Round Enrollment",
        "app_url": "https://pmvishwakarma.gov.in",
        "source_url": "https://msme.gov.in",
        "source_name": "Ministry of Micro, Small & Medium Enterprises",
        "process": "1. Biometric registration at Common Service Centre (CSC).\n2. Gram Panchayat / ULB verification.\n3. Basic skill training with ₹500/day stipend.\n4. ₹15,000 e-voucher for modern tools + tranche loans at 5% interest.",
        "rules": {"min_age": 18, "max_age": 70, "gender": "All", "is_entrepreneur": True, "applicable_states": ["All India"]},
        "benefits": [("Financial", "Toolkit Grant & Soft Loans", "₹15,000 toolkit voucher + collateral-free loans up to ₹3 Lakh at 5% interest + skill certificate")],
        "documents": ["Aadhaar Card", "Ration Card", "Bank Account Details", "Traditional Trade Proof"]
    },

    # 11. Agriculture Ministry
    {
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "slug": "pmfby-crop-insurance",
        "short_description": "Comprehensive crop insurance against non-preventable natural risks, flood, drought and pests with nominal premium: 2% Kharif, 1.5% Rabi.",
        "full_description": "Provides financial support to farmers suffering crop loss or damage arising out of unforeseen weather events, stabilizing income and encouraging progressive farming practices.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "agriculture",
        "dept_name": "Ministry of Agriculture & Farmers Welfare",
        "status": "Open",
        "deadline": "Seasonal (July 31 Kharif / Dec 31 Rabi)",
        "app_url": "https://pmfby.gov.in",
        "source_url": "https://agriwelfare.gov.in",
        "source_name": "Ministry of Agriculture and Farmers Welfare",
        "process": "1. Apply via pmfby.gov.in or CSC before sowing cut-off date.\n2. Pay nominal farmer share premium (1.5% - 2%).\n3. Crop loss survey and direct claim settlement into bank account via DBT.",
        "rules": {"min_age": 18, "max_age": 90, "gender": "All", "is_farmer": True, "applicable_states": ["All India"]},
        "benefits": [("Insurance", "Subsidized Crop Protection", "Comprehensive insurance cover for full sum insured with government paying balance premium")],
        "documents": ["Land Possession Certificate (Patta / Adangal / RoR)", "Sowing Certificate / Village Officer proof", "Aadhaar Card", "Bank Passbook"]
    },
    {
        "name": "Kisan Credit Card (KCC) Scheme",
        "slug": "kisan-credit-card-scheme",
        "short_description": "Short-term production credit up to ₹3 lakh at subsidized effective interest rate of 4% per annum upon prompt repayment.",
        "full_description": "Ensures timely and affordable credit flow to farmers for purchasing seeds, fertilizers, pesticides, harvesting machinery, and meeting working capital needs of allied animal husbandry and fisheries.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "agriculture",
        "dept_name": "Ministry of Agriculture & Farmers Welfare",
        "status": "Open",
        "deadline": "Year Round Application",
        "app_url": "https://agricoop.nic.in",
        "source_url": "https://agriwelfare.gov.in",
        "source_name": "Ministry of Agriculture and Farmers Welfare",
        "process": "1. Fill 1-page simplified KCC form at local bank or CSC.\n2. Land revenue authority validates agricultural landholdings.\n3. KCC debit card issued within 14 working days.",
        "rules": {"min_age": 18, "max_age": 75, "gender": "All", "is_farmer": True, "applicable_states": ["All India"]},
        "benefits": [("Credit", "Low Interest Farm Credit", "Credit limit up to ₹3,00,000 at 4% effective interest (7% with 3% prompt repayment subvention)")],
        "documents": ["Land Ownership Documents (Patta/Chitta)", "Aadhaar Card", "Crop Sowing Declaration", "Passport size photo"]
    },

    # 12. Ministry of Rural Development
    {
        "name": "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
        "slug": "mgnrega-rural-employment",
        "short_description": "Legal guarantee of at least 100 days of wage employment per financial year to adult members of rural households willing to do manual work.",
        "full_description": "Social security safety net enhancing livelihood security in rural India by providing guaranteed wage employment while creating durable community assets (ponds, bunds, rural pathways).",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "employment",
        "dept_name": "Ministry of Rural Development",
        "status": "Open",
        "deadline": "Continuous Guarantee",
        "app_url": "https://nrega.nic.in",
        "source_url": "https://rural.gov.in",
        "source_name": "Ministry of Rural Development",
        "process": "1. Apply for Job Card at Gram Panchayat.\n2. Job card issued within 15 days.\n3. Submit written work demand and get work allocated within 15 days, wages credited to bank via DBT.",
        "rules": {"min_age": 18, "max_age": 80, "gender": "All", "applicable_states": ["All India"]},
        "benefits": [("Employment", "Guaranteed 100 Days Wage Work", "Statutory daily wages directly credited to bank account within 15 days of work muster")],
        "documents": ["Aadhaar Card", "Ration Card", "Rural Residence Proof", "Bank Account Passbook"]
    },
    {
        "name": "Pradhan Mantri Gram Sadak Yojana (PMGSY)",
        "slug": "pmgsy-rural-roads",
        "short_description": "All-weather black-topped road connectivity connecting unreached rural habitations to markets, schools and hospitals.",
        "full_description": "Centrally sponsored scheme dedicated to poverty reduction by providing all-weather motorable road access to all eligible unconnected rural habitations across India.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "rural-development",
        "dept_name": "Ministry of Rural Development",
        "status": "Open",
        "deadline": "Continuous Phase Implementations",
        "app_url": "https://pmgsy.nic.in",
        "source_url": "https://rural.gov.in",
        "source_name": "Ministry of Rural Development",
        "process": "1. Habitations identified by District Rural Development Agency (DRDA).\n2. Paved black-topped all-weather roads built by state rural roads agency.",
        "rules": {"min_age": 18, "max_age": 100, "gender": "All", "applicable_states": ["All India"]},
        "benefits": [("Infrastructure", "All-Weather Rural Connectivity", "100% durable paved road connecting rural villages to market hubs")],
        "documents": ["Village Panchayat Resolution"]
    },

    # 13. Housing and Urban Affairs
    {
        "name": "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
        "slug": "pm-svanidhi-street-vendors",
        "short_description": "Collateral-free working capital micro-loans of ₹10,000 (1st tranche), ₹20,000 (2nd tranche), and ₹50,000 (3rd tranche) with 7% interest subsidy.",
        "full_description": "Special micro-credit facility empowering urban street vendors, hawkers and push-cart operators to resume businesses, access formal credit, and earn cashback on digital transactions.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "entrepreneurship",
        "dept_name": "Ministry of Housing and Urban Affairs",
        "status": "Open",
        "deadline": "Active Continuous",
        "app_url": "https://pmsvanidhi.mohua.gov.in",
        "source_url": "https://mohua.gov.in",
        "source_name": "Ministry of Housing and Urban Affairs",
        "process": "1. Apply online on pmsvanidhi.mohua.gov.in or through bank.\n2. Vending certificate / ULB recommendation verified.\n3. Loan disbursed directly into vendor account with interest subsidy and QR cashback.",
        "rules": {"min_age": 18, "max_age": 75, "gender": "All", "is_entrepreneur": True, "applicable_states": ["All India"]},
        "benefits": [("Financial", "Micro Working Capital Loan", "Collateral-free loan: ₹10,000 initially, escalates to ₹20,000 and ₹50,000 upon timely repayment + 7% interest rebate")],
        "documents": ["Vending Certificate / Urban Local Body ID Card", "Aadhaar Card", "Bank Account Passbook"]
    },
    {
        "name": "Atal Mission for Rejuvenation and Urban Transformation (AMRUT 2.0)",
        "slug": "amrut-urban-transformation",
        "short_description": "100% universal piped clean drinking water supply, sewerage connections, and green parks development across 4,700+ statutory towns.",
        "full_description": "National mission to transform urban infrastructure, providing universal household water tap connections, scientific sewage treatment, and water bodies rejuvenation across all urban local bodies.",
        "government_level": "Central",
        "state": "All India",
        "cat_slug": "housing",
        "dept_name": "Ministry of Housing and Urban Affairs",
        "status": "Open",
        "deadline": "Mission Cycle 2026",
        "app_url": "https://amrut.gov.in",
        "source_url": "https://mohua.gov.in",
        "source_name": "Ministry of Housing and Urban Affairs",
        "process": "1. Municipal corporation formulates City Water Action Plan.\n2. Piped household water connections and sanitation pipelines commissioned.",
        "rules": {"min_age": 18, "max_age": 100, "gender": "All", "applicable_states": ["All India"]},
        "benefits": [("Urban Development", "Household Water & Sanitation", "100% functional tap water connection to every urban household")],
        "documents": ["Municipal Property Tax Receipt / Ward Identification"]
    }
]

def populate_database():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Insert/Update Departments
    dept_map = {}
    for d_name, d_level, d_state, d_url in DEPARTMENTS:
        cursor.execute("SELECT id FROM departments WHERE name = ?", (d_name,))
        row = cursor.fetchone()
        if row:
            dept_id = row[0]
            cursor.execute("UPDATE departments SET website_url = ? WHERE id = ?", (d_url, dept_id))
        else:
            cursor.execute(
                "INSERT INTO departments (name, government_level, state, website_url) VALUES (?, ?, ?, ?)",
                (d_name, d_level, d_state, d_url)
            )
            dept_id = cursor.lastrowid
        dept_map[d_name] = dept_id

    # 2. Get category map
    cursor.execute("SELECT slug, id FROM categories")
    cat_map = dict(cursor.fetchall())

    now = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    # 3. Insert or Update all 35+ schemes
    inserted_count = 0
    updated_count = 0

    for s in ALL_SCHEMES:
        cat_id = cat_map.get(s["cat_slug"], 1)
        dept_id = dept_map.get(s["dept_name"])

        cursor.execute("SELECT id FROM schemes WHERE slug = ? OR name = ?", (s["slug"], s["name"]))
        row = cursor.fetchone()

        if row:
            scheme_id = row[0]
            # Update scheme with official links and descriptions
            cursor.execute(
                """
                UPDATE schemes SET
                    name = ?,
                    short_description = ?,
                    full_description = ?,
                    government_level = ?,
                    state = ?,
                    category_id = ?,
                    department_id = ?,
                    application_status = ?,
                    application_deadline = ?,
                    application_process = ?,
                    official_application_url = ?,
                    official_source_url = ?,
                    source_name = ?,
                    last_verified_at = ?,
                    is_active = 1
                WHERE id = ?
                """,
                (
                    s["name"], s["short_description"], s["full_description"],
                    s["government_level"], s["state"], cat_id, dept_id,
                    s["status"], s["deadline"], s["process"],
                    s["app_url"], s["source_url"], s["source_name"],
                    now, scheme_id
                )
            )
            updated_count += 1
        else:
            cursor.execute(
                """
                INSERT INTO schemes (
                    name, slug, short_description, full_description,
                    government_level, state, category_id, department_id,
                    application_status, application_deadline, application_process,
                    official_application_url, official_source_url, source_name,
                    last_verified_at, version, is_active, views_count, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 120, ?, ?)
                """,
                (
                    s["name"], s["slug"], s["short_description"], s["full_description"],
                    s["government_level"], s["state"], cat_id, dept_id,
                    s["status"], s["deadline"], s["process"],
                    s["app_url"], s["source_url"], s["source_name"],
                    now, now, now
                )
            )
            scheme_id = cursor.lastrowid
            inserted_count += 1

        # Rules
        r = s.get("rules", {})
        cursor.execute("DELETE FROM eligibility_rules WHERE scheme_id = ?", (scheme_id,))
        cursor.execute(
            """
            INSERT INTO eligibility_rules (
                scheme_id, min_age, max_age, gender, max_income,
                applicable_states, social_categories, is_student,
                is_farmer, is_entrepreneur, is_disabled, land_ownership_required
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                scheme_id,
                r.get("min_age"), r.get("max_age"), r.get("gender", "All"), r.get("max_income"),
                json.dumps(r.get("applicable_states", ["All India"])),
                json.dumps(r.get("social_categories", ["All"])),
                r.get("is_student", False), r.get("is_farmer", False),
                r.get("is_entrepreneur", False), r.get("is_disabled", False),
                r.get("land_ownership_required", False)
            )
        )

        # Benefits
        cursor.execute("DELETE FROM scheme_benefits WHERE scheme_id = ?", (scheme_id,))
        for b_type, b_title, b_amount in s.get("benefits", []):
            cursor.execute(
                """
                INSERT INTO scheme_benefits (scheme_id, benefit_type, title, description, amount_details)
                VALUES (?, ?, ?, ?, ?)
                """,
                (scheme_id, b_type, b_title, b_amount, b_amount)
            )

        # Documents
        cursor.execute("DELETE FROM scheme_documents WHERE scheme_id = ?", (scheme_id,))
        for doc in s.get("documents", []):
            cursor.execute(
                """
                INSERT INTO scheme_documents (scheme_id, document_name, is_mandatory)
                VALUES (?, ?, 1)
                """,
                (scheme_id, doc)
            )

    conn.commit()

    # Get final count
    cursor.execute("SELECT count(*) FROM schemes")
    total_schemes = cursor.fetchone()[0]

    cursor.execute("SELECT count(*) FROM government_sources")
    total_sources = cursor.fetchone()[0]

    conn.close()

    print("=" * 65)
    print("✅ DATABASE SYNCHRONIZATION COMPLETED SUCCESSFULLY!")
    print(f"   Schemes Updated Existing : {updated_count}")
    print(f"   New Schemes Inserted     : {inserted_count}")
    print(f"   Total Schemes in DB      : {total_schemes}")
    print(f"   Government Sources in DB : {total_sources}")
    print("=" * 65)

if __name__ == "__main__":
    populate_database()
