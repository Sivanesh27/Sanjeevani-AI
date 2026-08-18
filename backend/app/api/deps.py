from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.core.security import decode_token, UserRole
from backend.app.core.exceptions import AuthenticationError, PermissionDeniedError
from backend.app.repositories.user_repo import UserRepository
from backend.app.models.user import User

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    token_auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not token_auth or not token_auth.credentials:
        raise AuthenticationError(message="Authentication token missing.")

    payload = decode_token(token_auth.credentials)
    if not payload or payload.get("type") != "access":
        raise AuthenticationError(message="Invalid or expired access token.")

    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError(message="Token missing subject identifier.")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise AuthenticationError(message="User no longer exists.")

    if not user.is_active:
        raise AuthenticationError(message="User account is deactivated.")

    return user


def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role
        role_values = [r.value for r in allowed_roles]
        if user_role not in role_values and user_role != UserRole.ADMIN.value:
            raise PermissionDeniedError(message="You do not have permission to access this resource.")
        return current_user

    return role_checker


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN.value:
        raise PermissionDeniedError(message="Administrative privileges required.")
    return current_user


def get_client_ip(request: Request) -> Optional[str]:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None
