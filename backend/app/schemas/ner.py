from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.common import MEDICAL_DISCLAIMER


class NERRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Clinical or biomedical text to analyze")


class NEREntity(BaseModel):
    text: str
    label: str  # CHEMICAL, DISEASE
    start: int
    end: int
    confidence: Optional[float] = None
    model: str = "tner/roberta-large-bc5cdr"


class ModelInfo(BaseModel):
    name: str = "tner/roberta-large-bc5cdr"
    version: str = "local"
    provider: str = "Local PyTorch / Transformers"
    device: str = "cuda:0"
    status: str = "Loaded"


class NERResponse(BaseModel):
    request_id: str
    model: ModelInfo
    entities: List[NEREntity]
    entity_count: int
    processing_time_ms: float
    text_length: int
    disclaimer: str = MEDICAL_DISCLAIMER
