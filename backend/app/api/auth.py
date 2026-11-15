from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, UserPreference
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token
from app.auth.jwt import verify_password, get_password_hash, create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    # Check if this is the first user; if so, make them admin for convenience
    user_count = db.query(User).count()
    role = "admin" if user_count == 0 else "user"

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default user preference
    pref = UserPreference(user_id=user.id, preferred_categories=[], preferred_states=["Tamil Nadu"])
    db.add(pref)
    db.commit()

    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_current_profile(current_user: User = Depends(get_current_user)):
    return current_user
