from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import EligibilityCheckRequest, EligibilityCheckResponse
from app.services.eligibility_service import EligibilityEngine

router = APIRouter(prefix="/eligibility", tags=["Eligibility"])

@router.post("/check", response_model=EligibilityCheckResponse)
def check_eligibility(
    req: EligibilityCheckRequest,
    db: Session = Depends(get_db)
):
    engine = EligibilityEngine(db)
    matched_results = engine.check_eligibility(req)
    
    return EligibilityCheckResponse(
        results=matched_results,
        total_matched=len(matched_results),
        disclaimer="Important: You may be eligible based on preliminary automated evaluation. Final approval and verification is solely conducted by the authorized government nodal officer via the official application portal."
    )
