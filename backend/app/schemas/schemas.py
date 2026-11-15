import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth & User Schemas -----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None


# ----------------- Category & Department -----------------
class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = "Award"
    schemes_count: Optional[int] = 0

    class Config:
        from_attributes = True

class DepartmentOut(BaseModel):
    id: int
    name: str
    government_level: str
    state: Optional[str] = None
    website_url: Optional[str] = None

    class Config:
        from_attributes = True


# ----------------- Sub-models for Scheme -----------------
class SchemeBenefitOut(BaseModel):
    id: int
    benefit_type: str
    title: str
    description: str
    amount_details: Optional[str] = None

    class Config:
        from_attributes = True

class SchemeDocumentOut(BaseModel):
    id: int
    document_name: str
    is_mandatory: bool
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class EligibilityRuleOut(BaseModel):
    id: int
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    gender: Optional[str] = "All"
    max_income: Optional[float] = None
    applicable_states: Optional[List[str]] = None
    social_categories: Optional[List[str]] = None
    is_student: Optional[bool] = None
    education_levels: Optional[List[str]] = None
    is_farmer: Optional[bool] = None
    is_entrepreneur: Optional[bool] = None
    is_disabled: Optional[bool] = None
    employment_status: Optional[str] = None
    land_ownership_required: Optional[bool] = False
    residence_requirement: Optional[str] = None
    criteria_summary: Optional[str] = None

    class Config:
        from_attributes = True

class SchemeUpdateOut(BaseModel):
    id: int
    scheme_id: int
    scheme_name: Optional[str] = None
    update_type: str
    title: str
    change_summary: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    verification_status: str
    detected_at: datetime.datetime
    verified_at: Optional[datetime.datetime] = None
    source_url: str

    class Config:
        from_attributes = True

class SchemeVersionOut(BaseModel):
    id: int
    version_number: int
    snapshot_json: Dict[str, Any]
    change_reason: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ----------------- Scheme Schemas -----------------
class SchemeListOut(BaseModel):
    id: int
    name: str
    slug: str
    short_description: str
    government_level: str
    state: Optional[str] = None
    category_id: int
    category_name: Optional[str] = None
    department_name: Optional[str] = None
    application_status: str
    application_deadline: Optional[str] = None
    official_application_url: str
    official_source_url: str
    source_name: str
    last_verified_at: datetime.datetime
    views_count: int
    benefits_summary: Optional[str] = None
    match_percentage: Optional[int] = None
    qualifying_reasons: Optional[List[str]] = None

    class Config:
        from_attributes = True

class SchemeDetailOut(BaseModel):
    id: int
    name: str
    slug: str
    short_description: str
    full_description: str
    government_level: str
    state: Optional[str] = None
    department: Optional[DepartmentOut] = None
    category: Optional[CategoryOut] = None
    application_status: str
    application_start_date: Optional[str] = None
    application_deadline: Optional[str] = None
    application_process: Optional[str] = None
    official_application_url: str
    official_source_url: str
    source_name: str
    last_verified_at: datetime.datetime
    version: int
    views_count: int
    is_active: bool
    eligibility_rule: Optional[EligibilityRuleOut] = None
    benefits: List[SchemeBenefitOut] = []
    documents: List[SchemeDocumentOut] = []
    updates: List[SchemeUpdateOut] = []
    versions: List[SchemeVersionOut] = []

    class Config:
        from_attributes = True

class SchemeCreate(BaseModel):
    name: str
    short_description: str
    full_description: str
    government_level: str
    state: Optional[str] = None
    category_id: int
    department_id: Optional[int] = None
    application_status: str = "Open"
    application_start_date: Optional[str] = None
    application_deadline: Optional[str] = None
    application_process: Optional[str] = None
    official_application_url: str
    official_source_url: str
    source_name: str = "Official Government Website"
    
    # Nested fields for initial setup
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    gender: Optional[str] = "All"
    max_income: Optional[float] = None
    applicable_states: Optional[List[str]] = None
    social_categories: Optional[List[str]] = None
    is_student: Optional[bool] = None
    is_farmer: Optional[bool] = None
    is_entrepreneur: Optional[bool] = None
    is_disabled: Optional[bool] = None
    benefits_list: Optional[List[Dict[str, str]]] = None
    documents_list: Optional[List[str]] = None


# ----------------- Eligibility Finder & Search -----------------
class EligibilityCheckRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = "All"
    state: Optional[str] = "Tamil Nadu"
    district: Optional[str] = None
    occupation: Optional[str] = None
    student_status: Optional[bool] = False
    education_level: Optional[str] = None
    annual_income: Optional[float] = None
    social_category: Optional[str] = "General"  # General, OBC, SC, ST, MBC, BC, EWS
    disability_status: Optional[bool] = False
    employment_status: Optional[str] = "Any"
    is_farmer: Optional[bool] = False
    is_entrepreneur: Optional[bool] = False
    owns_land: Optional[bool] = False
    other_info: Optional[str] = None

class EligibilitySchemeMatch(BaseModel):
    scheme: SchemeListOut
    match_percentage: int
    why_qualify: List[str]
    why_not_qualify: List[str]

class EligibilityCheckResponse(BaseModel):
    results: List[EligibilitySchemeMatch]
    total_matched: int
    disclaimer: str = "Important: You may be eligible based on preliminary criteria. Final eligibility verification and sanctioning is determined exclusively by the official sanctioning authority at the government portal."

class SemanticSearchRequest(BaseModel):
    query: str
    category_id: Optional[int] = None
    government_level: Optional[str] = None
    state: Optional[str] = None


# ----------------- Government Sources & Logs -----------------
class GovernmentSourceCreate(BaseModel):
    name: str
    government_level: str
    state: Optional[str] = None
    department: Optional[str] = None
    url: str
    source_type: str = "portal"
    scraping_frequency_hours: int = 24

class GovernmentSourceOut(BaseModel):
    id: int
    name: str
    government_level: str
    state: Optional[str] = None
    department: Optional[str] = None
    url: str
    source_type: str
    is_active: bool
    scraping_frequency_hours: int
    last_checked_at: Optional[datetime.datetime] = None
    last_status: Optional[str] = "Pending"

    class Config:
        from_attributes = True

class ScrapeLogOut(BaseModel):
    id: int
    source_id: Optional[int] = None
    source_name: Optional[str] = None
    status: str
    message: str
    details: Optional[Any] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ----------------- User Preferences, Saved & Notifications -----------------
class SavedSchemeOut(BaseModel):
    id: int
    scheme_id: int
    scheme: SchemeListOut
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class UserPreferenceUpdate(BaseModel):
    preferred_categories: Optional[List[int]] = []
    preferred_states: Optional[List[str]] = []
    notify_updates: Optional[bool] = True

class UserPreferenceOut(BaseModel):
    preferred_categories: List[int] = []
    preferred_states: List[str] = []
    notify_updates: bool = True

    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    scheme_id: Optional[int] = None
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ----------------- Admin Dashboard -----------------
class DashboardStatsOut(BaseModel):
    total_schemes: int
    active_schemes: int
    recently_updated_schemes: int
    pending_verification_updates: int
    failed_source_fetches: int
    total_users: int
    popular_categories: List[Dict[str, Any]]
    most_viewed_schemes: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]


# ----------------- Voice AI Agent Schemas -----------------
class VoiceChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str

class VoiceAgentRequest(BaseModel):
    query: str
    language: Optional[str] = "en"  # "en" | "ta"
    conversation_history: Optional[List[VoiceChatMessage]] = []
    user_context: Optional[Dict[str, Any]] = None

class VoiceAgentResponse(BaseModel):
    spoken_response: str
    display_response: str
    language: str
    matched_schemes: List[SchemeListOut] = []
    extracted_criteria: Dict[str, Any] = {}
    suggested_followups: List[str] = []
    confidence: float = 0.95

