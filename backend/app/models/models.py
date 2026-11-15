import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # "user" or "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    saved_schemes = relationship("SavedScheme", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="Award")

    schemes = relationship("Scheme", back_populates="category")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    government_level = Column(String(50), nullable=False)  # "Central" or "State"
    state = Column(String(100), nullable=True)  # e.g., "Tamil Nadu" or None for Central
    website_url = Column(String(500), nullable=True)

    schemes = relationship("Scheme", back_populates="department")


class GovernmentSource(Base):
    __tablename__ = "government_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    government_level = Column(String(50), nullable=False)  # "Central" or "State"
    state = Column(String(100), nullable=True)
    department = Column(String(255), nullable=True)
    url = Column(String(500), nullable=False)
    source_type = Column(String(50), default="portal")  # "portal", "department_site", "api"
    is_active = Column(Boolean, default=True)
    scraping_frequency_hours = Column(Integer, default=24)
    last_checked_at = Column(DateTime, nullable=True)
    last_status = Column(String(50), default="Pending")

    scrape_logs = relationship("ScrapeLog", back_populates="source", cascade="all, delete-orphan")


class ScrapeLog(Base):
    __tablename__ = "scrape_logs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("government_sources.id"), nullable=True)
    status = Column(String(50), nullable=False)  # "Success", "Failed", "Changes Detected"
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    source = relationship("GovernmentSource", back_populates="scrape_logs")


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    short_description = Column(Text, nullable=False)
    full_description = Column(Text, nullable=False)
    government_level = Column(String(50), index=True, nullable=False)  # "Central" or "State"
    state = Column(String(100), index=True, nullable=True)  # "Tamil Nadu", or "All India"
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), index=True, nullable=False)
    
    application_status = Column(String(50), default="Open", index=True)  # "Open", "Upcoming", "Closed"
    application_start_date = Column(String(50), nullable=True)
    application_deadline = Column(String(50), nullable=True)
    application_process = Column(Text, nullable=True)  # Step by step process
    
    official_application_url = Column(String(500), nullable=False)
    official_source_url = Column(String(500), nullable=False)
    source_name = Column(String(255), default="Official Government Portal", nullable=False)
    last_verified_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True, index=True)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    category = relationship("Category", back_populates="schemes")
    department = relationship("Department", back_populates="schemes")
    eligibility_rule = relationship("EligibilityRule", back_populates="scheme", uselist=False, cascade="all, delete-orphan")
    benefits = relationship("SchemeBenefit", back_populates="scheme", cascade="all, delete-orphan")
    documents = relationship("SchemeDocument", back_populates="scheme", cascade="all, delete-orphan")
    updates = relationship("SchemeUpdate", back_populates="scheme", cascade="all, delete-orphan")
    versions = relationship("SchemeVersion", back_populates="scheme", cascade="all, delete-orphan")
    saved_by = relationship("SavedScheme", back_populates="scheme", cascade="all, delete-orphan")


class EligibilityRule(Base):
    __tablename__ = "eligibility_rules"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), unique=True, nullable=False)
    
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    gender = Column(String(50), default="All")  # "All", "Male", "Female", "Transgender"
    max_income = Column(Float, nullable=True)  # Max annual family income in INR
    applicable_states = Column(JSON, nullable=True)  # e.g., ["Tamil Nadu"] or ["All India"]
    social_categories = Column(JSON, nullable=True)  # e.g., ["General", "OBC", "SC", "ST", "MBC", "BC"]
    
    is_student = Column(Boolean, nullable=True)
    education_levels = Column(JSON, nullable=True)  # ["School", "Undergraduate", "Postgraduate", "Diploma", "Engineering"]
    is_farmer = Column(Boolean, nullable=True)
    is_entrepreneur = Column(Boolean, nullable=True)
    is_disabled = Column(Boolean, nullable=True)
    employment_status = Column(String(50), nullable=True)  # "Unemployed", "Employed", "Self-Employed", "Student", "Any"
    land_ownership_required = Column(Boolean, default=False)
    residence_requirement = Column(String(255), nullable=True)
    criteria_summary = Column(Text, nullable=True)

    scheme = relationship("Scheme", back_populates="eligibility_rule")


class SchemeBenefit(Base):
    __tablename__ = "scheme_benefits"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    benefit_type = Column(String(50), nullable=False)  # "Financial", "Subsidy", "Educational", "Healthcare", "Housing"
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    amount_details = Column(String(255), nullable=True)

    scheme = relationship("Scheme", back_populates="benefits")


class SchemeDocument(Base):
    __tablename__ = "scheme_documents"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    document_name = Column(String(255), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    notes = Column(String(255), nullable=True)

    scheme = relationship("Scheme", back_populates="documents")


class SchemeUpdate(Base):
    __tablename__ = "scheme_updates"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    update_type = Column(String(100), nullable=False)  # "Application Deadline", "Eligibility Revision", "Benefit Enhancement", "Status Change"
    title = Column(String(255), nullable=False)
    change_summary = Column(Text, nullable=False)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    verification_status = Column(String(50), default="Pending", index=True)  # "Pending", "Approved", "Rejected"
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    source_url = Column(String(500), nullable=False)

    scheme = relationship("Scheme", back_populates="updates")


class SchemeVersion(Base):
    __tablename__ = "scheme_versions"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    snapshot_json = Column(JSON, nullable=False)
    change_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scheme = relationship("Scheme", back_populates="versions")


class SavedScheme(Base):
    __tablename__ = "saved_schemes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="saved_schemes")
    scheme = relationship("Scheme", back_populates="saved_by")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    preferred_categories = Column(JSON, default=list)  # list of category IDs
    preferred_states = Column(JSON, default=list)  # list of states
    notify_updates = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="preferences")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AdminAction(Base):
    __tablename__ = "admin_actions"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String(100), nullable=False)  # "Approve Update", "Reject Update", "Create Scheme", "Scrape Triggered"
    target_entity = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
