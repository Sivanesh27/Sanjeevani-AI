from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.models.user import User
from backend.app.models.profile import PatientProfile
from backend.app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).options(selectinload(User.profile)).where(User.email == email.lower())
        )
        return result.scalars().first()

    async def get_with_profile(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).options(selectinload(User.profile)).where(User.id == user_id)
        )
        return result.scalars().first()

    async def get_profile_by_user_id(self, user_id: str) -> Optional[PatientProfile]:
        result = await self.db.execute(
            select(PatientProfile).where(PatientProfile.user_id == user_id)
        )
        return result.scalars().first()

    async def save_profile(self, profile: PatientProfile) -> PatientProfile:
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile
