import json
from typing import List, Optional, Dict, Any
import httpx
from backend.app.services.llm.base import BaseLLMProvider
from backend.app.services.llm.mock import MockLLMProvider
from backend.app.schemas.chat import AIStructuredOutput
from backend.app.schemas.common import MEDICAL_DISCLAIMER
from backend.app.core.config import settings
from backend.app.core.logger import logger


class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.fallback = MockLLMProvider()
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    def get_provider_name(self) -> str:
        return "Google Gemini (Gemini 1.5 Flash)"

    async def generate_response(
        self,
        query: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        patient_context: Optional[Dict[str, Any]] = None,
    ) -> AIStructuredOutput:
        if not self.api_key:
            logger.info("No GEMINI_API_KEY provided; falling back to MockLLM provider.")
            return await self.fallback.generate_response(query, chat_history, patient_context)

        system_instruction = (
            "You are SanjeevaniAI, an industry-grade clinical decision-support AI. "
            "You provide educational health insights and considerations for discussions with doctors. "
            "CRITICAL RULES: "
            "1. NEVER give a definitive diagnosis (e.g. 'You have cancer'). Use non-diagnostic phrasing: 'The symptoms described may be associated with...'. "
            "2. Distinguish extracted facts from AI considerations. "
            "3. If emergency symptoms (chest pain, stroke, severe breathlessness) are present, set is_emergency=True and emphasize urgent care. "
            "4. Respond STRICTLY in valid JSON matching this schema: "
            "{"
            "  \"summary\": \"string\","
            "  \"possible_considerations\": [\"string\"],"
            "  \"relevant_medical_info\": [\"string\"],"
            "  \"questions_for_doctor\": [\"string\"],"
            "  \"safety_warning\": \"string\","
            "  \"is_emergency\": false,"
            "  \"emergency_instructions\": null"
            "}"
        )

        user_content = f"User Query: {query}\n"
        if patient_context:
            user_content += f"Patient Context: {json.dumps(patient_context)}\n"

        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_instruction}\n\n{user_content}"}]}
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    f"{self.endpoint}?key={self.api_key}",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )

                if res.status_code != 200:
                    logger.warning(f"Gemini API returned status {res.status_code}: {res.text}. Falling back.")
                    return await self.fallback.generate_response(query, chat_history, patient_context)

                data = res.json()
                text_out = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_out)

                return AIStructuredOutput(
                    summary=parsed.get("summary", "Summary unavailable."),
                    possible_considerations=parsed.get("possible_considerations", []),
                    relevant_medical_info=parsed.get("relevant_medical_info", []),
                    questions_for_doctor=parsed.get("questions_for_doctor", []),
                    safety_warning=parsed.get("safety_warning", MEDICAL_DISCLAIMER),
                    is_emergency=parsed.get("is_emergency", False),
                    emergency_instructions=parsed.get("emergency_instructions"),
                )
        except Exception as ex:
            logger.error(f"Error communicating with Gemini API: {str(ex)}. Using fallback.", exc_info=True)
            return await self.fallback.generate_response(query, chat_history, patient_context)
