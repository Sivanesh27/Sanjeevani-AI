import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_and_update_profile(client: AsyncClient, auth_headers: dict):
    # Fetch profile
    get_resp = await client.get("/api/v1/profile", headers=auth_headers)
    assert get_resp.status_code == 200
    profile_data = get_resp.json()["data"]
    assert profile_data["blood_group"] == "O+"

    # Update profile
    update_payload = {
        "age": 46,
        "gender": "Male",
        "blood_group": "O+",
        "height_cm": 176.0,
        "weight_kg": 73.0,
        "known_allergies": ["Penicillin", "Peanuts"],
        "chronic_conditions": ["Type 2 Diabetes"],
        "current_medications": ["Metformin 500mg"],
        "emergency_contact": "+1 (555) 019-2834",
    }
    put_resp = await client.put("/api/v1/profile", headers=auth_headers, json=update_payload)
    assert put_resp.status_code == 200
    updated = put_resp.json()["data"]
    assert updated["age"] == 46
    assert "Penicillin" in updated["known_allergies"]
    assert "Type 2 Diabetes" in updated["chronic_conditions"]


@pytest.mark.asyncio
async def test_admin_stats(client: AsyncClient, admin_headers: dict):
    response = await client.get("/api/v1/admin/stats", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "total_users" in data
    assert data["system_health"] == "Operational"


@pytest.mark.asyncio
async def test_admin_access_forbidden_for_patient(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/admin/stats", headers=auth_headers)
    assert response.status_code == 403
