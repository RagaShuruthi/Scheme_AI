from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.models import SchemeUpdate, Scheme
from app.schemas.schemas import SchemeUpdateOut

router = APIRouter(prefix="/updates", tags=["Updates"])

@router.get("", response_model=List[SchemeUpdateOut])
def get_verified_updates(
    government_level: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    sort: Optional[str] = Query("latest"),
    db: Session = Depends(get_db)
):
    # Only APPROVED updates are publicly visible!
    query = db.query(SchemeUpdate).join(Scheme).filter(
        SchemeUpdate.verification_status == "Approved"
    )

    if government_level:
        query = query.filter(Scheme.government_level == government_level)
    if state and state != "All":
        query = query.filter((Scheme.state == state) | (Scheme.government_level == "Central"))
    if category_id:
        query = query.filter(Scheme.category_id == category_id)

    if sort == "latest":
        query = query.order_by(desc(SchemeUpdate.verified_at), desc(SchemeUpdate.detected_at))
    else:
        query = query.order_by(desc(SchemeUpdate.detected_at))

    updates = query.limit(50).all()
    results = []
    for u in updates:
        results.append(SchemeUpdateOut(
            id=u.id,
            scheme_id=u.scheme_id,
            scheme_name=u.scheme.name if u.scheme else "Unknown Scheme",
            update_type=u.update_type,
            title=u.title,
            change_summary=u.change_summary,
            previous_value=u.previous_value,
            new_value=u.new_value,
            verification_status=u.verification_status,
            detected_at=u.detected_at,
            verified_at=u.verified_at,
            source_url=u.source_url
        ))
    return results

@router.get("/{update_id}", response_model=SchemeUpdateOut)
def get_update_detail(update_id: int, db: Session = Depends(get_db)):
    u = db.query(SchemeUpdate).filter(SchemeUpdate.id == update_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Update record not found")
    
    return SchemeUpdateOut(
        id=u.id,
        scheme_id=u.scheme_id,
        scheme_name=u.scheme.name if u.scheme else "Unknown Scheme",
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
