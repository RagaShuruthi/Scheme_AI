import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Scheme, SchemeUpdate, ScrapeLog, GovernmentSource

class ChangeDetector:
    def __init__(self, db: Session):
        self.db = db

    def check_for_changes(
        self,
        scheme: Scheme,
        scraped_data: Dict[str, Any],
        source: GovernmentSource
    ) -> List[SchemeUpdate]:
        detected_updates: List[SchemeUpdate] = []

        # 1. Check Deadline Changes
        new_deadline = scraped_data.get("application_deadline")
        if new_deadline and new_deadline != scheme.application_deadline:
            update = SchemeUpdate(
                scheme_id=scheme.id,
                update_type="Application Deadline",
                title=f"Application Deadline Extension - {scheme.name}",
                change_summary=f"The application deadline has changed from {scheme.application_deadline or 'Unspecified'} to {new_deadline}.",
                previous_value=scheme.application_deadline or "None",
                new_value=new_deadline,
                verification_status="Pending",
                source_url=scheme.official_source_url,
                detected_at=datetime.datetime.utcnow()
            )
            detected_updates.append(update)

        # 2. Check Status Changes
        new_status = scraped_data.get("application_status")
        if new_status and new_status != scheme.application_status:
            update = SchemeUpdate(
                scheme_id=scheme.id,
                update_type="Status Change",
                title=f"Application Status Changed to {new_status}",
                change_summary=f"Scheme application status transitioned from {scheme.application_status} to {new_status}.",
                previous_value=scheme.application_status,
                new_value=new_status,
                verification_status="Pending",
                source_url=scheme.official_source_url,
                detected_at=datetime.datetime.utcnow()
            )
            detected_updates.append(update)

        # 3. Check Eligibility Income Revisions
        if "max_income" in scraped_data and scheme.eligibility_rule:
            new_inc = scraped_data["max_income"]
            curr_inc = scheme.eligibility_rule.max_income
            if new_inc != curr_inc and new_inc is not None:
                update = SchemeUpdate(
                    scheme_id=scheme.id,
                    update_type="Eligibility Revision",
                    title=f"Income Eligibility Cap Revised",
                    change_summary=f"Annual family income ceiling updated from ₹{curr_inc or 0:,.0f} to ₹{new_inc:,.0f}.",
                    previous_value=f"₹{curr_inc or 0:,.0f}",
                    new_value=f"₹{new_inc:,.0f}",
                    verification_status="Pending",
                    source_url=scheme.official_source_url,
                    detected_at=datetime.datetime.utcnow()
                )
                detected_updates.append(update)

        # Save updates to DB
        for u in detected_updates:
            self.db.add(u)

        if detected_updates:
            # Create scrape log
            log = ScrapeLog(
                source_id=source.id if source else None,
                status="Changes Detected",
                message=f"Detected {len(detected_updates)} change(s) for scheme '{scheme.name}'",
                details={"scheme_id": scheme.id, "changes": [u.update_type for u in detected_updates]}
            )
            self.db.add(log)
            self.db.commit()

        return detected_updates
