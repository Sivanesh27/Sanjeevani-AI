from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.models.base import BaseModel


class AuditLog(BaseModel):
    __tablename__ = "audit_logs"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # LOGIN, LOGOUT, NER_ANALYZE, DOCUMENT_UPLOAD, etc.
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    status = Column(String(20), default="SUCCESS", nullable=False)  # SUCCESS, FAILED, WARNING
    details = Column(Text, nullable=True)  # JSON-encoded sanitized details

    # Relationships
    user = relationship("User", back_populates="audit_logs")


class AnalysisHistory(BaseModel):
    __tablename__ = "analysis_history"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False)  # NER, REPORT_ANALYSIS, PROFILE_UPDATE, CHAT
    description = Column(String(255), nullable=False)
    entity_count = Column(Integer, default=0, nullable=False)
    reference_id = Column(String(36), nullable=True)  # document_id or conversation_id

    # Relationships
    user = relationship("User", back_populates="history")


class SystemEvent(BaseModel):
    __tablename__ = "system_events"

    event_type = Column(String(100), nullable=False, index=True)
    severity = Column(String(20), default="INFO", nullable=False)  # INFO, WARNING, ERROR, CRITICAL
    message = Column(String(500), nullable=False)
    details = Column(Text, nullable=True)
