from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from backend.app.schemas.chat import AIStructuredOutput


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        query: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        patient_context: Optional[Dict[str, Any]] = None,
    ) -> AIStructuredOutput:
        """Generate structured clinical decision-support response."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier."""
        pass
