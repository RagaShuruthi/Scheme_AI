import datetime
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models.models import (
    User, Category, Department, GovernmentSource, Scheme,
    EligibilityRule, SchemeBenefit, SchemeDocument, SchemeUpdate,
    UserPreference, ScrapeLog
)
from app.auth.jwt import get_password_hash

def seed_database(db: Session):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # 1. Seed Users (Admin & Citizen)
    admin_user = db.query(User).filter(User.email == "admin@schemesaarthi.gov.in").first()
    if not admin_user:
        admin_user = User(
            email="admin@schemesaarthi.gov.in",
            hashed_password=get_password_hash("Admin@123456"),
            full_name="National Portal Administrator",
            role="admin",
            is_active=True
        )
        db.add(admin_user)

    citizen_user = db.query(User).filter(User.email == "citizen@schemesaarthi.gov.in").first()
    if not citizen_user:
        citizen_user = User(
            email="citizen@schemesaarthi.gov.in",
            hashed_password=get_password_hash("Citizen@123456"),
            full_name="Karthik Subramanian",
            role="user",
            is_active=True
        )
        db.add(citizen_user)
        db.commit()
        db.refresh(citizen_user)

        pref = UserPreference(
            user_id=citizen_user.id,
            preferred_categories=[1, 2, 5],
            preferred_states=["Tamil Nadu"],
            notify_updates=True
        )
        db.add(pref)

    db.commit()

    # 2. Seed Categories (14 Categories)
    categories_data = [
        {"name": "Education", "slug": "education", "icon": "GraduationCap", "desc": "Educational loans, school welfare, and academic grants."},
        {"name": "Scholarships", "slug": "scholarships", "icon": "Award", "desc": "Pre-matric, post-matric, merit, and reserved category scholarships."},
        {"name": "Employment", "slug": "employment", "icon": "Briefcase", "desc": "Job training, unemployment assistance, and placement support."},
        {"name": "Healthcare", "slug": "healthcare", "icon": "HeartPulse", "desc": "Medical insurance, treatment coverage, and health cards."},
        {"name": "Agriculture", "slug": "agriculture", "icon": "Wheat", "desc": "Income support, farm machinery subsidies, and crop insurance."},
        {"name": "Women & Child Welfare", "slug": "women-child-welfare", "icon": "Users", "desc": "Maternity benefits, girl child education, and women empowerment schemes."},
        {"name": "Senior Citizens", "slug": "senior-citizens", "icon": "UserCheck", "desc": "Old age pension, elder healthcare, and travel concessions."},
        {"name": "Housing", "slug": "housing", "icon": "Home", "desc": "Subsidies for pucca houses, urban housing, and rural reconstruction."},
        {"name": "Finance", "slug": "finance", "icon": "Coins", "desc": "Direct cash transfers, micro-credit, and interest subsidies."},
        {"name": "Entrepreneurship", "slug": "entrepreneurship", "icon": "Rocket", "desc": "Startup capital, MSME credit guarantee, and seed funding."},
        {"name": "Disability", "slug": "disability", "icon": "Accessibility", "desc": "Aids, assistive appliances, monthly maintenance allowance, and UDID."},
        {"name": "Rural Development", "slug": "rural-development", "icon": "TreePine", "desc": "Livelihood missions, rural roads, and village infrastructure."},
        {"name": "Skill Development", "slug": "skill-development", "icon": "Hammer", "desc": "Vocational certifications, apprenticeship stipends, and ITI training."},
        {"name": "Social Welfare", "slug": "social-welfare", "icon": "ShieldCheck", "desc": "Special assistance for vulnerable, marginal, and backward classes."}
    ]

    cat_map = {}
    for c in categories_data:
        existing = db.query(Category).filter(Category.slug == c["slug"]).first()
        if not existing:
            existing = Category(name=c["name"], slug=c["slug"], icon=c["icon"], description=c["desc"])
            db.add(existing)
            db.commit()
            db.refresh(existing)
        cat_map[c["slug"]] = existing.id

    # 3. Seed Departments
    departments_data = [
        {"name": "Ministry of Agriculture & Farmers Welfare", "level": "Central", "state": None, "url": "https://agricoop.nic.in"},
        {"name": "National Health Authority", "level": "Central", "state": None, "url": "https://nha.gov.in"},
        {"name": "Department of Higher Education, MoE", "level": "Central", "state": None, "url": "https://education.gov.in"},
        {"name": "Ministry of Housing and Urban Affairs", "level": "Central", "state": None, "url": "https://mohua.gov.in"},
        {"name": "Ministry of Micro, Small & Medium Enterprises", "level": "Central", "state": None, "url": "https://msme.gov.in"},
        {"name": "Adi Dravidar and Tribal Welfare Department, TN", "level": "State", "state": "Tamil Nadu", "url": "https://adtw.tn.gov.in"},
        {"name": "Social Welfare and Women Empowerment Department, TN", "level": "State", "state": "Tamil Nadu", "url": "https://swd.tn.gov.in"},
        {"name": "Health and Family Welfare Department, TN", "level": "State", "state": "Tamil Nadu", "url": "https://tnhealth.tn.gov.in"},
        {"name": "Department of Differently Abled Welfare, TN", "level": "State", "state": "Tamil Nadu", "url": "https://scd.tn.gov.in"},
        {"name": "Special Programme Implementation Department, TN", "level": "State", "state": "Tamil Nadu", "url": "https://kmut.tn.gov.in"}
    ]

    dept_map = {}
    for d in departments_data:
        existing = db.query(Department).filter(Department.name == d["name"]).first()
        if not existing:
            existing = Department(name=d["name"], government_level=d["level"], state=d["state"], website_url=d["url"])
            db.add(existing)
            db.commit()
            db.refresh(existing)
        dept_map[d["name"]] = existing.id

    # 4. Seed Government Sources (13 Core Portals)
    sources_data = [
        {"name": "India.gov.in National Portal of India", "level": "Central", "state": "All India", "dept": "NIC", "url": "https://www.india.gov.in", "type": "portal"},
        {"name": "Press Information Bureau (PIB)", "level": "Central", "state": "All India", "dept": "Ministry of Information & Broadcasting", "url": "https://www.pib.gov.in", "type": "announcements_portal"},
        {"name": "DBT Bharat Portal", "level": "Central", "state": "All India", "dept": "Cabinet Secretariat", "url": "https://dbtbharat.gov.in", "type": "dbt_portal"},
        {"name": "myScheme National Portal", "level": "Central", "state": "All India", "dept": "MeitY", "url": "https://www.myscheme.gov.in", "type": "scheme_catalogue"},
        {"name": "Tamil Nadu Government Official Web Portal", "level": "State", "state": "Tamil Nadu", "dept": "Government of Tamil Nadu", "url": "https://www.tn.gov.in", "type": "portal"},
        {"name": "National Bank for Agriculture and Rural Development (NABARD)", "level": "Central", "state": "All India", "dept": "Ministry of Finance", "url": "https://www.nabard.org", "type": "statutory_body"},
        {"name": "Ministry of Education", "level": "Central", "state": "All India", "dept": "Ministry of Education", "url": "https://www.education.gov.in", "type": "ministry"},
        {"name": "Ministry of Social Justice and Empowerment", "level": "Central", "state": "All India", "dept": "Ministry of Social Justice", "url": "https://socialjustice.gov.in", "type": "ministry"},
        {"name": "Ministry of Women and Child Development", "level": "Central", "state": "All India", "dept": "Ministry of WCD", "url": "https://wcd.gov.in", "type": "ministry"},
        {"name": "Ministry of Micro, Small & Medium Enterprises", "level": "Central", "state": "All India", "dept": "Ministry of MSME", "url": "https://msme.gov.in", "type": "ministry"},
        {"name": "Ministry of Agriculture and Farmers Welfare", "level": "Central", "state": "All India", "dept": "Ministry of Agriculture", "url": "https://agriwelfare.gov.in", "type": "ministry"},
        {"name": "Ministry of Rural Development", "level": "Central", "state": "All India", "dept": "Ministry of Rural Development", "url": "https://rural.gov.in", "type": "ministry"},
        {"name": "Ministry of Housing and Urban Affairs", "level": "Central", "state": "All India", "dept": "MoHUA", "url": "https://mohua.gov.in", "type": "ministry"},
        {"name": "National Scholarship Portal (NSP)", "level": "Central", "state": "All India", "dept": "Ministry of Electronics and IT", "url": "https://scholarships.gov.in", "type": "portal"},
        {"name": "PM-KISAN Official Portal", "level": "Central", "state": "All India", "dept": "Ministry of Agriculture", "url": "https://pmkisan.gov.in", "type": "department_site"},
        {"name": "Ayushman Bharat PM-JAY Portal", "level": "Central", "state": "All India", "dept": "National Health Authority", "url": "https://pmjay.gov.in", "type": "department_site"},
        {"name": "Tamil Nadu CMCHIS Official Portal", "level": "State", "state": "Tamil Nadu", "dept": "Health and Family Welfare Department", "url": "https://cmchistn.com", "type": "department_site"}
    ]

    for src in sources_data:
        existing = db.query(GovernmentSource).filter(GovernmentSource.url == src["url"]).first()
        if not existing:
            existing = GovernmentSource(
                name=src["name"],
                government_level=src["level"],
                state=src["state"],
                department=src["dept"],
                url=src["url"],
                source_type=src["type"],
                scraping_frequency_hours=24,
                last_checked_at=datetime.datetime.utcnow(),
                last_status="Active (Healthy)"
            )
            db.add(existing)
    db.commit()

    # Synchronize all multi-portal schemes across 13 target portals
    try:
        import sys
        import os
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if root_dir not in sys.path:
            sys.path.insert(0, root_dir)
        import populate_all_schemes
        populate_all_schemes.populate_database()
    except Exception as e:
        print(f"Notice: Multi-portal catalog auto-sync: {e}")

    # 5. Seed Real Schemes (Legacy baseline check)
    if db.query(Scheme).count() > 0:
        return

    schemes_data = [
        {
            "name": "Tamil Nadu Post Matric Scholarship Scheme",
            "slug": "tamil-nadu-post-matric-scholarship",
            "short_description": "Financial assistance to SC, ST, SCC, and converted Christian students pursuing post-matriculation courses in Tamil Nadu.",
            "full_description": "The Post Matric Scholarship Scheme implemented by the Adi Dravidar and Tribal Welfare Department provides 100% compulsory non-refundable fee reimbursement and monthly maintenance allowance to eligible students enrolled in recognized higher education courses including Arts, Science, Engineering, Medicine, and Polytechnics.",
            "government_level": "State",
            "state": "Tamil Nadu",
            "cat": "scholarships",
            "dept": "Adi Dravidar and Tribal Welfare Department, TN",
            "status": "Open",
            "deadline": "30 September 2026",
            "app_url": "https://scholarships.gov.in",
            "source_url": "https://adtw.tn.gov.in",
            "source_name": "Adi Dravidar Welfare Official Portal, Tamil Nadu",
            "process": "1. Visit the National Scholarship Portal (scholarships.gov.in) or TN e-District portal.\n2. Complete student registration using Aadhaar.\n3. Upload bonafide certificate, community certificate, and income certificate.\n4. Institute verifies application online.\n5. District Welfare Officer accords sanction and funds are credited via DBT directly to bank account.",
            "rules": {
                "min_age": 16,
                "max_age": 35,
                "gender": "All",
                "max_income": 250000,
                "applicable_states": ["Tamil Nadu"],
                "social_categories": ["SC", "ST", "SCC"],
                "is_student": True,
                "education_levels": ["Undergraduate", "Postgraduate", "Diploma", "Engineering", "Medical"]
            },
            "benefits": [
                {"type": "Educational", "title": "100% Tuition Fee Reimbursement", "amount": "Full tuition & exam fees waived"},
                {"type": "Financial", "title": "Monthly Maintenance Allowance", "amount": "₹550 to ₹1,200 per month based on hosteller/day scholar status"}
            ],
            "documents": ["Aadhaar Card", "Community Certificate (SC/ST/SCC)", "Income Certificate (≤ ₹2.5 Lakhs)", "Previous Year Marksheet", "College Bonafide Certificate", "Bank Passbook with Aadhaar seeding"]
        },
        {
            "name": "Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Puthumai Penn)",
            "slug": "puthumai-penn-scheme",
            "short_description": "Monthly financial aid of ₹1,000 for girl students who studied in Tamil Nadu government schools from 6th to 12th standard.",
            "full_description": "Puthumai Penn scheme is a flagship Tamil Nadu initiative aimed at curbing child marriage, enhancing female gross enrolment ratio (GER) in higher education, and preventing dropouts. Female students enrolling in undergraduate degrees, diplomas, or ITI programs receive direct bank transfers of ₹1,000 each month till course completion.",
            "government_level": "State",
            "state": "Tamil Nadu",
            "cat": "women-child-welfare",
            "dept": "Social Welfare and Women Empowerment Department, TN",
            "status": "Open",
            "deadline": "31 October 2026",
            "app_url": "https://penkalvi.tn.gov.in",
            "source_url": "https://swd.tn.gov.in",
            "source_name": "TN Social Welfare Official Department Portal",
            "process": "1. College nodal officer registers eligible female students on the Pen Kalvi portal (penkalvi.tn.gov.in).\n2. Student validates Aadhaar, EMIS number (from 6th to 12th in TN Govt schools), and bank account.\n3. Automatic verification by School Education Department.\n4. Monthly assistance credited via Direct Benefit Transfer.",
            "rules": {
                "min_age": 17,
                "max_age": 25,
                "gender": "Female",
                "max_income": None,
                "applicable_states": ["Tamil Nadu"],
                "is_student": True,
                "education_levels": ["Undergraduate", "Diploma", "ITI", "Engineering"]
            },
            "benefits": [
                {"type": "Financial", "title": "Monthly Cash Transfer", "amount": "₹1,000 per month (₹12,000 per year) till completion"}
            ],
            "documents": ["Aadhaar Card", "School Transfer Certificate / EMIS proof of studying 6th-12th in TN Govt School", "College Admission Receipt", "Bank Account seeded with Aadhaar"]
        },
        {
            "name": "Chief Minister’s Comprehensive Health Insurance Scheme (CMCHIS)",
            "slug": "tn-cmchis-health-insurance",
            "short_description": "Cashless hospitalization coverage up to ₹5 lakh per year per family across empaneled hospitals in Tamil Nadu.",
            "full_description": "Jointly implemented with United India Insurance, CMCHIS offers comprehensive cashless health coverage for secondary and tertiary care medical conditions, surgeries, and specialized therapies up to ₹5,00,000 per annum for eligible families residing in Tamil Nadu.",
            "government_level": "State",
            "state": "Tamil Nadu",
            "cat": "healthcare",
            "dept": "Health and Family Welfare Department, TN",
            "status": "Open",
            "deadline": "Year Round Enrollment",
            "app_url": "https://cmchistn.com",
            "source_url": "https://tnhealth.tn.gov.in",
            "source_name": "CMCHIS Official State Authority",
            "process": "1. Visit the nearest District Kiosk at District Collectorate or Taluk Office.\n2. Submit Ration Card and Village Administrative Officer (VAO) income certificate.\n3. Biometric enrolment and digital photograph capture.\n4. Instant issuance of Chief Minister Health Insurance Smart Card.",
            "rules": {
                "min_age": 0,
                "max_age": 100,
                "gender": "All",
                "max_income": 120000,
                "applicable_states": ["Tamil Nadu"]
            },
            "benefits": [
                {"type": "Healthcare", "title": "Cashless Medical Treatment", "amount": "Up to ₹5,00,000 per family per year across 1,000+ hospital procedures"}
            ],
            "documents": ["Smart Ration Card / Family Card", "Income Certificate from VAO/Revenue Inspector (< ₹1.2 Lakh)", "Aadhaar Card of all family members"]
        },
        {
            "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
            "slug": "pm-kisan-samman-nidhi",
            "short_description": "Income support of ₹6,000 per year in three equal installments of ₹2,000 directly to landholding farmer families.",
            "full_description": "Central Sector scheme providing financial supplement to all landholding farmers' families in the country to procure agricultural inputs and meet domestic needs. Amount is credited directly into bank accounts via Aadhaar-linked DBT system.",
            "government_level": "Central",
            "state": "All India",
            "cat": "agriculture",
            "dept": "Ministry of Agriculture & Farmers Welfare",
            "status": "Open",
            "deadline": "Open Enrollment",
            "app_url": "https://pmkisan.gov.in",
            "source_url": "https://agricoop.nic.in",
            "source_name": "Ministry of Agriculture, Government of India",
            "process": "1. Register on pmkisan.gov.in using Aadhaar number and mobile OTP.\n2. Enter land ownership survey numbers and Khatauni details.\n3. Verification by State Nodal Revenue Officer.\n4. eKYC completion via biometric or Aadhaar OTP.",
            "rules": {
                "min_age": 18,
                "max_age": 90,
                "gender": "All",
                "is_farmer": True,
                "land_ownership_required": True,
                "applicable_states": ["All India"]
            },
            "benefits": [
                {"type": "Financial", "title": "Direct Income Support", "amount": "₹6,000 per year in 3 installments of ₹2,000 each"}
            ],
            "documents": ["Aadhaar Card", "Land Ownership Record (Patta / Chitta / RoR)", "Active Bank Account with NPCI mapping", "Mobile Number linked with Aadhaar"]
        },
        {
            "name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
            "slug": "pm-jay-ayushman-bharat",
            "short_description": "World's largest health assurance scheme providing health cover of ₹5 lakh per family per year for secondary and tertiary care.",
            "full_description": "PM-JAY provides health cover of ₹5,00,000 per family per year to over 12 crore poor and vulnerable families (approximately 55 crore beneficiaries) identified based on deprivation and occupational criteria of the Socio-Economic Caste Census 2011 (SECC 2011).",
            "government_level": "Central",
            "state": "All India",
            "cat": "healthcare",
            "dept": "National Health Authority",
            "status": "Open",
            "deadline": "Continuous Service",
            "app_url": "https://beneficiary.nha.gov.in",
            "source_url": "https://pmjay.gov.in",
            "source_name": "National Health Authority Official Portal",
            "process": "1. Check eligibility on beneficiary.nha.gov.in with Mobile/Aadhaar/Ration Card.\n2. Complete Aadhaar eKYC at Ayushman Arogya Mandir or CSC.\n3. Download Ayushman Card digitally.\n4. Show card at any empaneled hospital nationwide for cashless admission.",
            "rules": {
                "min_age": 0,
                "max_age": 100,
                "gender": "All",
                "applicable_states": ["All India"],
                "max_income": 250000
            },
            "benefits": [
                {"type": "Healthcare", "title": "Cashless Hospitalization", "amount": "₹5 Lakhs per family per year cover for 1,949 medical treatments"}
            ],
            "documents": ["Aadhaar Card", "Ration Card / PM-JAY Letter", "Mobile number for OTP verification"]
        },
        {
            "name": "Pradhan Mantri Mudra Yojana (PMMY)",
            "slug": "pradhan-mantri-mudra-yojana",
            "short_description": "Collateral-free business loans up to ₹20 lakh for non-corporate, non-farm small and micro enterprises.",
            "full_description": "PMMY provides loans under Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 Lakh), Tarun (₹5 Lakh to ₹10 Lakh), and newly enhanced Tarun Plus (up to ₹20 Lakh) to aspiring entrepreneurs, small shopkeepers, traders, and artisans without requiring any collateral security.",
            "government_level": "Central",
            "state": "All India",
            "cat": "entrepreneurship",
            "dept": "Ministry of Micro, Small & Medium Enterprises",
            "status": "Open",
            "deadline": "Active Continuous",
            "app_url": "https://www.udyamimitra.in",
            "source_url": "https://mudra.org.in",
            "source_name": "MUDRA Official Government Portal",
            "process": "1. Prepare business proposal and machinery quotation.\n2. Apply via Udyami Mitra portal (udyamimitra.in) or visit any scheduled commercial bank / NBFC.\n3. Submit KYC and bank account statements.\n4. Loan sanction and issuance of MUDRA debit card.",
            "rules": {
                "min_age": 18,
                "max_age": 65,
                "gender": "All",
                "is_entrepreneur": True,
                "applicable_states": ["All India"]
            },
            "benefits": [
                {"type": "Financial", "title": "Collateral-Free Loan", "amount": "Loans from ₹50,000 up to ₹20,00,000 at competitive interest rates"}
            ],
            "documents": ["Identity Proof (Aadhaar / Voter ID / PAN)", "Business Address Proof", "Quotation for Machinery / Raw Materials", "Bank Account Statement (6 months)", "Passport size photographs"]
        },
        {
            "name": "Kalaignar Magalir Urimai Thittam",
            "slug": "kalaignar-magalir-urimai-thittam",
            "short_description": "Monthly basic income rights grant of ₹1,000 to women heads of eligible households in Tamil Nadu.",
            "full_description": "Kalaignar Magalir Urimai Thittam acknowledges the unquantified domestic labor and social contribution of women by transferring a monthly financial entitlement of ₹1,000 directly into the bank accounts of woman heads of family in Tamil Nadu.",
            "government_level": "State",
            "state": "Tamil Nadu",
            "cat": "women-child-welfare",
            "dept": "Special Programme Implementation Department, TN",
            "status": "Open",
            "deadline": "Rolling Registration Camps",
            "app_url": "https://kmut.tn.gov.in",
            "source_url": "https://kmut.tn.gov.in",
            "source_name": "Government of Tamil Nadu KMUT Portal",
            "process": "1. Attend special registration camp organized at Fair Price Shop (Ration Shop) location.\n2. Provide Smart Card and biometric authentication.\n3. Mobile app field verification by designated volunteer.\n4. Direct Benefit Transfer credited on 15th of every calendar month.",
            "rules": {
                "min_age": 21,
                "max_age": 90,
                "gender": "Female",
                "max_income": 250000,
                "applicable_states": ["Tamil Nadu"]
            },
            "benefits": [
                {"type": "Financial", "title": "Monthly Women Grant", "amount": "₹1,000 per month (₹12,000 annually) directly to women"}
            ],
            "documents": ["Tamil Nadu Smart Family Card (Ration Card)", "Aadhaar Card", "Electricity Consumer Number (EB Card)", "Bank Passbook with Aadhaar seeding"]
        },
        {
            "name": "Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)",
            "slug": "pmay-urban-housing-scheme",
            "short_description": "Interest subsidy and financial assistance for urban poor and middle income groups to build or buy pucca houses.",
            "full_description": "PMAY-Urban provides interest subsidy on home loans and central assistance up to ₹2.5 Lakhs for Economically Weaker Section (EWS), Low Income Group (LIG), and Middle Income Group (MIG) families living in statutory urban areas across the country.",
            "government_level": "Central",
            "state": "All India",
            "cat": "housing",
            "dept": "Ministry of Housing and Urban Affairs",
            "status": "Open",
            "deadline": "31 December 2026",
            "app_url": "https://pmaymis.gov.in",
            "source_url": "https://mohua.gov.in",
            "source_name": "Ministry of Housing and Urban Affairs, GOI",
            "process": "1. Apply online at pmaymis.gov.in or nearest Common Service Centre.\n2. Choose component: Beneficiary-led Construction or Credit Linked Subsidy.\n3. Enter Aadhaar and urban municipal ward information.\n4. Field geo-tagging and subsidy release in milestone installments.",
            "rules": {
                "min_age": 18,
                "max_age": 75,
                "gender": "All",
                "max_income": 900000,
                "applicable_states": ["All India"]
            },
            "benefits": [
                {"type": "Housing", "title": "Credit-Linked Interest Subsidy", "amount": "Interest subsidy up to ₹2.67 Lakhs on housing loans"}
            ],
            "documents": ["Aadhaar Card", "Income Certificate / Salary Slips", "Proof of No Pucca House owned anywhere in India", "Land Title Deed / Building Plan Approval"]
        },
        {
            "name": "Tamil Nadu Annal Ambedkar Business Champions Scheme (AABCS)",
            "slug": "tn-annal-ambedkar-business-champions",
            "short_description": "35% capital subsidy and 6% interest subvention for SC/ST entrepreneurs setting up direct business enterprises in Tamil Nadu.",
            "full_description": "To foster inclusive economic development, the Government of Tamil Nadu offers AABCS exclusively to prospective Scheduled Caste and Scheduled Tribe entrepreneurs to launch manufacturing, service, or commercial transport enterprises with project cost up to ₹5 Crore.",
            "government_level": "State",
            "state": "Tamil Nadu",
            "cat": "entrepreneurship",
            "dept": "Ministry of Micro, Small & Medium Enterprises",
            "status": "Open",
            "deadline": "Active Fiscal Cycle 2026-27",
            "app_url": "https://msmeonline.tn.gov.in",
            "source_url": "https://msme.tn.gov.in",
            "source_name": "MSME Department, Government of Tamil Nadu",
            "process": "1. Register project profile on msmeonline.tn.gov.in.\n2. Submit project cost report and bank sanction letter.\n3. District Level Task Force Committee (DLTFC) interview and recommendation.\n4. Capital subsidy deposited directly into term loan account.",
            "rules": {
                "min_age": 18,
                "max_age": 55,
                "gender": "All",
                "social_categories": ["SC", "ST"],
                "is_entrepreneur": True,
                "applicable_states": ["Tamil Nadu"]
            },
            "benefits": [
                {"type": "Subsidy", "title": "35% Capital Subsidy", "amount": "35% subsidy up to ₹1.75 Crore on machinery and 6% interest subvention"}
            ],
            "documents": ["Community Certificate (SC/ST)", "Detailed Project Report (DPR)", "Aadhaar & PAN Card", "Bank In-principle Sanction Letter", "Educational Qualification Certificate"]
        },
        {
            "name": "Unique Disability ID (UDID) and Assistive Appliances (ADIP)",
            "slug": "udid-and-adip-disability-assistance",
            "short_description": "Free modern assistive devices, motorized tricycles, hearing aids, and digital national UDID smart cards for Persons with Disabilities.",
            "full_description": "ADIP scheme assists needy disabled persons in procuring durable, sophisticated, and scientifically manufactured standard aids and appliances (including motorized wheelchairs, smart canes, braille kits, and cochlear implants) to enhance self-reliance and employability.",
            "government_level": "Central",
            "state": "All India",
            "cat": "disability",
            "dept": "Department of Differently Abled Welfare, TN",
            "status": "Open",
            "deadline": "Year Round Service",
            "app_url": "https://www.swavlambancard.gov.in",
            "source_url": "https://disabilityaffairs.gov.in",
            "source_name": "Department of Empowerment of Persons with Disabilities, GOI",
            "process": "1. Register on swavlambancard.gov.in with disability certificate.\n2. Assessment by District Medical Board.\n3. Issuance of National UDID Smart Card.\n4. Distribution of customized assistive aids at ALIMCO distribution camps.",
            "rules": {
                "min_age": 3,
                "max_age": 85,
                "gender": "All",
                "is_disabled": True,
                "max_income": 360000,
                "applicable_states": ["All India"]
            },
            "benefits": [
                {"type": "In-kind", "title": "Free Assistive Devices", "amount": "100% free distribution of motorized tricycles, wheelchairs, and hearing aids"}
            ],
            "documents": ["Medical Disability Certificate (≥ 40% benchmark)", "Aadhaar Card", "Income Certificate (≤ ₹30,000/month)", "Recent full-length photograph showing disability"]
        },
        {
            "name": "National Means-cum-Merit Scholarship Scheme (NMMSS)",
            "slug": "national-means-cum-merit-scholarship",
            "short_description": "Scholarship of ₹12,000 per annum for meritorious students from economically weaker sections to prevent school dropouts at Class 8.",
            "full_description": "Centrally sponsored scheme awarding 1,00,000 scholarships annually to meritorious students studying in state government, government-aided, and local body schools to encourage them to continue study in secondary stage (Class 9 to 12).",
            "government_level": "Central",
            "state": "All India",
            "cat": "scholarships",
            "dept": "Department of Higher Education, MoE",
            "status": "Open",
            "deadline": "15 October 2026",
            "app_url": "https://scholarships.gov.in",
            "source_url": "https://education.gov.in",
            "source_name": "Ministry of Education, Government of India",
            "process": "1. Appear for State Level NMMSS Selection Test in Class 8.\n2. Qualified candidates register on National Scholarship Portal.\n3. School and district verification.\n4. Direct credit of ₹12,000 per year via PFMS DBT.",
            "rules": {
                "min_age": 12,
                "max_age": 16,
                "gender": "All",
                "is_student": True,
                "max_income": 350000,
                "applicable_states": ["All India"]
            },
            "benefits": [
                {"type": "Educational", "title": "Annual Secondary School Stipend", "amount": "₹12,000 per annum (₹1,000/month) from Class 9 to Class 12"}
            ],
            "documents": ["Aadhaar Card", "Class 7 Marksheet (minimum 55% marks)", "Family Income Certificate (≤ ₹3.5 Lakh)", "Caste Certificate (if applicable)", "Bank Account in Student's Name"]
        },
        {
            "name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
            "slug": "indira-gandhi-old-age-pension",
            "short_description": "Monthly pension for senior citizens aged 60 years and above belonging to below poverty line (BPL) households.",
            "full_description": "Part of the National Social Assistance Programme (NSAP), IGNOAPS provides non-contributory monthly old age pensions to destitute elderly citizens. State governments supplement the central contribution to provide a decent dignified livelihood.",
            "government_level": "Central",
            "state": "All India",
            "cat": "senior-citizens",
            "dept": "Department of Differently Abled Welfare, TN",
            "status": "Open",
            "deadline": "Year Round Application",
            "app_url": "https://nsap.nic.in",
            "source_url": "https://nsap.nic.in",
            "source_name": "National Social Assistance Programme, GOI",
            "process": "1. Submit application at Taluk Office or e-Sevai / CSC centre.\n2. Revenue Inspector inquiry and verification of BPL status.\n3. Sanction order issued by Sub-Collector / Tahsildar.\n4. Monthly pension deposited directly into bank or post office savings account.",
            "rules": {
                "min_age": 60,
                "max_age": 110,
                "gender": "All",
                "max_income": 100000,
                "applicable_states": ["All India"]
            },
            "benefits": [
                {"type": "Financial", "title": "Monthly Old Age Pension", "amount": "₹1,000 to ₹1,500 per month depending on state supplement"}
            ],
            "documents": ["Aadhaar Card", "BPL Ration Card or SECC inclusion proof", "Age proof certificate", "Bank or Post Office Passbook"]
        },
        {
            "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
            "slug": "pm-matru-vandana-yojana",
            "short_description": "Maternity cash incentive of ₹5,000 to ₹6,000 for pregnant and lactating mothers for health, nutrition, and wage loss.",
            "full_description": "Centrally sponsored maternity benefit programme under Mission Shakti providing direct cash transfer for pregnant women and lactating mothers for the first live birth (₹5,000 in two installments) and an additional incentive of ₹6,000 if the second child is a girl.",
            "government_level": "Central",
            "state": "All India",
            "cat": "women-child-welfare",
            "dept": "Social Welfare and Women Empowerment Department, TN",
            "status": "Open",
            "deadline": "Continuous Registration",
            "app_url": "https://pmmvy.wcd.gov.in",
            "source_url": "https://wcd.nic.in",
            "source_name": "Ministry of Women and Child Development, GOI",
            "process": "1. Register pregnancy at nearest Anganwadi Centre or Primary Health Centre (PHC) within 570 days of LMP.\n2. Submit Mother and Child Protection (MCP) card.\n3. Complete requisite ante-natal check-ups (ANC) and institutional delivery.\n4. Direct Benefit Transfer credited to mother's Aadhaar-linked account.",
            "rules": {
                "min_age": 19,
                "max_age": 45,
                "gender": "Female",
                "max_income": 800000,
                "applicable_states": ["All India"]
            },
            "benefits": [
                {"type": "Financial", "title": "Maternity Benefit Grant", "amount": "₹5,000 for first child; ₹6,000 for second girl child"}
            ],
            "documents": ["Mother and Child Protection (MCP) Card", "Aadhaar Card of Mother and Husband", "Aadhaar Seeded Bank Passbook", "Child Birth Certificate (for 2nd installment)"]
        },
        {
            "name": "Tamil Nadu Chief Minister’s Breakfast Scheme",
            "slug": "tn-cm-breakfast-scheme",
            "short_description": "Free nutritious morning hot breakfast for primary school students (Classes 1 to 5) across all government schools in Tamil Nadu.",
            "full_description": "Pioneering scheme in India providing cooked nutritious breakfast every morning to ensure school children attend class energetic, overcome nutritional deficiencies, and improve cognitive learning abilities across more than 31,000 primary schools.",
            "government_level": "State",
            "state": "Tamil Nadu",
            "cat": "education",
            "dept": "Social Welfare and Women Empowerment Department, TN",
            "status": "Open",
            "deadline": "Automatic School Enrollment",
            "app_url": "https://www.tn.gov.in",
            "source_url": "https://www.tn.gov.in",
            "source_name": "Government of Tamil Nadu Official Portal",
            "process": "1. Student gets admitted to any Tamil Nadu Government Primary School (Classes 1 to 5).\n2. EMIS student registration automatically qualifies child.\n3. Fresh hot breakfast served daily before morning classes begin.",
            "rules": {
                "min_age": 5,
                "max_age": 11,
                "gender": "All",
                "is_student": True,
                "applicable_states": ["Tamil Nadu"]
            },
            "benefits": [
                {"type": "In-kind", "title": "Daily Nutritious Breakfast", "amount": "Free daily cooked hot breakfast (upma, kichadi, pongal with sambar) on all school working days"}
            ],
            "documents": ["School Admission Record / EMIS Student ID"]
        },
        {
            "name": "Stand-Up India Scheme for Green-Field Enterprises",
            "slug": "stand-up-india-scheme",
            "short_description": "Bank loans between ₹10 lakh and ₹1 crore to at least one SC/ST and one woman borrower per bank branch for greenfield ventures.",
            "full_description": "Promotes entrepreneurship among women and SC & ST communities by facilitating composite bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield (new) manufacturing, services, agri-allied, or trading enterprises.",
            "government_level": "Central",
            "state": "All India",
            "cat": "entrepreneurship",
            "dept": "Ministry of Micro, Small & Medium Enterprises",
            "status": "Open",
            "deadline": "Extended through 2026",
            "app_url": "https://www.standupmitra.in",
            "source_url": "https://www.standupmitra.in",
            "source_name": "SIDBI Stand-Up Mitra Official Portal",
            "process": "1. Access standupmitra.in and complete borrower registration.\n2. Choose handholding support if required for project profiling.\n3. Bank branch evaluates proposal and sanctions loan.\n4. Credit guarantee covered by NCGTC.",
            "rules": {
                "min_age": 18,
                "max_age": 65,
                "gender": "All",
                "social_categories": ["SC", "ST", "General"],
                "is_entrepreneur": True,
                "applicable_states": ["All India"]
            },
            "benefits": [
                {"type": "Financial", "title": "Enterprise Loan Facility", "amount": "Composite loan (term loan + working capital) between ₹10 Lakh and ₹100 Lakh"}
            ],
            "documents": ["Aadhaar, PAN Card, Voter ID", "Caste Certificate (if SC/ST)", "Project Report with Financial Projections", "Partnership Deed / Incorporation Certificate (if applicable)"]
        },
        {
            "name": "Deendayal Antyodaya Yojana - National Rural Livelihoods Mission (DAY-NRLM)",
            "slug": "day-nrlm-rural-livelihoods",
            "short_description": "Interest subvention and revolving funds for Women Self-Help Groups (SHGs) to build sustainable micro-enterprises.",
            "full_description": "Mobilizes rural poor households into self-managed Self Help Groups (SHGs) and federations, provides revolving funds and community investment funds, and enables access to credit at subsidized 7% interest rates for women's collective livelihoods.",
            "government_level": "Central",
            "state": "All India",
            "cat": "rural-development",
            "dept": "Ministry of Housing and Urban Affairs",
            "status": "Open",
            "deadline": "Continuous Program",
            "app_url": "https://aajeevika.gov.in",
            "source_url": "https://aajeevika.gov.in",
            "source_name": "Ministry of Rural Development Official Portal",
            "process": "1. Join or form a Village Women Self Help Group (10-15 members).\n2. Open joint SHG savings account in local bank.\n3. Panchayat Level Federation grades SHG after regular meetings and internal lending.\n4. Access Revolving Fund and bank linkage loans with interest subvention.",
            "rules": {
                "min_age": 18,
                "max_age": 60,
                "gender": "Female",
                "max_income": 150000,
                "applicable_states": ["All India"]
            },
            "benefits": [
                {"type": "Financial", "title": "Revolving Fund & Subsidized Credit", "amount": "Revolving fund of ₹20,000 to ₹30,000 + collateral free bank credit up to ₹20 Lakh at 7%"}
            ],
            "documents": ["SHG Resolution Book", "Aadhaar of all member women", "Joint Bank Passbook", "Village Poverty Reduction Plan certification"]
        }
    ]

    for item in schemes_data:
        cat_id = cat_map[item["cat"]]
        dept_id = dept_map.get(item["dept"])
        
        scheme = Scheme(
            name=item["name"],
            slug=item["slug"],
            short_description=item["short_description"],
            full_description=item["full_description"],
            government_level=item["government_level"],
            state=item["state"],
            category_id=cat_id,
            department_id=dept_id,
            application_status=item["status"],
            application_deadline=item["deadline"],
            application_process=item["process"],
            official_application_url=item["app_url"],
            official_source_url=item["source_url"],
            source_name=item["source_name"],
            views_count=142,
            last_verified_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        db.add(scheme)
        db.commit()
        db.refresh(scheme)

        # Eligibility rule
        r = item["rules"]
        rule = EligibilityRule(
            scheme_id=scheme.id,
            min_age=r.get("min_age"),
            max_age=r.get("max_age"),
            gender=r.get("gender", "All"),
            max_income=r.get("max_income"),
            applicable_states=r.get("applicable_states", ["All India"]),
            social_categories=r.get("social_categories", ["All"]),
            is_student=r.get("is_student"),
            education_levels=r.get("education_levels"),
            is_farmer=r.get("is_farmer"),
            is_entrepreneur=r.get("is_entrepreneur"),
            is_disabled=r.get("is_disabled"),
            land_ownership_required=r.get("land_ownership_required", False)
        )
        db.add(rule)

        # Benefits
        for b in item["benefits"]:
            sb = SchemeBenefit(
                scheme_id=scheme.id,
                benefit_type=b["type"],
                title=b["title"],
                description=b.get("amount", ""),
                amount_details=b.get("amount", "")
            )
            db.add(sb)

        # Documents
        for d in item["documents"]:
            sd = SchemeDocument(
                scheme_id=scheme.id,
                document_name=d,
                is_mandatory=True
            )
            db.add(sd)

        db.commit()

    # 6. Seed Sample Approved Updates & One Pending Update (Demonstrating Section 7 & 8)
    tn_scheme = db.query(Scheme).filter(Scheme.slug == "tamil-nadu-post-matric-scholarship").first()
    if tn_scheme:
        # One Pending update waiting for admin verification!
        pending_update = SchemeUpdate(
            scheme_id=tn_scheme.id,
            update_type="Application Deadline",
            title="Application Deadline Extension",
            change_summary="Government of Tamil Nadu circular announced extension of online application closing date.",
            previous_value="30 September 2026",
            new_value="31 October 2026",
            verification_status="Pending",
            source_url="https://scholarships.gov.in",
            detected_at=datetime.datetime.utcnow() - datetime.timedelta(hours=4)
        )
        db.add(pending_update)

        # One Approved update to showcase in public updates page
        pmkisan = db.query(Scheme).filter(Scheme.slug == "pm-kisan-samman-nidhi").first()
        if pmkisan:
            approved_update = SchemeUpdate(
                scheme_id=pmkisan.id,
                update_type="Disbursement Notice",
                title="19th Installment DBT Credit Verification Completed",
                change_summary="Mandatory Aadhaar eKYC window validated for upcoming direct fund transfer tranche.",
                previous_value="18th Installment Disbursed",
                new_value="19th Installment Scheduled",
                verification_status="Approved",
                verified_by=admin_user.id,
                verified_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                source_url="https://pmkisan.gov.in",
                detected_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            )
            db.add(approved_update)

        mudra = db.query(Scheme).filter(Scheme.slug == "pradhan-mantri-mudra-yojana").first()
        if mudra:
            approved_mudra = SchemeUpdate(
                scheme_id=mudra.id,
                update_type="Benefit Enhancement",
                title="MUDRA Loan Ceiling Enhanced to ₹20 Lakh",
                change_summary="Union Budget notification increased the maximum limit under the Tarun Plus category from ₹10 Lakh to ₹20 Lakh for entrepreneurs who previously availed and repaid Tarun loans.",
                previous_value="₹10,00,000 Maximum Ceiling",
                new_value="₹20,00,000 Maximum Ceiling (Tarun Plus)",
                verification_status="Approved",
                verified_by=admin_user.id,
                verified_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                source_url="https://mudra.org.in",
                detected_at=datetime.datetime.utcnow() - datetime.timedelta(days=4)
            )
            db.add(approved_mudra)

        # Add initial scrape log
        first_source = db.query(GovernmentSource).first()
        log = ScrapeLog(
            source_id=first_source.id if first_source else None,
            status="Success",
            message="Initial government portal sync completed. 16 official schemes verified against state and central portals.",
            created_at=datetime.datetime.utcnow()
        )
        db.add(log)
        db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database successfully seeded with official government schemes!")
    finally:
        db.close()
