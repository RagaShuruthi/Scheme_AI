import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from apscheduler.schedulers.background import BackgroundScheduler
    scheduler = BackgroundScheduler()
    HAS_APSCHEDULER = True
except ImportError:
    scheduler = None
    HAS_APSCHEDULER = False

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api import api_router
from app.seed_data import seed_database
from app.scraper.engine import ScraperEngine
from app.models.models import GovernmentSource

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SchemeSaarthi")

def scheduled_scraper_job():
    logger.info("Executing scheduled government source update verification...")
    db = SessionLocal()
    try:
        engine_service = ScraperEngine(db)
        sources = db.query(GovernmentSource).filter(GovernmentSource.is_active == True).all()
        for s in sources:
            engine_service.run_source_check(s.id)
    except Exception as e:
        logger.error(f"Scheduled scraping error: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure DB schema & seed realistic data
    logger.info("Initializing SchemeSaarthi database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_database(db)
        logger.info("SchemeSaarthi seed data initialized successfully.")
    except Exception as e:
        logger.error(f"Error during seeding: {e}")
    finally:
        db.close()

    # Start background scheduler if available
    if HAS_APSCHEDULER and scheduler:
        try:
            scheduler.add_job(
                scheduled_scraper_job,
                "interval",
                minutes=settings.SCRAPER_INTERVAL_MINUTES,
                id="gov_source_monitor"
            )
            scheduler.start()
            logger.info("APScheduler background monitoring engine started.")
        except Exception as e:
            logger.warning(f"Could not start background scheduler: {e}")
    else:
        logger.info("APScheduler not installed; skipping periodic background scraper.")

    yield

    # Shutdown
    if HAS_APSCHEDULER and scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered Government Scheme Discovery and Update Platform for Indian Citizens",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SchemeSaarthi API",
        "version": "1.0.0"
    }
