import datetime
import os
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.database import get_db
from app.models.models import (
    Scheme, User, SchemeUpdate, SchemeVersion, GovernmentSource,
    ScrapeLog, AdminAction, Category
)
from app.schemas.schemas import (
    DashboardStatsOut, SchemeUpdateOut, GovernmentSourceOut,
    GovernmentSourceCreate, ScrapeLogOut
)
from app.auth.dependencies import get_current_admin_user
from app.services.notification_service import broadcast_scheme_update
from app.scraper.sources import is_trusted_official_domain
from app.scraper.engine import ScraperEngine

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/dashboard", response_model=DashboardStatsOut)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    total_schemes = db.query(Scheme).count()
    active_schemes = db.query(Scheme).filter(Scheme.is_active == True).count()
    recently_updated_schemes = db.query(SchemeUpdate).filter(SchemeUpdate.verification_status == "Approved").count()
    pending_updates = db.query(SchemeUpdate).filter(SchemeUpdate.verification_status == "Pending").count()
    failed_fetches = db.query(ScrapeLog).filter(ScrapeLog.status == "Failed").count()
    total_users = db.query(User).count()

    # Most viewed schemes
    top_schemes = db.query(Scheme).order_by(desc(Scheme.views_count)).limit(5).all()
    most_viewed = [
        {"id": s.id, "name": s.name, "views": s.views_count, "category": s.category.name if s.category else ""}
        for s in top_schemes
    ]

    # Popular categories breakdown
    categories = db.query(Category).all()
    popular_cats = []
    for c in categories:
        cnt = db.query(Scheme).filter(Scheme.category_id == c.id).count()
        if cnt > 0:
            popular_cats.append({"name": c.name, "count": cnt})

    # Recent activity
    actions = db.query(AdminAction).order_by(desc(AdminAction.created_at)).limit(6).all()
    recent_activity = [
        {"action": a.action_type, "target": a.target_entity, "notes": a.notes, "time": a.created_at.strftime("%Y-%m-%d %H:%M")}
        for a in actions
    ]

    return DashboardStatsOut(
        total_schemes=total_schemes,
        active_schemes=active_schemes,
        recently_updated_schemes=recently_updated_schemes,
        pending_verification_updates=pending_updates,
        failed_source_fetches=failed_fetches,
        total_users=total_users,
        popular_categories=popular_cats,
        most_viewed_schemes=most_viewed,
        recent_activity=recent_activity
    )

@router.get("/pending-updates", response_model=List[SchemeUpdateOut])
def get_pending_updates(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    updates = db.query(SchemeUpdate).join(Scheme).filter(
        SchemeUpdate.verification_status == "Pending"
    ).order_by(desc(SchemeUpdate.detected_at)).all()

    return [
        SchemeUpdateOut(
            id=u.id,
            scheme_id=u.scheme_id,
            scheme_name=u.scheme.name if u.scheme else "Unknown",
            update_type=u.update_type,
            title=u.title,
            change_summary=u.change_summary,
            previous_value=u.previous_value,
            new_value=u.new_value,
            verification_status=u.verification_status,
            detected_at=u.detected_at,
            verified_at=u.verified_at,
            source_url=u.source_url
        )
        for u in updates
    ]

@router.post("/updates/{update_id}/approve", status_code=status.HTTP_200_OK)
def approve_update(
    update_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    update = db.query(SchemeUpdate).filter(SchemeUpdate.id == update_id).first()
    if not update:
        raise HTTPException(status_code=404, detail="Update not found")

    scheme = update.scheme
    if not scheme:
        raise HTTPException(status_code=404, detail="Associated scheme not found")

    # 1. Take a snapshot of the current version before updating
    snapshot = {
        "version": scheme.version,
        "name": scheme.name,
        "application_deadline": scheme.application_deadline,
        "application_status": scheme.application_status,
        "short_description": scheme.short_description
    }
    version_record = SchemeVersion(
        scheme_id=scheme.id,
        version_number=scheme.version,
        snapshot_json=snapshot,
        change_reason=f"Approved update: {update.update_type} - {update.title}",
        created_at=datetime.datetime.utcnow()
    )
    db.add(version_record)

    # 2. Apply change directly to scheme
    if update.update_type == "Application Deadline" and update.new_value:
        scheme.application_deadline = update.new_value
    elif update.update_type == "Status Change" and update.new_value:
        scheme.application_status = update.new_value

    scheme.version += 1
    scheme.last_verified_at = datetime.datetime.utcnow()

    # 3. Mark update approved
    update.verification_status = "Approved"
    update.verified_by = admin.id
    update.verified_at = datetime.datetime.utcnow()

    # 4. Log admin action
    action = AdminAction(
        admin_id=admin.id,
        action_type="Approve Update",
        target_entity="SchemeUpdate",
        entity_id=update.id,
        notes=f"Approved '{update.title}' for scheme '{scheme.name}'",
        created_at=datetime.datetime.utcnow()
    )
    db.add(action)
    db.commit()

    # 5. Broadcast alerts to subscribers
    broadcast_scheme_update(db, update)

    return {"success": True, "message": f"Update approved and published. Scheme version advanced to v{scheme.version}."}

@router.post("/updates/{update_id}/reject", status_code=status.HTTP_200_OK)
def reject_update(
    update_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    update = db.query(SchemeUpdate).filter(SchemeUpdate.id == update_id).first()
    if not update:
        raise HTTPException(status_code=404, detail="Update not found")

    update.verification_status = "Rejected"
    update.verified_by = admin.id
    update.verified_at = datetime.datetime.utcnow()

    action = AdminAction(
        admin_id=admin.id,
        action_type="Reject Update",
        target_entity="SchemeUpdate",
        entity_id=update.id,
        notes=f"Rejected update '{update.title}'",
        created_at=datetime.datetime.utcnow()
    )
    db.add(action)
    db.commit()

    return {"success": True, "message": "Update has been rejected and will not be published."}

@router.get("/sources", response_model=List[GovernmentSourceOut])
def get_sources(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    return db.query(GovernmentSource).all()

@router.post("/sources", response_model=GovernmentSourceOut, status_code=status.HTTP_201_CREATED)
def create_source(
    src_in: GovernmentSourceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    if not is_trusted_official_domain(src_in.url):
        raise HTTPException(
            status_code=400,
            detail="Domain is not recognized as an official government source. Only official domains (e.g. *.gov.in, *.nic.in) are permitted."
        )

    src = GovernmentSource(
        name=src_in.name,
        government_level=src_in.government_level,
        state=src_in.state,
        department=src_in.department,
        url=src_in.url,
        source_type=src_in.source_type,
        scraping_frequency_hours=src_in.scraping_frequency_hours
    )
    db.add(src)
    db.commit()
    db.refresh(src)
    return src

@router.post("/sources/{source_id}/check")
def trigger_source_scrape(
    source_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    engine = ScraperEngine(db)
    result = engine.run_source_check(source_id)
    return result

@router.post("/scraper/run-all")
def trigger_run_all_scrapers(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Triggers scraping across all 13 official government target portals."""
    engine = ScraperEngine(db)
    result = engine.run_all_sources()
    return result

@router.get("/scraper/output")
def get_scraper_output(
    admin: User = Depends(get_current_admin_user)
):
    """Returns the latest aggregated scraped output from all government portals."""
    output_filename = "scraped_government_schemes.json"
    if os.path.exists(output_filename):
        with open(output_filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"message": "No scrape output file found yet. Run scraper to generate output."}

@router.get("/scrape-logs", response_model=List[ScrapeLogOut])
def get_scrape_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    logs = db.query(ScrapeLog).order_by(desc(ScrapeLog.created_at)).limit(40).all()
    res = []
    for l in logs:
        res.append(ScrapeLogOut(
            id=l.id,
            source_id=l.source_id,
            source_name=l.source.name if l.source else "Direct Portal",
            status=l.status,
            message=l.message,
            details=l.details,
            created_at=l.created_at
        ))
    return res

@router.post("/simulate-update")
def simulate_scheme_update(
    scheme_slug: str = "tamil-nadu-post-matric-scholarship",
    update_type: str = "Application Deadline",
    new_value: str = "31 October 2026",
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    engine = ScraperEngine(db)
    update = engine.simulate_official_portal_update(scheme_slug, update_type, new_value)
    return {
        "success": True,
        "message": f"Simulated official change detected for '{scheme_slug}'. Pending verification created.",
        "update_id": update.id
    }
