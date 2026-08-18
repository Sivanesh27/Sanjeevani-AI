from abc import ABC, abstractmethod
from typing import List, Dict, Any
from backend.app.schemas.ner import NEREntity, ModelInfo


class BaseNERModel(ABC):
    @abstractmethod
    def load(self) -> None:
        """Load model weights and tokenizer into memory."""
        pass

    @abstractmethod
    def predict(self, text: str) -> List[NEREntity]:
        """Perform token classification and return extracted biomedical entities."""
        pass

    @abstractmethod
    def get_info(self) -> ModelInfo:
        """Return model metadata."""
        pass
