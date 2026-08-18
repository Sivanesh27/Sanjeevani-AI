import pytest
import pytest_asyncio
import sys
import uuid
from pathlib import Path
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app
from backend.app.core.database import Base, get_db
from backend.app.core.security import get_password_hash, create_access_token, UserRole
from backend.app.models.user import User
from backend.app.models.profile import PatientProfile

# Test in-memory SQLite database
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        yield c

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    unique_email = f"patient.{uuid.uuid4().hex[:8]}@sanjeevani.ai"
    user = User(
        email=unique_email,
        hashed_password=get_password_hash("TestPassword123!"),
        full_name="Dr. Test Patient",
        role=UserRole.PATIENT.value,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    profile = PatientProfile(
        user_id=user.id,
        age=45,
        gender="Male",
        blood_group="O+",
        height_cm=175.0,
        weight_kg=74.5,
    )
    db_session.add(profile)
    await db_session.commit()

    return user


@pytest_asyncio.fixture
async def auth_headers(test_user: User) -> dict:
    token = create_access_token(subject=test_user.id, role=test_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession) -> User:
    unique_admin_email = f"admin.{uuid.uuid4().hex[:8]}@sanjeevani.ai"
    admin = User(
        email=unique_admin_email,
        hashed_password=get_password_hash("AdminPassword123!"),
        full_name="System Administrator",
        role=UserRole.ADMIN.value,
        is_active=True,
        is_verified=True,
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest_asyncio.fixture
async def admin_headers(test_admin: User) -> dict:
    token = create_access_token(subject=test_admin.id, role=test_admin.role)
    return {"Authorization": f"Bearer {token}"}
