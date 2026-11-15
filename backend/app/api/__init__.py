from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.schemes import router as schemes_router
from app.api.search import router as search_router
from app.api.eligibility import router as eligibility_router
from app.api.updates import router as updates_router
from app.api.user import router as user_router
from app.api.admin import router as admin_router
from app.api.voice import router as voice_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(schemes_router)
api_router.include_router(search_router)
api_router.include_router(eligibility_router)
api_router.include_router(updates_router)
api_router.include_router(user_router)
api_router.include_router(admin_router)
api_router.include_router(voice_router)

