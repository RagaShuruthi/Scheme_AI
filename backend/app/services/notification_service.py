import datetime
from sqlalchemy.orm import Session
from app.models.models import Notification, SavedScheme, UserPreference, Scheme, SchemeUpdate

def broadcast_scheme_update(db: Session, update: SchemeUpdate):
    scheme = db.query(Scheme).filter(Scheme.id == update.scheme_id).first()
    if not scheme:
        return

    # 1. Users who saved this scheme
    saved_entries = db.query(SavedScheme).filter(SavedScheme.scheme_id == scheme.id).all()
    notified_user_ids = set()

    for entry in saved_entries:
        notif = Notification(
            user_id=entry.user_id,
            scheme_id=scheme.id,
            title=f"🔔 Update on Saved Scheme: {scheme.name}",
            message=f"{update.title}. {update.change_summary}",
            link=f"/schemes/{scheme.id}",
            created_at=datetime.datetime.utcnow()
        )
        db.add(notif)
        notified_user_ids.add(entry.user_id)

    # 2. Users with preferences matching category or state
    prefs = db.query(UserPreference).filter(UserPreference.notify_updates == True).all()
    for pref in prefs:
        if pref.user_id in notified_user_ids:
            continue
        
        match_cat = scheme.category_id in (pref.preferred_categories or [])
        match_state = scheme.state in (pref.preferred_states or []) or "All India" in (pref.preferred_states or [])

        if match_cat or match_state:
            notif = Notification(
                user_id=pref.user_id,
                scheme_id=scheme.id,
                title=f"🔔 New verified update: {scheme.name}",
                message=f"{update.change_summary}",
                link=f"/schemes/{scheme.id}",
                created_at=datetime.datetime.utcnow()
            )
            db.add(notif)
            notified_user_ids.add(pref.user_id)

    db.commit()
