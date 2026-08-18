from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from backend.app.models.base import BaseModel
from backend.app.core.security import UserRole


class User(BaseModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.PATIENT.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Relationships
    profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    documents = relationship("MedicalDocument", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    conversations = relationship("AIConversation", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    audit_logs = relationship("AuditLog", back_populates="user", lazy="selectin")
    history = relationship("AnalysisHistory", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
