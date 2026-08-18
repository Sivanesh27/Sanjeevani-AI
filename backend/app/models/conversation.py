from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.models.base import BaseModel


class AIConversation(BaseModel):
    __tablename__ = "ai_conversations"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="New Medical Consultation", nullable=False)

    # Relationships with selectin loading to prevent async lazy loading issues
    user = relationship("User", back_populates="conversations", lazy="selectin")
    messages = relationship(
        "AIMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="AIMessage.created_at",
        lazy="selectin",
    )


class AIMessage(BaseModel):
    __tablename__ = "ai_messages"

    conversation_id = Column(String(36), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    structured_data = Column(Text, nullable=True)  # JSON-encoded summary, recommendations, disclaimer
    model_provider = Column(String(50), nullable=True)

    # Relationships
    conversation = relationship("AIConversation", back_populates="messages", lazy="selectin")
