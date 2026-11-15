import datetime
import logging
import json
import os
from typing import Dict, Any, List, Optional

try:
    from sqlalchemy.orm import Session
    from app.models.models import GovernmentSource, ScrapeLog, Scheme, SchemeUpdate
    from app.scraper.change_detector import ChangeDetector
    HAS_SQLALCHEMY = True
except ImportError:
    Session = Any
    SchemeUpdate = Any
    GovernmentSource = Any
    ScrapeLog = Any
    Scheme = Any
    HAS_SQLALCHEMY = False

from app.scraper.sources import is_trusted_official_domain
from app.scraper.portal_scrapers import GOVERNMENT_PORTALS, scrape_portal_live, run_all_portal_scrapers

logger = logging.getLogger(__name__)

class ScraperEngine:
    def __init__(self, db: Session = None):
        self.db = db
        self.detector = ChangeDetector(db) if (HAS_SQLALCHEMY and db) else None

    def run_all_sources(self) -> Dict[str, Any]:
        """Runs the multi-portal scraper for all 13 government websites."""
        return run_all_portal_scrapers(self.db)

    def run_source_check(self, source_id: int) -> Dict[str, Any]:
        source = self.db.query(GovernmentSource).filter(GovernmentSource.id == source_id).first()
        if not source:
            return {"error": "Source not found"}

        if not is_trusted_official_domain(source.url):
            log = ScrapeLog(
                source_id=source.id,
                status="Failed",
                message=f"Domain {source.url} rejected: Not in official government domain allowlist",
                created_at=datetime.datetime.utcnow()
            )
            self.db.add(log)
            self.db.commit()
            return {"status": "error", "message": "Untrusted domain"}

        try:
            # Match against configured target portals
            matched_portal = next((p for p in GOVERNMENT_PORTALS if p["url"] in source.url or source.url in p["url"]), None)
            
            if matched_portal:
                scrape_res = scrape_portal_live(matched_portal)
                extracted_count = scrape_res["schemes_count"]
                fetch_status = scrape_res["fetch_status"]
                target_focus = scrape_res["target_extraction"]
            else:
                custom_portal = {
                    "id_key": f"src_{source.id}",
                    "name": source.name,
                    "url": source.url,
                    "target": "Government Schemes & Announcements",
                    "level": source.government_level,
                    "state": source.state,
                    "dept": source.department or "Government Portal",
                    "default_items": []
                }
                scrape_res = scrape_portal_live(custom_portal)
                extracted_count = scrape_res["schemes_count"]
                fetch_status = scrape_res["fetch_status"]
                target_focus = "Government Schemes & Announcements"

            source.last_checked_at = datetime.datetime.utcnow()
            source.last_status = f"Active ({fetch_status})"

            # Find schemes related to this source / department
            schemes = self.db.query(Scheme).filter(
                (Scheme.official_source_url.contains(source.url)) |
                (Scheme.source_name.contains(source.name))
            ).all()

            for scheme in schemes:
                scheme.last_verified_at = datetime.datetime.utcnow()

            log = ScrapeLog(
                source_id=source.id,
                status="Success",
                message=f"Scraped '{source.name}'. Extracted {extracted_count} items for {target_focus}. Verified {len(schemes)} existing scheme records.",
                details={
                    "extracted_items": [s["title"] for s in scrape_res.get("extracted_schemes", [])],
                    "verified_db_schemes": [s.name for s in schemes]
                }
            )
            self.db.add(log)
            self.db.commit()

            return {
                "status": "success",
                "source": source.name,
                "url": source.url,
                "target": target_focus,
                "fetch_status": fetch_status,
                "items_extracted": extracted_count,
                "schemes_verified": len(schemes),
                "extracted_data": scrape_res.get("extracted_schemes", [])
            }

        except Exception as e:
            logger.error(f"Error checking source {source.name}: {e}")
            log = ScrapeLog(
                source_id=source.id,
                status="Failed",
                message=f"Fetch failed: {str(e)}",
                created_at=datetime.datetime.utcnow()
            )
            source.last_status = "Error"
            self.db.add(log)
            self.db.commit()
            return {"status": "error", "message": str(e)}

    def simulate_official_portal_update(self, scheme_slug: str, update_type: str, new_value: str) -> SchemeUpdate:
        """
        Simulates an official portal update detection for admin verification testing.
        """
        scheme = self.db.query(Scheme).filter(Scheme.slug == scheme_slug).first()
        if not scheme:
            raise ValueError(f"Scheme with slug '{scheme_slug}' not found")

        prev_val = scheme.application_deadline if update_type == "Application Deadline" else "Existing Policy"
        
        update = SchemeUpdate(
            scheme_id=scheme.id,
            update_type=update_type,
            title=f"{update_type} Update - {scheme.name}",
            change_summary=f"Official government portal announced updated {update_type.lower()}: {new_value}.",
            previous_value=prev_val,
            new_value=new_value,
            verification_status="Pending",
            source_url=scheme.official_source_url,
            detected_at=datetime.datetime.utcnow()
        )
        self.db.add(update)
        self.db.commit()
        self.db.refresh(update)
        return update
