import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models.models import Scheme, Category, Department, EligibilityRule, SchemeBenefit, SchemeDocument, SchemeUpdate, SchemeVersion, User
from app.schemas.schemas import SchemeListOut, SchemeDetailOut, SchemeCreate, CategoryOut, DepartmentOut
from app.auth.dependencies import get_current_admin_user

router = APIRouter(prefix="/schemes", tags=["Schemes"])

def slugify(text: str) -> str:
    return re.sub(r'[\W_]+', '-', text.lower()).strip('-')

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    res = []
    for c in categories:
        cnt = db.query(Scheme).filter(Scheme.category_id == c.id, Scheme.is_active == True).count()
        cat_dict = CategoryOut(
            id=c.id,
            name=c.name,
            slug=c.slug,
            description=c.description,
            icon=c.icon,
            schemes_count=cnt
        )
        res.append(cat_dict)
    return res

@router.get("/departments", response_model=List[DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.get("/states", response_model=List[str])
def get_states(db: Session = Depends(get_db)):
    states = db.query(Scheme.state).filter(Scheme.is_active == True, Scheme.state != None, Scheme.state != "All India").distinct().order_by(Scheme.state).all()
    return [s[0] for s in states if s[0]]

@router.get("/stats")
def get_public_stats(db: Session = Depends(get_db)):
    total = db.query(Scheme).filter(Scheme.is_active == True).count()
    cats = db.query(Category).count()
    central = db.query(Scheme).filter(Scheme.is_active == True, Scheme.government_level == "Central").count()
    state = db.query(Scheme).filter(Scheme.is_active == True, Scheme.government_level == "State").count()
    return {
        "total_schemes": total,
        "total_categories": cats,
        "central_schemes": central,
        "state_schemes": state,
        "verified_percentage": 100
    }

@router.get("", response_model=List[SchemeListOut])
def list_schemes(
    category_id: Optional[int] = Query(None),
    government_level: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort: Optional[str] = Query("popular"),  # "popular", "latest", "name"
    limit: int = Query(100, ge=1, le=2500),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Scheme).filter(Scheme.is_active == True)

    if category_id:
        query = query.filter(Scheme.category_id == category_id)
    if government_level:
        query = query.filter(Scheme.government_level == government_level)
    if state and state != "All":
        query = query.filter((Scheme.state == state) | (Scheme.state == "All India") | (Scheme.government_level == "Central"))
    if status:
        query = query.filter(Scheme.application_status == status)

    if sort == "latest":
        query = query.order_by(desc(Scheme.last_verified_at))
    elif sort == "name":
        query = query.order_by(Scheme.name)
    else:  # popular
        query = query.order_by(desc(Scheme.views_count), desc(Scheme.id))

    schemes = query.offset(skip).limit(limit).all()
    results = []
    for s in schemes:
        benefit_text = s.benefits[0].title if s.benefits else None
        results.append(SchemeListOut(
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
        ))
    return results

@router.get("/{id_or_slug}", response_model=SchemeDetailOut)
def get_scheme_detail(id_or_slug: str, db: Session = Depends(get_db)):
    if id_or_slug.isdigit():
        scheme = db.query(Scheme).filter(Scheme.id == int(id_or_slug)).first()
    else:
        scheme = db.query(Scheme).filter(Scheme.slug == id_or_slug).first()

    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    # Increment view counter
    scheme.views_count = (scheme.views_count or 0) + 1
    db.commit()
    db.refresh(scheme)

    return scheme

@router.post("", response_model=SchemeDetailOut, status_code=status.HTTP_201_CREATED)
def create_scheme(
    scheme_in: SchemeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    existing = db.query(Scheme).filter(Scheme.name == scheme_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="A scheme with this title already exists")

    slug = slugify(scheme_in.name)
    scheme = Scheme(
        name=scheme_in.name,
        slug=slug,
        short_description=scheme_in.short_description,
        full_description=scheme_in.full_description,
        government_level=scheme_in.government_level,
        state=scheme_in.state,
        category_id=scheme_in.category_id,
        department_id=scheme_in.department_id,
        application_status=scheme_in.application_status,
        application_start_date=scheme_in.application_start_date,
        application_deadline=scheme_in.application_deadline,
        application_process=scheme_in.application_process,
        official_application_url=scheme_in.official_application_url,
        official_source_url=scheme_in.official_source_url,
        source_name=scheme_in.source_name
    )
    db.add(scheme)
    db.commit()
    db.refresh(scheme)

    # Add eligibility rule
    eligibility = EligibilityRule(
        scheme_id=scheme.id,
        min_age=scheme_in.min_age,
        max_age=scheme_in.max_age,
        gender=scheme_in.gender or "All",
        max_income=scheme_in.max_income,
        applicable_states=scheme_in.applicable_states or ["All India"],
        social_categories=scheme_in.social_categories or ["All"],
        is_student=scheme_in.is_student,
        is_farmer=scheme_in.is_farmer,
        is_entrepreneur=scheme_in.is_entrepreneur,
        is_disabled=scheme_in.is_disabled
    )
    db.add(eligibility)

    # Add default benefits if given
    if scheme_in.benefits_list:
        for b in scheme_in.benefits_list:
            benefit = SchemeBenefit(
                scheme_id=scheme.id,
                benefit_type=b.get("benefit_type", "Financial"),
                title=b.get("title", "Government Benefit"),
                description=b.get("description", ""),
                amount_details=b.get("amount_details", None)
            )
            db.add(benefit)

    # Add default documents if given
    if scheme_in.documents_list:
        for doc in scheme_in.documents_list:
            document = SchemeDocument(
                scheme_id=scheme.id,
                document_name=doc,
                is_mandatory=True
            )
            db.add(document)

    db.commit()
    db.refresh(scheme)
    return scheme

@router.delete("/{scheme_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scheme(
    scheme_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    db.delete(scheme)
    db.commit()
    return None
