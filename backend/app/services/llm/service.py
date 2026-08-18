from typing import Optional, List, Dict, Any
from backend.app.services.llm.base import BaseLLMProvider
from backend.app.services.llm.gemini import GeminiProvider
from backend.app.services.llm.mock import MockLLMProvider
from backend.app.schemas.chat import AIStructuredOutput
from backend.app.core.config import settings
from backend.app.core.logger import logger


class LLMService:
    def __init__(self):
        self.providers: Dict[str, BaseLLMProvider] = {
            "gemini": GeminiProvider(),
            "mock": MockLLMProvider(),
        }

    def get_provider(self, provider_name: Optional[str] = None) -> BaseLLMProvider:
        p_name = provider_name or settings.LLM_PROVIDER.lower()
        if p_name in self.providers:
            return self.providers[p_name]
        logger.warning(f"Requested LLM provider '{p_name}' not found. Defaulting to mock provider.")
        return self.providers["mock"]

    async def consult(
        self,
        query: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        patient_context: Optional[Dict[str, Any]] = None,
        provider_name: Optional[str] = None,
    ) -> tuple[AIStructuredOutput, str]:
        provider = self.get_provider(provider_name)
        response = await provider.generate_response(query, chat_history, patient_context)
        return response, provider.get_provider_name()


llm_service = LLMService()
