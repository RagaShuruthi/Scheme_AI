import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.seed_data import seed_database
from app.scraper.sources import is_trusted_official_domain

# Test SQLite in-memory or file database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_schemesaarthi.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_schemes_list():
    response = client.get("/api/schemes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 15
    assert any("Tamil Nadu" in s["name"] or s.get("state") == "Tamil Nadu" for s in data)

def test_get_categories():
    response = client.get("/api/schemes/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 10
    names = [c["name"] for c in data]
    assert "Scholarships" in names
    assert "Agriculture" in names

def test_user_login():
    res = client.post("/api/auth/login", json={
        "email": "citizen@schemesaarthi.gov.in",
        "password": "Citizen@123456"
    })
    assert res.status_code == 200
    json_data = res.json()
    assert "access_token" in json_data
    assert json_data["user"]["role"] == "user"

def test_admin_login():
    res = client.post("/api/auth/login", json={
        "email": "admin@schemesaarthi.gov.in",
        "password": "Admin@123456"
    })
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["user"]["role"] == "admin"
    return json_data["access_token"]

def test_natural_language_search():
    query = "I am a 20 year old engineering student from Tamil Nadu and my family income is ₹2 lakh. Show me scholarships."
    response = client.get(f"/api/search?q={query}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    top_scheme = data[0]
    assert top_scheme["match_percentage"] is not None
    assert top_scheme["match_percentage"] >= 70

def test_eligibility_matching():
    payload = {
        "age": 20,
        "gender": "Female",
        "state": "Tamil Nadu",
        "student_status": True,
        "education_level": "Undergraduate",
        "annual_income": 150000,
        "social_category": "SC",
        "is_farmer": False,
        "is_entrepreneur": False
    }
    response = client.post("/api/eligibility/check", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "results" in res
    assert len(res["results"]) > 0
    first = res["results"][0]
    assert "why_qualify" in first
    assert len(first["why_qualify"]) > 0
    assert "Important: You may be eligible" in res["disclaimer"]

def test_domain_allowlist_validation():
    assert is_trusted_official_domain("https://scholarships.gov.in/portal") is True
    assert is_trusted_official_domain("https://tn.gov.in/schemes") is True
    assert is_trusted_official_domain("https://fakeblogsite.com/schemes") is False

def test_admin_pending_updates_workflow():
    admin_token = test_admin_login()
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Check pending updates
    res = client.get("/api/admin/pending-updates", headers=headers)
    assert res.status_code == 200
    pending_list = res.json()
    assert len(pending_list) > 0
    
    update_id = pending_list[0]["id"]
    
    # Approve update
    appr_res = client.post(f"/api/admin/updates/{update_id}/approve", headers=headers)
    assert appr_res.status_code == 200
    assert "approved" in appr_res.json()["message"].lower()

def test_voice_samples_and_status():
    status_res = client.get("/api/voice/status")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "ready"

    samples_res = client.get("/api/voice/samples")
    assert samples_res.status_code == 200
    samples = samples_res.json()
    assert "en" in samples and len(samples["en"]) > 0
    assert "ta" in samples and len(samples["ta"]) > 0

def test_voice_assistant_english():
    payload = {
        "query": "I am a 20 year old engineering student from Tamil Nadu. Show me scholarships.",
        "language": "en"
    }
    res = client.post("/api/voice/assistant", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "spoken_response" in data
    assert "display_response" in data
    assert len(data["matched_schemes"]) > 0
    assert len(data["suggested_followups"]) > 0
    assert data["language"] == "en"

def test_voice_assistant_tamil():
    payload = {
        "query": "நான் கல்லூரியில் படிக்கும் மாணவர், எனக்கு கல்வி உதவித்தொகை திட்டங்கள் உள்ளதா?",
        "language": "ta"
    }
    res = client.post("/api/voice/assistant", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "spoken_response" in data
    assert "display_response" in data
    assert len(data["matched_schemes"]) > 0
    assert data["language"] == "ta"

def test_voice_assistant_greeting():
    payload = {
        "query": "Hello",
        "language": "en"
    }
    res = client.post("/api/voice/assistant", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "SchemeSaarthi Voice AI" in data["spoken_response"]

