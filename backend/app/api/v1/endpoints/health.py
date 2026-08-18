from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.ml.manager import model_manager

router = APIRouter()


@router.get("/health")
async def health_check():
    """Liveness probe: verifies basic service responsiveness."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Readiness probe: checks database connectivity and local ML model availability."""
    db_ok = False
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    model_status = model_manager.get_status()
    models_ok = model_status.get("initialized", False)

    is_ready = db_ok

    return {
        "status": "ready" if is_ready else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "models": model_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
