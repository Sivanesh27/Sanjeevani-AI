import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ner_model_info(client: AsyncClient):
    response = await client.get("/api/v1/ner/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "tner/roberta-large-bc5cdr"


@pytest.mark.asyncio
async def test_ner_analyze_endpoint(client: AsyncClient):
    payload = {
        "text": "The patient was prescribed metformin for type 2 diabetes mellitus."
    }
    response = await client.post("/api/v1/ner/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "request_id" in data
    assert data["model"]["name"] == "tner/roberta-large-bc5cdr"
    assert data["entity_count"] > 0
    assert data["processing_time_ms"] >= 0

    entity_texts = [e["text"].lower() for e in data["entities"]]
    labels = [e["label"] for e in data["entities"]]

    # Verify extracted entities
    assert any("metformin" in t for t in entity_texts)
    assert any("diabetes" in t for t in entity_texts)
    assert "CHEMICAL" in labels
    assert "DISEASE" in labels


@pytest.mark.asyncio
async def test_ner_empty_text_validation(client: AsyncClient):
    payload = {"text": ""}
    response = await client.post("/api/v1/ner/analyze", json=payload)
    assert response.status_code == 422
