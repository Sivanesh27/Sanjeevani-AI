from typing import Any, Optional, Dict
from fastapi import HTTPException, status


class SanjeevaniException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message, "details": details},
            headers=headers,
        )
        self.code = code
        self.message = message
        self.details = details


class AuthenticationError(SanjeevaniException):
    def __init__(self, message: str = "Invalid credentials", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="AUTHENTICATION_FAILED",
            message=message,
            details=details,
            headers={"WWW-Authenticate": "Bearer"},
        )


class PermissionDeniedError(SanjeevaniException):
    def __init__(self, message: str = "Access forbidden", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            message=message,
            details=details,
        )


class ResourceNotFoundError(SanjeevaniException):
    def __init__(self, resource: str, resource_id: Any = None):
        msg = f"{resource} not found" if not resource_id else f"{resource} with ID '{resource_id}' not found"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="RESOURCE_NOT_FOUND",
            message=msg,
        )


class ValidationError(SanjeevaniException):
    def __init__(self, message: str = "Validation failed", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message=message,
            details=details,
        )


class MLModelError(SanjeevaniException):
    def __init__(self, message: str = "ML inference failed", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="ML_MODEL_ERROR",
            message=message,
            details=details,
        )


class DocumentProcessingError(SanjeevaniException):
    def __init__(self, message: str = "Failed to process document", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="DOCUMENT_PROCESSING_FAILED",
            message=message,
            details=details,
        )
