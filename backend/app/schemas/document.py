from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from backend.app.schemas.ner import NEREntity
from backend.app.schemas.common import MEDICAL_DISCLAIMER


class DocumentAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    document_id: str
    raw_text: str
    cleaned_text: Optional[str] = None
    summary: Optional[str] = None
    important_findings: List[str] = []
    detected_conditions: List[str] = []
    detected_medications: List[str] = []
    clinical_recommendations: Optional[str] = None
    entities: List[NEREntity] = []
    processed_at: datetime


class MedicalDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    status: str
    error_message: Optional[str] = None
    analysis: Optional[DocumentAnalysisResponse] = None
    created_at: datetime
    updated_at: datetime


class DocumentUploadResponse(BaseModel):
    document: MedicalDocumentResponse
    message: str = "Document uploaded and processed successfully"
    disclaimer: str = MEDICAL_DISCLAIMER
