from typing import Generic, TypeVar, Optional, Any, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

T = TypeVar("T")

MEDICAL_DISCLAIMER = (
    "SanjeevaniAI provides AI-assisted healthcare information and decision-support insights. "
    "It is not a substitute for professional medical diagnosis, treatment, or emergency care."
)


class BaseResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)

    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None
    disclaimer: str = MEDICAL_DISCLAIMER


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
    request_id: Optional[str] = None
    disclaimer: str = MEDICAL_DISCLAIMER


class HealthCheck(BaseModel):
    status: str = "healthy"
    version: str
    environment: str
    timestamp: datetime
    services: dict
