from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import SchemeListOut, SemanticSearchRequest
from app.services.search_service import SearchEngine

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("", response_model=List[SchemeListOut])
def natural_search(
    q: str = Query("", description="Natural language search query"),
    category_id: Optional[int] = Query(None),
    government_level: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    engine = SearchEngine(db)
    return engine.search(
        query=q,
        category_id=category_id,
        government_level=government_level,
        state=state
    )

@router.post("/semantic", response_model=List[SchemeListOut])
def semantic_search(
    req: SemanticSearchRequest,
    db: Session = Depends(get_db)
):
    engine = SearchEngine(db)
    return engine.search(
        query=req.query,
        category_id=req.category_id,
        government_level=req.government_level,
        state=req.state
    )
