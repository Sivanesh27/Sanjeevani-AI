import json
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.schemas.document import MedicalDocumentResponse, DocumentAnalysisResponse, DocumentUploadResponse
from backend.app.schemas.ner import NEREntity
from backend.app.schemas.common import BaseResponse
from backend.app.services.document_service import DocumentService
from backend.app.repositories.document_repo import DocumentRepository
from backend.app.api.deps import get_current_user, get_client_ip
from backend.app.models.user import User
from backend.app.models.document import MedicalDocument
from backend.app.core.exceptions import ResourceNotFoundError, PermissionDeniedError

router = APIRouter()


def _format_document_response(doc: MedicalDocument) -> MedicalDocumentResponse:
    analysis_resp = None
    if doc.analysis:
        analysis = doc.analysis
        findings = json.loads(analysis.important_findings) if analysis.important_findings else []
        conditions = json.loads(analysis.detected_conditions) if analysis.detected_conditions else []
        medications = json.loads(analysis.detected_medications) if analysis.detected_medications else []

        entities = [
            NEREntity(
                text=e.text,
                label=e.label,
                start=e.start_offset,
                end=e.end_offset,
                confidence=e.confidence,
                model=e.model_name,
            )
            for e in (analysis.entities or [])
        ]

        analysis_resp = DocumentAnalysisResponse(
            id=analysis.id,
            document_id=analysis.document_id,
            raw_text=analysis.raw_text,
            cleaned_text=analysis.cleaned_text,
            summary=analysis.summary,
            important_findings=findings,
            detected_conditions=conditions,
            detected_medications=medications,
            clinical_recommendations=analysis.clinical_recommendations,
            entities=entities,
            processed_at=analysis.processed_at,
        )

    return MedicalDocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        filename=doc.filename,
        original_filename=doc.original_filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        status=doc.status,
        error_message=doc.error_message,
        analysis=analysis_resp,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


@router.post("/upload", response_model=BaseResponse[MedicalDocumentResponse])
async def upload_medical_document(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Securely upload a medical report (PDF, DOCX, TXT), perform text extraction,
    biomedical entity recognition, and clinical summarization.
    """
    ip = get_client_ip(request)
    doc_service = DocumentService(db)
    doc = await doc_service.process_document_upload(file=file, user_id=current_user.id, ip_address=ip)
    formatted = _format_document_response(doc)
    return BaseResponse(
        success=True,
        message="Document uploaded and analyzed successfully.",
        data=formatted,
    )


@router.get("", response_model=BaseResponse[List[MedicalDocumentResponse]])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all medical reports and document analyses uploaded by the current user."""
    doc_repo = DocumentRepository(db)
    docs = await doc_repo.get_user_documents(current_user.id)
    formatted_docs = [_format_document_response(d) for d in docs]
    return BaseResponse(
        success=True,
        data=formatted_docs,
    )


@router.get("/{document_id}", response_model=BaseResponse[MedicalDocumentResponse])
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch detailed analysis, extracted entities, and summary for a specific document."""
    doc_repo = DocumentRepository(db)
    doc = await doc_repo.get_document_details(document_id, user_id=current_user.id)
    if not doc:
        raise ResourceNotFoundError(resource="Medical Document", resource_id=document_id)
    return BaseResponse(
        success=True,
        data=_format_document_response(doc),
    )


@router.delete("/{document_id}", response_model=BaseResponse[dict])
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a medical report and all associated entity analysis records."""
    doc_repo = DocumentRepository(db)
    doc = await doc_repo.get_document_details(document_id, user_id=current_user.id)
    if not doc:
        raise ResourceNotFoundError(resource="Medical Document", resource_id=document_id)

    await doc_repo.delete(document_id)
    return BaseResponse(
        success=True,
        message="Document deleted successfully.",
        data={"deleted_id": document_id},
    )
