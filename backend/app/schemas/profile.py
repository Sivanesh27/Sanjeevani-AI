from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class PatientProfileBase(BaseModel):
    age: Optional[int] = Field(None, ge=0, le=130)
    gender: Optional[str] = Field(None, max_length=20)
    blood_group: Optional[str] = Field(None, max_length=10)
    height_cm: Optional[float] = Field(None, ge=20, le=300)
    weight_kg: Optional[float] = Field(None, ge=1, le=500)
    known_allergies: Optional[List[str]] = Field(default_factory=list)
    chronic_conditions: Optional[List[str]] = Field(default_factory=list)
    current_medications: Optional[List[str]] = Field(default_factory=list)
    emergency_contact: Optional[str] = Field(None, max_length=255)


class PatientProfileCreate(PatientProfileBase):
    pass


class PatientProfileUpdate(PatientProfileBase):
    pass


class PatientProfileResponse(PatientProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
