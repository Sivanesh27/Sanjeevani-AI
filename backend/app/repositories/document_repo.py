from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from backend.app.models.document import MedicalDocument, DocumentAnalysis
from backend.app.models.entity import MedicalEntity
from backend.app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[MedicalDocument]):
    def __init__(self, db: AsyncSession):
        super().__init__(MedicalDocument, db)

    async def get_user_documents(self, user_id: str) -> List[MedicalDocument]:
        result = await self.db.execute(
            select(MedicalDocument)
            .options(
                selectinload(MedicalDocument.analysis).selectinload(DocumentAnalysis.entities)
            )
            .where(MedicalDocument.user_id == user_id)
            .order_by(desc(MedicalDocument.created_at))
        )
        return list(result.scalars().all())

    async def get_document_details(self, document_id: str, user_id: Optional[str] = None) -> Optional[MedicalDocument]:
        query = (
            select(MedicalDocument)
            .options(
                selectinload(MedicalDocument.analysis).selectinload(DocumentAnalysis.entities)
            )
            .where(MedicalDocument.id == document_id)
        )
        if user_id:
            query = query.where(MedicalDocument.user_id == user_id)

        result = await self.db.execute(query)
        return result.scalars().first()

    async def save_analysis(self, analysis: DocumentAnalysis) -> DocumentAnalysis:
        self.db.add(analysis)
        await self.db.commit()
        await self.db.refresh(analysis)
        return analysis

    async def save_entities(self, entities: List[MedicalEntity]) -> List[MedicalEntity]:
        self.db.add_all(entities)
        await self.db.commit()
        return entities
