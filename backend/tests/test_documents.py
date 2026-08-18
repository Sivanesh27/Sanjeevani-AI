import pytest
import io
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_document_upload_and_analysis(client: AsyncClient, auth_headers: dict):
    clinical_text = (
        "CLINICAL SUMMARY:\n"
        "Patient presents with persistent cough and fever.\n"
        "Diagnosis: Acute bronchitis and mild hypertension.\n"
        "Plan: Start azithromycin 500mg daily and continue lisinopril 10mg."
    )

    files = {
        "file": ("test_clinical_report.txt", io.BytesIO(clinical_text.encode("utf-8")), "text/plain")
    }

    response = await client.post("/api/v1/documents/upload", headers=auth_headers, files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    doc_data = data["data"]
    assert doc_data["status"] == "COMPLETED"
    assert doc_data["analysis"] is not None

    doc_id = doc_data["id"]

    # Test listing documents
    list_resp = await client.get("/api/v1/documents", headers=auth_headers)
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert len(list_data["data"]) >= 1

    # Test get document by ID
    get_resp = await client.get(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["id"] == doc_id

    # Test delete document
    del_resp = await client.delete(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert del_resp.status_code == 200
