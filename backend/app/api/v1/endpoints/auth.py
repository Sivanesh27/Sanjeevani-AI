from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.schemas.user import UserCreate, UserLogin, UserResponse
from backend.app.schemas.token import TokenResponse, RefreshTokenRequest
from backend.app.schemas.common import BaseResponse
from backend.app.services.auth_service import AuthService
from backend.app.api.deps import get_current_user, get_client_ip
from backend.app.models.user import User

router = APIRouter()


@router.post("/register", response_model=BaseResponse[TokenResponse])
async def register(
    user_in: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user and receive initial access/refresh tokens."""
    ip = get_client_ip(request)
    auth_service = AuthService(db)
    user, tokens = await auth_service.register(user_in, ip_address=ip)
    return BaseResponse(
        success=True,
        message="User registered successfully.",
        data=tokens,
    )


@router.post("/login", response_model=BaseResponse[TokenResponse])
async def login(
    login_in: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate with email and password to receive JWT credentials."""
    ip = get_client_ip(request)
    agent = request.headers.get("User-Agent")
    auth_service = AuthService(db)
    tokens = await auth_service.login(login_in, ip_address=ip, user_agent=agent)
    return BaseResponse(
        success=True,
        message="Login successful.",
        data=tokens,
    )


@router.post("/refresh", response_model=BaseResponse[TokenResponse])
async def refresh_token(
    refresh_in: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Exchange a valid refresh token for a new access/refresh token pair."""
    auth_service = AuthService(db)
    tokens = await auth_service.refresh_tokens(refresh_in.refresh_token)
    return BaseResponse(
        success=True,
        message="Token refreshed successfully.",
        data=tokens,
    )


@router.get("/me", response_model=BaseResponse[UserResponse])
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Retrieve the currently authenticated user's profile metadata."""
    return BaseResponse(
        success=True,
        data=UserResponse.model_validate(current_user),
    )
