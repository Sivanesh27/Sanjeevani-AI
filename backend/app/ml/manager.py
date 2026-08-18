from typing import Optional, Dict, Any
from backend.app.ml.ner.bc5cdr import BC5CDRNERModel
from backend.app.ml.ner.service import NERService
from backend.app.core.logger import logger


class ModelManager:
    _instance: Optional["ModelManager"] = None

    def __init__(self):
        self.bc5cdr_ner: Optional[BC5CDRNERModel] = None
        self.ner_service: Optional[NERService] = None
        self._is_initialized = False

    @classmethod
    def get_instance(cls) -> "ModelManager":
        if cls._instance is None:
            cls._instance = ModelManager()
        return cls._instance

    def initialize(self) -> None:
        """Initialize and warm up all local ML models."""
        if self._is_initialized:
            return

        logger.info("Initializing ModelManager and loading ML pipelines...")
        try:
            self.bc5cdr_ner = BC5CDRNERModel()
            self.bc5cdr_ner.load()
            self.ner_service = NERService(model=self.bc5cdr_ner)
            self._is_initialized = True
            logger.info("ModelManager initialized successfully.")
        except Exception as e:
            logger.error(f"Error during ModelManager initialization: {str(e)}", exc_info=True)
            self._is_initialized = False

    def get_ner_service(self) -> NERService:
        if self.ner_service is None:
            if self.bc5cdr_ner is None:
                self.bc5cdr_ner = BC5CDRNERModel()
            self.bc5cdr_ner.load()
            self.ner_service = NERService(model=self.bc5cdr_ner)
        return self.ner_service

    def get_status(self) -> Dict[str, Any]:
        return {
            "initialized": self._is_initialized,
            "models": {
                "bc5cdr_ner": self.bc5cdr_ner.get_info().model_dump() if self.bc5cdr_ner else {"status": "Not Loaded"}
            }
        }


model_manager = ModelManager.get_instance()
