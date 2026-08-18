import os
from pathlib import Path
from typing import List, Optional
import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
from backend.app.ml.ner.base import BaseNERModel
from backend.app.schemas.ner import NEREntity, ModelInfo
from backend.app.core.config import settings
from backend.app.core.logger import logger
from backend.app.core.exceptions import MLModelError


class BC5CDRNERModel(BaseNERModel):
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = Path(model_path or settings.NER_MODEL_PATH)
        self.model_name = "tner/roberta-large-bc5cdr"
        self.tokenizer = None
        self.model = None
        self.pipeline = None
        self.device = "cuda:0" if torch.cuda.is_available() else "cpu"
        self._is_loaded = False

    def load(self) -> None:
        if self._is_loaded:
            return

        # Use local path if it exists; otherwise load directly from HuggingFace Hub (for cloud hosting)
        if self.model_path.exists() and any(self.model_path.iterdir()):
            model_source = str(self.model_path)
            logger.info(f"Loading local BC5CDR NER model from disk ({model_source}) onto {self.device}...")
        else:
            model_source = self.model_name
            logger.info(f"Local model path not found. Loading '{model_source}' from Hugging Face Hub onto {self.device}...")

        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_source)
            self.model = AutoModelForTokenClassification.from_pretrained(model_source)

            device_id = 0 if self.device.startswith("cuda") else -1
            self.pipeline = pipeline(
                "ner",
                model=self.model,
                tokenizer=self.tokenizer,
                aggregation_strategy="simple",
                device=device_id,
            )

            # Warm-up run
            _ = self.pipeline("Metformin reduces glucose in diabetes mellitus.")
            self._is_loaded = True
            logger.info(f"BC5CDR NER model ({model_source}) loaded and warmed up successfully.")
        except Exception as e:
            logger.error(f"Failed to load BC5CDR model: {str(e)}", exc_info=True)
            self._is_loaded = False
            raise MLModelError(message=f"Model initialization failed: {str(e)}")

    def predict(self, text: str) -> List[NEREntity]:
        if not self._is_loaded or self.pipeline is None:
            self.load()

        if not text or not text.strip():
            return []

        try:
            raw_entities = self.pipeline(text)
            entities: List[NEREntity] = []

            for ent in raw_entities:
                entity_label = ent.get("entity_group") or ent.get("entity") or "UNKNOWN"
                norm_label = entity_label.upper()
                if "CHEM" in norm_label:
                    norm_label = "CHEMICAL"
                elif "DIS" in norm_label:
                    norm_label = "DISEASE"

                word = ent.get("word", "").strip()
                start = ent.get("start", 0)
                end = ent.get("end", 0)

                if not word:
                    continue

                score = ent.get("score")
                confidence = float(score) if score is not None else None

                entities.append(
                    NEREntity(
                        text=word,
                        label=norm_label,
                        start=start,
                        end=end,
                        confidence=round(confidence, 4) if confidence else None,
                        model=self.model_name,
                    )
                )

            return entities
        except Exception as e:
            logger.error(f"NER inference error: {str(e)}", exc_info=True)
            raise MLModelError(message=f"Error executing NER inference: {str(e)}")

    def get_info(self) -> ModelInfo:
        return ModelInfo(
            name=self.model_name,
            version="1.0.0",
            provider="RoBERTa-large BC5CDR",
            device=self.device,
            status="Loaded" if self._is_loaded else "Not Loaded",
        )
