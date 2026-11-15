from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.models import User, SavedScheme, UserPreference, Notification, Scheme
from app.schemas.schemas import UserOut, UserUpdate, SavedSchemeOut, UserPreferenceOut, UserPreferenceUpdate, NotificationOut, SchemeListOut
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/user", tags=["User Profile & Activity"])

@router.get("/profile", response_model=UserOut)
def get_user_profile(user: User = Depends(get_current_user)):
    return user

@router.put("/profile", response_model=UserOut)
def update_user_profile(
    update_data: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.full_name:
        user.full_name = update_data.full_name
    db.commit()
    db.refresh(user)
    return user

@router.get("/saved-schemes", response_model=List[SavedSchemeOut])
def get_saved_schemes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedScheme).filter(SavedScheme.user_id == user.id).order_by(desc(SavedScheme.created_at)).all()
    results = []
    for item in saved:
        s = item.scheme
        benefit_text = s.benefits[0].title if s.benefits else None
        scheme_out = SchemeListOut(
            id=s.id,
            name=s.name,
            slug=s.slug,
            short_description=s.short_description,
            government_level=s.government_level,
            state=s.state,
            category_id=s.category_id,
            category_name=s.category.name if s.category else None,
            department_name=s.department.name if s.department else None,
            application_status=s.application_status,
            application_deadline=s.application_deadline,
            official_application_url=s.official_application_url,
            official_source_url=s.official_source_url,
            source_name=s.source_name,
            last_verified_at=s.last_verified_at,
            views_count=s.views_count,
            benefits_summary=benefit_text
        )
        results.append(SavedSchemeOut(
            id=item.id,
            scheme_id=item.scheme_id,
            scheme=scheme_out,
            created_at=item.created_at
        ))
    return results

@router.post("/saved-schemes/{scheme_id}", status_code=status.HTTP_201_CREATED)
def toggle_save_scheme(
    scheme_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(SavedScheme).filter(SavedScheme.user_id == user.id, SavedScheme.scheme_id == scheme_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "message": "Scheme removed from saved list"}
    
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    new_saved = SavedScheme(user_id=user.id, scheme_id=scheme.id)
    db.add(new_saved)
    db.commit()
    return {"saved": True, "message": "Scheme saved to your profile"}

@router.get("/preferences", response_model=UserPreferenceOut)
def get_preferences(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if not pref:
        pref = UserPreference(user_id=user.id, preferred_categories=[], preferred_states=["Tamil Nadu"])
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/preferences", response_model=UserPreferenceOut)
def update_preferences(
    pref_in: UserPreferenceUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if not pref:
        pref = UserPreference(user_id=user.id)
        db.add(pref)
    
    pref.preferred_categories = pref_in.preferred_categories
    pref.preferred_states = pref_in.preferred_states
    pref.notify_updates = pref_in.notify_updates
    db.commit()
    db.refresh(pref)
    return pref

@router.get("/notifications", response_model=List[NotificationOut])
def get_notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == user.id).order_by(desc(Notification.created_at)).limit(30).all()

@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}
