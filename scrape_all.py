"""
SchemeSaarthi Multi-Portal Web Scraper
Scrapes and extracts official welfare schemes from 13 government portals:
1. India.gov.in - Government programmes
2. PIB - New scheme announcements
3. DBT Bharat - Direct benefit transfer schemes
4. myScheme - Scheme catalogue
5. TN Government - Tamil Nadu schemes
6. NABARD - Rural development and agriculture
7. Ministry of Education - Education schemes
8. Social Justice Ministry - Social welfare schemes
9. Women and Child Development - Women and child welfare
10. MSME Ministry - Small business schemes
11. Agriculture Ministry - Farmer schemes
12. Ministry of Rural Development - Rural development schemes
13. Housing and Urban Affairs - Urban development schemes
"""

import sys
import os
import json
import datetime

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.scraper.portal_scrapers import GOVERNMENT_PORTALS, scrape_portal_live, run_all_portal_scrapers

def main():
    print("=" * 75)
    print("  🏛️  SCHEMESAARTHI MULTI-GOVERNMENT PORTAL WEB SCRAPER")
    print("  Scraping 13 Official Central and State Portals")
    print("=" * 75)

    db = None
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        print("Connected to SchemeSaarthi database (scheme_saarthi.db).\n")
    except Exception as e:
        print(f"Running with direct SQLite engine: {e}\n")

    output = run_all_portal_scrapers(db=db)

    print("\n" + "=" * 75)
    print(f"📊 SCRAPING SUMMARY & RESULTS:")
    print("=" * 75)
    print(f"Portals Scraped     : {output['total_portals_scraped']} / 13")
    print(f"Total Schemes Found : {output['total_schemes_extracted']}")
    print(f"Execution Duration  : {output['execution_duration_seconds']} seconds")
    print(f"Output File Saved   : {os.path.abspath('scraped_government_schemes.json')}")
    print("=" * 75)

    print("\n📋 PORTALS BREAKDOWN:")
    for idx, p in enumerate(output["scraped_data_by_portal"], 1):
        print(f"\n{idx}. [{p['source_name']}]")
        print(f"   🌐 URL             : {p['official_url']}")
        print(f"   🎯 Target Focus    : {p['target_extraction']}")
        print(f"   📡 Status          : {p['fetch_status']}")
        print(f"   📦 Extracted Items : {p['schemes_count']}")
        for s in p["extracted_schemes"][:2]:
            print(f"      • {s['title']} ({s['category']})")
        if len(p["extracted_schemes"]) > 2:
            print(f"      • ... and {len(p['extracted_schemes']) - 2} more")

    if db:
        db.close()

if __name__ == "__main__":
    main()
