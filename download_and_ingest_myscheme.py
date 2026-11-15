"""
Script to download and ingest full MyScheme (~2,066 Indian Government Schemes)
into SchemeSaarthi SQLite database (backend/scheme_saarthi.db).
"""

import os
import sys
import json
import re
import datetime
import sqlite3
import urllib.request
import ssl

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "scheme_saarthi.db")
if not os.path.exists(DB_PATH):
    DB_PATH = "scheme_saarthi.db"

LOCAL_CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "gov_myscheme_data.json")
MYSCHEME_DATASET_URL = "https://raw.githubusercontent.com/Aryan-Pardeshi/gov-myscheme-dataset/main/gov_myscheme_data.json"

def slugify(text):
    if not text:
        return "scheme-" + str(int(datetime.datetime.utcnow().timestamp()))
    clean = re.sub(r'[\W_]+', '-', text.lower()).strip('-')
    return clean[:90]

def download_dataset():
    if os.path.exists(LOCAL_CACHE_PATH) and os.path.getsize(LOCAL_CACHE_PATH) > 100000:
        print(f"[CACHE] Using existing local dataset: {LOCAL_CACHE_PATH}")
        with open(LOCAL_CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    print(f"[DOWNLOAD] Fetching full MyScheme dataset from {MYSCHEME_DATASET_URL} ...")
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        MYSCHEME_DATASET_URL,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            content = resp.read().decode("utf-8")
            data = json.loads(content)
            print(f"[DOWNLOAD] Successfully downloaded {len(data)} schemes! Saving cache...")
            with open(LOCAL_CACHE_PATH, "w", encoding="utf-8") as f:
                f.write(content)
            return data
    except Exception as e:
        print(f"[WARN] Direct download failed ({e}). Checking local or fallback...")
        if os.path.exists(LOCAL_CACHE_PATH):
            with open(LOCAL_CACHE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return None

def determine_category_id(tags, desc, cat_map):
    text = (str(tags) + " " + str(desc)).lower()
    if any(k in text for k in ["scholarship", "fellowship", "stipend"]):
        return cat_map.get("scholarships", 2)
    if any(k in text for k in ["school", "education", "college", "degree", "university", "student"]):
        return cat_map.get("education", 1)
    if any(k in text for k in ["health", "medical", "hospital", "treatment", "doctor", "medicine"]):
        return cat_map.get("healthcare", 4)
    if any(k in text for k in ["farm", "farmer", "agriculture", "crop", "seed", "kisan"]):
        return cat_map.get("agriculture", 5)
    if any(k in text for k in ["women", "girl", "maternity", "mother", "female", "mahila"]):
        return cat_map.get("women-child-welfare", 6)
    if any(k in text for k in ["senior", "elder", "old age", "pension"]):
        return cat_map.get("senior-citizens", 7)
    if any(k in text for k in ["house", "housing", "pucca", "shelter", "flat", "awas"]):
        return cat_map.get("housing", 8)
    if any(k in text for k in ["entrepreneur", "msme", "business", "startup", "loan", "industry"]):
        return cat_map.get("entrepreneurship", 10)
    if any(k in text for k in ["job", "employment", "apprenticeship", "skill", "training", "recruit"]):
        return cat_map.get("employment", 3)
    if any(k in text for k in ["disable", "handicap", "divyang", "blind"]):
        return cat_map.get("disability", 11)
    if any(k in text for k in ["rural", "gramin", "panchayat", "village"]):
        return cat_map.get("rural-development", 12)
    return cat_map.get("finance", 9)

def ingest_schemes(data):
    if not data:
        print("[ERROR] No data to ingest.")
        return 0

    print(f"[INGEST] Connecting to {DB_PATH} ...")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Load categories
    cur.execute("SELECT slug, id FROM categories")
    cat_map = dict(cur.fetchall())

    # Load existing schemes to avoid duplicate slugs
    cur.execute("SELECT slug FROM schemes")
    existing_slugs = set(row[0] for row in cur.fetchall())

    now = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    inserted = 0
    updated = 0

    dept_cache = {}

    for item in data:
        name = item.get("Scheme Name") or item.get("name") or item.get("title")
        if not name:
            continue

        raw_slug = item.get("Scheme Slug") or item.get("slug") or slugify(name)
        slug = slugify(raw_slug)

        level = item.get("Level") or ""
        state_or_ministry = item.get("State / UT / Ministry") or item.get("Nodal Ministry/State") or ""

        if "Central" in level:
            gov_level = "Central"
            state = "All India"
            ministry = state_or_ministry or "Government of India"
        else:
            gov_level = "State"
            state = state_or_ministry or "Tamil Nadu"
            ministry = f"Government of {state}"
        
        # Dept ID
        if ministry not in dept_cache:
            cur.execute("SELECT id FROM departments WHERE name = ?", (ministry,))
            row = cur.fetchone()
            if row:
                dept_cache[ministry] = row[0]
            else:
                cur.execute(
                    "INSERT INTO departments (name, government_level, state, website_url) VALUES (?, ?, ?, ?)",
                    (ministry, gov_level, state if gov_level == "State" else None, "https://www.myscheme.gov.in")
                )
                dept_cache[ministry] = cur.lastrowid
        dept_id = dept_cache[ministry]

        desc = item.get("Description") or item.get("short_description") or ""
        short_desc = (desc[:240] + "...") if len(desc) > 240 else desc
        if not short_desc:
            short_desc = f"{name} is an official government welfare initiative by {ministry}."

        cat_id = determine_category_id(item.get("Tags / Categories") or "", desc, cat_map)

        official_url = item.get("Official Link") or item.get("Official Links") or item.get("official_application_url") or item.get("MyScheme URL") or "https://www.myscheme.gov.in"
        source_url = item.get("MyScheme URL") or "https://www.myscheme.gov.in"

        process = item.get("Application Process") or "1. Visit the official portal.\n2. Submit registration with Aadhaar and required documents.\n3. Department verification and benefit disbursement."
        
        cur.execute("SELECT id FROM schemes WHERE slug = ? OR name = ?", (slug, name))
        row = cur.fetchone()

        if row:
            scheme_id = row[0]
            # Update existing
            cur.execute(
                """
                UPDATE schemes SET
                    name = ?, short_description = ?, full_description = ?,
                    government_level = ?, state = ?, category_id = ?, department_id = ?,
                    official_application_url = ?, official_source_url = ?, source_name = ?,
                    last_verified_at = ?, is_active = 1
                WHERE id = ?
                """,
                (
                    name, short_desc, desc or short_desc,
                    gov_level, state, cat_id, dept_id,
                    official_url, source_url, "myScheme National Portal",
                    now, scheme_id
                )
            )
            updated += 1
        else:
            cur.execute("SELECT id FROM schemes WHERE name = ?", (name,))
            if cur.fetchone():
                name = f"{name} ({state})"[:250]
            cur.execute("SELECT id FROM schemes WHERE slug = ?", (slug,))
            if cur.fetchone():
                slug = f"{slug}-{inserted + 1}"[:250]

            try:
                cur.execute(
                    """
                    INSERT INTO schemes (
                        name, slug, short_description, full_description,
                        government_level, state, category_id, department_id,
                        application_status, application_deadline, application_process,
                        official_application_url, official_source_url, source_name,
                        last_verified_at, version, is_active, views_count, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Open', 'Year Round / Active', ?, ?, ?, 'myScheme National Portal', ?, 1, 1, 50, ?, ?)
                    """,
                    (
                        name, slug, short_desc, desc or short_desc,
                        gov_level, state, cat_id, dept_id,
                        process, official_url, source_url,
                        now, now, now
                    )
                )
                scheme_id = cur.lastrowid
                inserted += 1
                existing_slugs.add(slug)
            except sqlite3.IntegrityError:
                continue

        # Ingest Benefits
        benefits_text = item.get("Benefits") or ""
        if benefits_text and isinstance(benefits_text, str) and len(benefits_text) > 5:
            cur.execute("DELETE FROM scheme_benefits WHERE scheme_id = ?", (scheme_id,))
            cur.execute(
                "INSERT INTO scheme_benefits (scheme_id, benefit_type, title, description, amount_details) VALUES (?, ?, ?, ?, ?)",
                (scheme_id, "Welfare", benefits_text[:120], benefits_text, benefits_text[:120])
            )

        # Ingest Documents
        docs_raw = item.get("Documents Required") or ""
        if docs_raw and isinstance(docs_raw, str):
            docs = [d.strip("- *• \t\n") for d in docs_raw.split("\n") if len(d.strip()) > 2]
            if not docs:
                docs = [docs_raw[:100]]
            cur.execute("DELETE FROM scheme_documents WHERE scheme_id = ?", (scheme_id,))
            for d_name in docs[:5]:
                cur.execute(
                    "INSERT INTO scheme_documents (scheme_id, document_name, is_mandatory) VALUES (?, ?, 1)",
                    (scheme_id, d_name[:120])
                )

        # Ingest Eligibility Rules
        elig_text = item.get("Eligibility Criteria") or ""
        cur.execute("DELETE FROM eligibility_rules WHERE scheme_id = ?", (scheme_id,))
        is_stud = any(k in (elig_text + name).lower() for k in ["student", "school", "college", "matric"])
        is_farm = any(k in (elig_text + name).lower() for k in ["farmer", "kisan", "cultivator", "agriculture"])
        is_ent = any(k in (elig_text + name).lower() for k in ["entrepreneur", "msme", "business", "trader"])
        cur.execute(
            """
            INSERT INTO eligibility_rules (
                scheme_id, min_age, max_age, gender, max_income,
                applicable_states, social_categories, is_student, is_farmer, is_entrepreneur, is_disabled, land_ownership_required
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                scheme_id, 18, 70, "All", None,
                json.dumps([state] if gov_level == "State" else ["All India"]),
                json.dumps(["All"]),
                is_stud, is_farm, is_ent, False, False
            )
        )

    conn.commit()
    cur.execute("SELECT count(*) FROM schemes")
    total_in_db = cur.fetchone()[0]
    conn.close()

    print("=" * 65)
    print(f"✅ MYSCHEME BULK INGESTION COMPLETE!")
    print(f"   New Schemes Added       : {inserted}")
    print(f"   Existing Schemes Synced : {updated}")
    print(f"   Total Schemes in DB     : {total_in_db}")
    print("=" * 65)
    return total_in_db

if __name__ == "__main__":
    data = download_dataset()
    if data:
        ingest_schemes(data)
    else:
        print("[FAIL] Could not load dataset.")
