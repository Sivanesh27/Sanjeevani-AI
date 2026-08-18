from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from backend.app.models.conversation import AIConversation, AIMessage
from backend.app.repositories.base import BaseRepository


class ChatRepository(BaseRepository[AIConversation]):
    def __init__(self, db: AsyncSession):
        super().__init__(AIConversation, db)

    async def get_user_conversations(self, user_id: str) -> List[AIConversation]:
        result = await self.db.execute(
            select(AIConversation)
            .options(selectinload(AIConversation.messages))
            .where(AIConversation.user_id == user_id)
            .order_by(desc(AIConversation.updated_at))
        )
        return list(result.scalars().all())

    async def get_conversation_with_messages(self, conversation_id: str, user_id: str) -> Optional[AIConversation]:
        result = await self.db.execute(
            select(AIConversation)
            .options(selectinload(AIConversation.messages))
            .where(AIConversation.id == conversation_id, AIConversation.user_id == user_id)
        )
        return result.scalars().first()

    async def add_message(self, message: AIMessage) -> AIMessage:
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message
