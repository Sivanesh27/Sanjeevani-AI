from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from backend.app.schemas.common import MEDICAL_DISCLAIMER


class AIStructuredOutput(BaseModel):
    summary: str
    possible_considerations: List[str] = []
    relevant_medical_info: List[str] = []
    questions_for_doctor: List[str] = []
    safety_warning: str = MEDICAL_DISCLAIMER
    is_emergency: bool = False
    emergency_instructions: Optional[str] = None


class ChatMessageCreate(BaseModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=5000)


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    structured_data: Optional[AIStructuredOutput] = None
    model_provider: Optional[str] = None
    created_at: datetime


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    messages: List[ChatMessageResponse] = []
    created_at: datetime
    updated_at: datetime


class ChatCompletionResponse(BaseModel):
    conversation_id: str
    message: ChatMessageResponse
    disclaimer: str = MEDICAL_DISCLAIMER
