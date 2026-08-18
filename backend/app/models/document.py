from sqlalchemy import Column, String, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from backend.app.models.base import BaseModel, utc_now


class MedicalDocument(BaseModel):
    __tablename__ = "medical_documents"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_hash = Column(String(64), nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, PROCESSING, COMPLETED, FAILED
    error_message = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="documents", lazy="selectin")
    analysis = relationship("DocumentAnalysis", back_populates="document", uselist=False, cascade="all, delete-orphan", lazy="selectin")


class DocumentAnalysis(BaseModel):
    __tablename__ = "document_analyses"

    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    raw_text = Column(Text, nullable=False)
    cleaned_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    important_findings = Column(Text, nullable=True)  # JSON-encoded array or text
    detected_conditions = Column(Text, nullable=True)  # JSON-encoded array
    detected_medications = Column(Text, nullable=True)  # JSON-encoded array
    clinical_recommendations = Column(Text, nullable=True)
    processed_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    document = relationship("MedicalDocument", back_populates="analysis", lazy="selectin")
    entities = relationship("MedicalEntity", back_populates="analysis", cascade="all, delete-orphan", lazy="selectin")
