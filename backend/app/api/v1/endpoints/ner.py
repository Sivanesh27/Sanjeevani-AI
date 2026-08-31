import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.schemas.ner import NERRequest, NERResponse, ModelInfo
from backend.app.schemas.common import BaseResponse
from backend.app.ml.manager import model_manager
from backend.app.repositories.audit_repo import AuditRepository
from backend.app.api.deps import security_scheme, get_client_ip
from backend.app.core.security import decode_token

try:
    import spaces
    gpu_decorator = spaces.GPU
except Exception:
    def gpu_decorator(func):
        return func

router = APIRouter()


@router.post("/analyze", response_model=NERResponse)
@gpu_decorator
async def analyze_biomedical_ner(
    request_body: NERRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Perform Named Entity Recognition using the locally loaded RoBERTa-large BC5CDR model.
    Extracts CHEMICAL (medications/drugs) and DISEASE (medical conditions) entities with character offsets and confidence scores.
    """
    req_id = str(uuid.uuid4())
    ner_service = model_manager.get_ner_service()
    result = ner_service.analyze_text(request_body, request_id=req_id)

    # If an authenticated user made the request, record in history
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("sub"):
            audit_repo = AuditRepository(db)
            await audit_repo.add_history(
                user_id=payload["sub"],
                action_type="NER",
                description=f"Analyzed text ({len(request_body.text)} chars)",
                entity_count=result.entity_count,
            )

    return result


@router.get("/model-info", response_model=BaseResponse[ModelInfo])
async def get_model_info():
    """Retrieve metadata and runtime status of the local biomedical NER model."""
    ner_service = model_manager.get_ner_service()
    info = ner_service.model.get_info()
    return BaseResponse(
        success=True,
        data=info,
    )
