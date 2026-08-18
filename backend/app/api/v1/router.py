from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    auth,
    ner,
    documents,
    chat,
    profile,
    history,
    admin,
    health,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(ner.router, prefix="/ner", tags=["Biomedical NER"])
api_router.include_router(documents.router, prefix="/documents", tags=["Medical Documents"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Medical Assistant"])
api_router.include_router(profile.router, prefix="/profile", tags=["Patient Profile"])
api_router.include_router(history.router, prefix="/history", tags=["Medical History"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin & Monitoring"])
api_router.include_router(health.router, tags=["Health & Observability"])
