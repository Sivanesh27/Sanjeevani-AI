import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ai_chat_consultation(client: AsyncClient, auth_headers: dict):
    payload = {
        "message": "What are typical lifestyle considerations for managing Type 2 Diabetes?"
    }
    response = await client.post("/api/v1/chat/message", headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

    completion = data["data"]
    assert "conversation_id" in completion
    msg = completion["message"]
    assert msg["role"] == "assistant"
    assert msg["structured_data"] is not None
    assert len(msg["structured_data"]["possible_considerations"]) > 0
    assert len(msg["structured_data"]["questions_for_doctor"]) > 0
    assert msg["structured_data"]["is_emergency"] is False


@pytest.mark.asyncio
async def test_ai_chat_emergency_detection(client: AsyncClient, auth_headers: dict):
    payload = {
        "message": "I am having sudden severe chest pain and difficulty breathing!"
    }
    response = await client.post("/api/v1/chat/message", headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    structured = data["data"]["message"]["structured_data"]

    assert structured["is_emergency"] is True
    assert "emergency" in structured["summary"].lower() or "emergency" in structured["safety_warning"].lower()


@pytest.mark.asyncio
async def test_chat_conversations_history(client: AsyncClient, auth_headers: dict):
    # Send a message to ensure conversation exists
    await client.post(
        "/api/v1/chat/message",
        headers=auth_headers,
        json={"message": "Can metformin cause vitamin B12 deficiency?"}
    )

    response = await client.get("/api/v1/chat/conversations", headers=auth_headers)
    assert response.status_code == 200
    convs = response.json()["data"]
    assert len(convs) >= 1
