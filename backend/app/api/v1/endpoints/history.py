from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.schemas.admin import AnalysisHistoryResponse
from backend.app.schemas.common import BaseResponse
from backend.app.repositories.audit_repo import AuditRepository
from backend.app.api.deps import get_current_user
from backend.app.models.user import User

router = APIRouter()


@router.get("", response_model=BaseResponse[List[AnalysisHistoryResponse]])
async def get_user_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve chronological medical and activity history for the current user."""
    audit_repo = AuditRepository(db)
    records = await audit_repo.get_user_history(current_user.id, limit=limit)
    response_list = [
        AnalysisHistoryResponse.model_validate(r) for r in records
    ]
    return BaseResponse(success=True, data=response_list)
