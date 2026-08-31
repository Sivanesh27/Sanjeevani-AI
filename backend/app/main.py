from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.core.logger import logger
from backend.app.core.exceptions import SanjeevaniException
from backend.app.schemas.common import MEDICAL_DISCLAIMER
from backend.app.ml.manager import model_manager
from backend.app.middleware.request_id import RequestIDMiddleware
from backend.app.middleware.security_headers import SecurityHeadersMiddleware
from backend.app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.APP_ENV})...")
    # Initialize database
    await init_db()
    # Initialize ML Models
    try:
        model_manager.initialize()
    except Exception as e:
        logger.warning(f"ML Model initialization warning (will retry on demand): {e}")

    yield

    logger.info(f"Shutting down {settings.APP_NAME}...")


def create_application() -> FastAPI:
    app = FastAPI(
        title=f"{settings.APP_NAME} — Healthcare Intelligence API",
        description=(
            "Industry-grade healthcare AI and clinical decision-support platform.\n\n"
            f"**Medical Safety Notice**: {MEDICAL_DISCLAIMER}"
        ),
        version=settings.APP_VERSION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Middlewares
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception Handlers
    @app.exception_handler(SanjeevaniException)
    async def sanjeevani_exception_handler(request: Request, exc: SanjeevaniException):
        req_id = getattr(request.state, "request_id", None)
        logger.error(f"[{exc.code}] {exc.message} (Request ID: {req_id})")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
                "request_id": req_id,
                "disclaimer": MEDICAL_DISCLAIMER,
            },
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        req_id = getattr(request.state, "request_id", None)
        logger.warning(f"Validation error: {exc.errors()} (Request ID: {req_id})")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid request parameters.",
                    "details": exc.errors(),
                },
                "request_id": req_id,
                "disclaimer": MEDICAL_DISCLAIMER,
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        req_id = getattr(request.state, "request_id", None)
        logger.error(f"Unhandled exception: {str(exc)} (Request ID: {req_id})", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred while processing the healthcare request.",
                },
                "request_id": req_id,
                "disclaimer": MEDICAL_DISCLAIMER,
            },
        )

    # Register API v1 routes
    app.include_router(api_router, prefix="/api/v1")

    # Convenience root health check aliases
    @app.get("/health", tags=["Root"])
    async def root_health():
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }

    # Root redirect / status
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "app": settings.APP_NAME,
            "tagline": "AI-Powered Healthcare Intelligence Platform",
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "disclaimer": MEDICAL_DISCLAIMER,
        }

    return app


app = create_application()
