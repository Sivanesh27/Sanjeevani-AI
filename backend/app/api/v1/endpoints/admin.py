from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.schemas.admin import AdminStatsResponse, AuditLogResponse
from backend.app.schemas.common import BaseResponse
from backend.app.repositories.audit_repo import AuditRepository
from backend.app.ml.manager import model_manager
from backend.app.api.deps import get_current_admin
from backend.app.models.user import User

router = APIRouter()


@router.get("/stats", response_model=BaseResponse[AdminStatsResponse])
async def get_admin_stats(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve platform usage statistics, throughput metrics, and model status."""
    audit_repo = AuditRepository(db)
    stats = await audit_repo.get_system_statistics()
    model_status = model_manager.get_status()

    admin_stats = AdminStatsResponse(
        total_users=stats["total_users"],
        active_users=stats["active_users"],
        total_documents_processed=stats["total_documents_processed"],
        total_ner_requests=stats["total_ner_requests"],
        total_chat_queries=stats["total_chat_queries"],
        model_status=model_status,
        system_health="Operational",
    )
    return BaseResponse(success=True, data=admin_stats)


@router.get("/audit-logs", response_model=BaseResponse[List[AuditLogResponse]])
async def get_audit_logs(
    limit: int = 100,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve system security and access audit trail."""
    audit_repo = AuditRepository(db)
    logs = await audit_repo.get_admin_audit_logs(limit=limit)
    response_list = [AuditLogResponse.model_validate(log) for log in logs]
    return BaseResponse(success=True, data=response_list)
