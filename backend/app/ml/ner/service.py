import time
import uuid
from typing import List, Optional
from backend.app.ml.ner.base import BaseNERModel
from backend.app.schemas.ner import NERRequest, NERResponse, NEREntity
from backend.app.core.logger import logger


class NERService:
    def __init__(self, model: BaseNERModel):
        self.model = model

    def analyze_text(self, request: NERRequest, request_id: Optional[str] = None) -> NERResponse:
        req_id = request_id or str(uuid.uuid4())
        start_time = time.perf_counter()

        entities: List[NEREntity] = self.model.predict(request.text)
        processing_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        model_info = self.model.get_info()

        logger.info(
            f"NER Analysis completed: req_id={req_id}, entities_found={len(entities)}, "
            f"latency={processing_time_ms}ms"
        )

        return NERResponse(
            request_id=req_id,
            model=model_info,
            entities=entities,
            entity_count=len(entities),
            processing_time_ms=processing_time_ms,
            text_length=len(request.text),
        )
