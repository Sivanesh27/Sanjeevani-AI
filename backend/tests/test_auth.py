import pytest
from httpx import AsyncClient
from backend.app.models.user import User


@pytest.mark.asyncio
async def test_user_registration(client: AsyncClient):
    payload = {
        "email": "new.patient@sanjeevani.ai",
        "password": "SecurePassword123!",
        "full_name": "Rohan Sharma",
        "role": "PATIENT",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "access_token" in res_data["data"]
    assert "refresh_token" in res_data["data"]
    assert res_data["data"]["user"]["email"] == "new.patient@sanjeevani.ai"


@pytest.mark.asyncio
async def test_user_login(client: AsyncClient):
    # Register first
    payload = {
        "email": "login.user@sanjeevani.ai",
        "password": "LoginPassword123!",
        "full_name": "Anita Roy",
        "role": "PATIENT",
    }
    await client.post("/api/v1/auth/register", json=payload)

    # Login
    login_payload = {
        "email": "login.user@sanjeevani.ai",
        "password": "LoginPassword123!",
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]


@pytest.mark.asyncio
async def test_user_login_invalid_password(client: AsyncClient):
    login_payload = {
        "email": "nonexistent@sanjeevani.ai",
        "password": "WrongPassword",
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_FAILED"


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, test_user: User, auth_headers: dict):
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == test_user.email
