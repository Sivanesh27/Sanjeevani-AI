from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.user import User
from backend.app.models.profile import PatientProfile
from backend.app.schemas.user import UserCreate, UserLogin, UserResponse
from backend.app.schemas.token import TokenResponse
from backend.app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    UserRole,
)
from backend.app.core.exceptions import AuthenticationError, ValidationError, ResourceNotFoundError
from backend.app.repositories.user_repo import UserRepository
from backend.app.repositories.audit_repo import AuditRepository
from backend.app.core.config import settings


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.audit_repo = AuditRepository(db)

    async def register(self, user_in: UserCreate, ip_address: Optional[str] = None) -> Tuple[User, TokenResponse]:
        existing = await self.user_repo.get_by_email(user_in.email)
        if existing:
            raise ValidationError(message="A user with this email already exists.")

        hashed_pwd = get_password_hash(user_in.password)
        user = User(
            email=user_in.email.lower(),
            hashed_password=hashed_pwd,
            full_name=user_in.full_name,
            role=user_in.role.value if isinstance(user_in.role, UserRole) else str(user_in.role),
            is_active=True,
            is_verified=True,
        )
        created_user = await self.user_repo.create(user)

        # Create blank patient profile
        profile = PatientProfile(user_id=created_user.id)
        await self.user_repo.save_profile(profile)

        # Log audit event
        await self.audit_repo.log_event(
            action="USER_REGISTER",
            user_id=created_user.id,
            ip_address=ip_address,
            details=f"User registered with role {created_user.role}",
        )

        tokens = self._generate_tokens(created_user)
        return created_user, tokens

    async def login(self, login_in: UserLogin, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> TokenResponse:
        user = await self.user_repo.get_by_email(login_in.email)
        if not user or not verify_password(login_in.password, user.hashed_password):
            await self.audit_repo.log_event(
                action="LOGIN_FAILED",
                ip_address=ip_address,
                user_agent=user_agent,
                status="FAILED",
                details=f"Failed login attempt for email: {login_in.email}",
            )
            raise AuthenticationError(message="Incorrect email or password.")

        if not user.is_active:
            raise AuthenticationError(message="User account is inactive.")

        await self.audit_repo.log_event(
            action="USER_LOGIN",
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            status="SUCCESS",
        )

        return self._generate_tokens(user)

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise AuthenticationError(message="Invalid or expired refresh token.")

        user_id = payload.get("sub")
        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise AuthenticationError(message="User not found or inactive.")

        return self._generate_tokens(user)

    def _generate_tokens(self, user: User) -> TokenResponse:
        access_token = create_access_token(subject=user.id, role=user.role)
        refresh_token = create_refresh_token(subject=user.id, role=user.role)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
        )
