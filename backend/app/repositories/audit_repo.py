from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from backend.app.models.audit import AuditLog, AnalysisHistory, SystemEvent
from backend.app.models.user import User
from backend.app.models.document import MedicalDocument
from backend.app.models.conversation import AIConversation
from backend.app.repositories.base import BaseRepository


class AuditRepository(BaseRepository[AuditLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(AuditLog, db)

    async def log_event(
        self,
        action: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        status: str = "SUCCESS",
        details: Optional[str] = None,
    ) -> AuditLog:
        audit = AuditLog(
            user_id=user_id,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent[:255] if user_agent else None,
            status=status,
            details=details,
        )
        self.db.add(audit)
        await self.db.commit()
        await self.db.refresh(audit)
        return audit

    async def add_history(
        self,
        user_id: str,
        action_type: str,
        description: str,
        entity_count: int = 0,
        reference_id: Optional[str] = None,
    ) -> AnalysisHistory:
        history = AnalysisHistory(
            user_id=user_id,
            action_type=action_type,
            description=description,
            entity_count=entity_count,
            reference_id=reference_id,
        )
        self.db.add(history)
        await self.db.commit()
        await self.db.refresh(history)
        return history

    async def get_user_history(self, user_id: str, limit: int = 50) -> List[AnalysisHistory]:
        result = await self.db.execute(
            select(AnalysisHistory)
            .where(AnalysisHistory.user_id == user_id)
            .order_by(desc(AnalysisHistory.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_admin_audit_logs(self, limit: int = 100) -> List[AuditLog]:
        result = await self.db.execute(
            select(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit)
        )
        return list(result.scalars().all())

    async def get_system_statistics(self) -> Dict[str, int]:
        total_users = (await self.db.execute(select(func.count(User.id)))).scalar_one() or 0
        active_users = (await self.db.execute(select(func.count(User.id)).where(User.is_active == True))).scalar_one() or 0
        total_docs = (await self.db.execute(select(func.count(MedicalDocument.id)))).scalar_one() or 0
        total_chats = (await self.db.execute(select(func.count(AIConversation.id)))).scalar_one() or 0
        total_ner = (await self.db.execute(select(func.count(AnalysisHistory.id)).where(AnalysisHistory.action_type == "NER"))).scalar_one() or 0

        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_documents_processed": total_docs,
            "total_chat_queries": total_chats,
            "total_ner_requests": total_ner,
        }
