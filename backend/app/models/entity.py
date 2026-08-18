from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.models.base import BaseModel


class MedicalEntity(BaseModel):
    __tablename__ = "medical_entities"

    analysis_id = Column(String(36), ForeignKey("document_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    text = Column(String(255), nullable=False)
    label = Column(String(50), nullable=False)  # CHEMICAL, DISEASE, MEDICINE, etc.
    start_offset = Column(Integer, nullable=False)
    end_offset = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=True)
    model_name = Column(String(100), default="tner/roberta-large-bc5cdr", nullable=False)

    # Relationships
    analysis = relationship("DocumentAnalysis", back_populates="entities")
