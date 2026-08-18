from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.models.base import BaseModel


class PatientProfile(BaseModel):
    __tablename__ = "patient_profiles"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    known_allergies = Column(Text, nullable=True)  # JSON or comma-separated string
    chronic_conditions = Column(Text, nullable=True)  # JSON or comma-separated string
    current_medications = Column(Text, nullable=True)  # JSON or comma-separated string
    emergency_contact = Column(String(255), nullable=True)

    # Relationships
    user = relationship("User", back_populates="profile")
