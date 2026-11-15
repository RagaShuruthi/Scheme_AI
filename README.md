# SchemeSaarthi (திட்டம்சாரதி)
### AI-Powered Government Scheme Discovery and Update Platform for Indian Citizens

**SchemeSaarthi** is a full-stack web application designed to help Indian citizens discover relevant Central and State Government welfare schemes (with deep coverage of Tamil Nadu state initiatives), understand eligibility rules, search using natural language, and receive verified updates monitored directly from official government portals.

---

## 🏛️ Key Capabilities

1. **Official Sources Only**:
   - Ingests data exclusively from authentic portals: `myScheme`, `India.gov.in`, `scholarships.gov.in`, `pmkisan.gov.in`, `cmchistn.com`, and official Tamil Nadu department portals.
   - Strict government domain allowlist (`*.gov.in`, `*.nic.in`, `*.tn.gov.in`).
2. **Intent-Aware Smart Search**:
   - Understands natural language statements like:  
     *"I am a 20 year old engineering student from Tamil Nadu and my family income is ₹2 lakh. Show me scholarships."*  
     *"I am a farmer and need financial assistance."*
   - Displays match percentage, satisfied criteria badges (`✓ Student`, `✓ Tamil Nadu`, `✓ Income requirement satisfied`).
3. **AI Eligibility Finder**:
   - 3-step questionnaire (Age, Gender, State, District, Education, Family Income, Social Category, Farmer, PwD, Entrepreneur status).
   - Generates score-ranked results with **"Why you may qualify"** and **"Requirements you may not satisfy"**.
   - Mandatory disclaimer: *"You may be eligible — final verification is determined exclusively by the official sanctioning government authority."*
4. **Automated Scheme Update & Scraper Engine**:
   - Background scheduler checks official portals for deadline extensions and policy modifications.
   - Changes detected enter **"Pending Verification"** status.
   - **Admin Verification Control**: Scraped changes are never published automatically. Administrators review, approve, or reject changes. Approved updates advance the scheme version and notify subscribed citizens.
5. **Bilingual Localization**:
   - Full English and Tamil (`/locales/en.json`, `/locales/ta.json`) language toggle.
6. **Role-Based Authentication**:
   - JWT-based auth for citizens (profile, saved schemes, notification preferences) and administrators (update verification, source management, scraper logs, analytics).

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router 7, Axios, Lucide React.
- **Backend**: Python 3.11+, FastAPI, Pydantic, SQLAlchemy 2.0, APScheduler, python-jose (JWT), Passlib (bcrypt).
- **Database**: PostgreSQL (production) with automatic SQLite fallback for zero-friction local development.
- **AI Layer**: Modular AI interface supporting **Google Gemini API**, **Ollama**, and a deterministic high-precision rule-based NLP parser.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **National Admin** | `admin@schemesaarthi.gov.in` | `Admin@123456` |
| **Citizen User** | `citizen@schemesaarthi.gov.in` | `Citizen@123456` |

*(Quick autofill buttons are available on the Sign In page for instant testing)*

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest tests/test_api.py -v

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- The database is automatically created and seeded with 16 realistic Central and Tamil Nadu government schemes on startup.

### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Run dev server
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🐳 Docker Deployment

To launch PostgreSQL, FastAPI Backend, and Nginx Frontend in containers:

```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 📁 Repository Structure

```
scheme-saarthi/
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Footer, SchemeCard, NotificationDropdown
│   │   ├── pages/            # Home, Search, BrowseSchemes, SchemeDetail, FindForMe, Updates, Admin
│   │   ├── contexts/         # AuthContext, LanguageContext
│   │   ├── services/         # Axios API Client
│   │   └── locales/          # en.json, ta.json
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/              # Auth, Schemes, Search, Eligibility, Updates, User, Admin
│   │   ├── models/           # SQLAlchemy DB Models (15+ tables)
│   │   ├── schemas/          # Pydantic Schemas
│   │   ├── auth/             # JWT & Dependencies
│   │   ├── ai/               # Modular AI Layer (Gemini, Ollama, Rule-based)
│   │   ├── scraper/          # Scraper Engine, Change Detector, Domain Allowlist
│   │   ├── services/         # Search Engine, Eligibility Engine, Notifications
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── seed_data.py      # 16 authentic Central & TN schemes
│   │   └── main.py
│   ├── tests/                # Pytest Test Suite
│   └── requirements.txt
│
├── docker-compose.yml
├── .env.example
└── README.md
```
