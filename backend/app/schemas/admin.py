from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    action: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str
    details: Optional[str] = None
    created_at: datetime


class AnalysisHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    action_type: str
    description: str
    entity_count: int
    reference_id: Optional[str] = None
    created_at: datetime


class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_documents_processed: int
    total_ner_requests: int
    total_chat_queries: int
    model_status: Dict[str, Any]
    system_health: str
