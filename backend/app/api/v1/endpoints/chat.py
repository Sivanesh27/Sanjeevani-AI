import json
from typing import List
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ConversationResponse,
    ChatCompletionResponse,
    AIStructuredOutput,
)
from backend.app.schemas.common import BaseResponse, MEDICAL_DISCLAIMER
from backend.app.models.conversation import AIConversation, AIMessage
from backend.app.models.user import User
from backend.app.repositories.chat_repo import ChatRepository
from backend.app.repositories.user_repo import UserRepository
from backend.app.repositories.audit_repo import AuditRepository
from backend.app.services.llm.service import llm_service
from backend.app.api.deps import get_current_user
from backend.app.core.exceptions import ResourceNotFoundError

router = APIRouter()


def _format_message(msg: AIMessage) -> ChatMessageResponse:
    structured = None
    if msg.structured_data:
        try:
            parsed = json.loads(msg.structured_data)
            structured = AIStructuredOutput(**parsed)
        except Exception:
            pass

    return ChatMessageResponse(
        id=msg.id,
        conversation_id=msg.conversation_id,
        role=msg.role,
        content=msg.content,
        structured_data=structured,
        model_provider=msg.model_provider,
        created_at=msg.created_at,
    )


@router.post("/message", response_model=BaseResponse[ChatCompletionResponse])
async def send_chat_message(
    chat_in: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a medical query to the AI Assistant.
    Generates structured healthcare decision-support insights, recommendations, and emergency triage alerts.
    """
    chat_repo = ChatRepository(db)
    user_repo = UserRepository(db)
    audit_repo = AuditRepository(db)

    # 1. Resolve or Create Conversation
    history_messages = []
    if chat_in.conversation_id:
        conversation = await chat_repo.get_conversation_with_messages(
            chat_in.conversation_id, current_user.id
        )
        if conversation:
            history_messages = conversation.messages or []
        else:
            conversation = AIConversation(
                id=chat_in.conversation_id,
                user_id=current_user.id,
                title=chat_in.message[:45] + ("..." if len(chat_in.message) > 45 else ""),
            )
            conversation = await chat_repo.create(conversation)
    else:
        title_snippet = chat_in.message[:45] + ("..." if len(chat_in.message) > 45 else "")
        conversation = AIConversation(
            user_id=current_user.id,
            title=title_snippet or "Medical Consultation",
        )
        conversation = await chat_repo.create(conversation)

    # 2. Save User Message
    user_msg = AIMessage(
        conversation_id=conversation.id,
        role="user",
        content=chat_in.message,
    )
    await chat_repo.add_message(user_msg)

    # 3. Retrieve Patient Health Profile Context
    patient_context = {}
    profile = await user_repo.get_profile_by_user_id(current_user.id)
    if profile:
        patient_context = {
            "age": profile.age,
            "gender": profile.gender,
            "blood_group": profile.blood_group,
            "known_allergies": json.loads(profile.known_allergies) if profile.known_allergies else [],
            "chronic_conditions": json.loads(profile.chronic_conditions) if profile.chronic_conditions else [],
            "current_medications": json.loads(profile.current_medications) if profile.current_medications else [],
        }

    # 4. Format Chat History
    history = [
        {"role": m.role, "content": m.content}
        for m in history_messages[-6:]
    ]

    # 5. Execute LLM Consultation
    structured_output, provider_name = await llm_service.consult(
        query=chat_in.message,
        chat_history=history,
        patient_context=patient_context,
    )

    # 6. Save Assistant Response
    assistant_msg = AIMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=structured_output.summary,
        structured_data=json.dumps(structured_output.model_dump()),
        model_provider=provider_name,
    )
    saved_assistant_msg = await chat_repo.add_message(assistant_msg)

    # 7. Add Audit & Timeline
    await audit_repo.add_history(
        user_id=current_user.id,
        action_type="CHAT",
        description=f"Consulted AI Assistant: '{chat_in.message[:40]}...'",
        reference_id=conversation.id,
    )

    return BaseResponse(
        success=True,
        data=ChatCompletionResponse(
            conversation_id=conversation.id,
            message=_format_message(saved_assistant_msg),
            disclaimer=MEDICAL_DISCLAIMER,
        ),
    )


@router.get("/conversations", response_model=BaseResponse[List[ConversationResponse]])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all historical AI consultation threads for the current user."""
    chat_repo = ChatRepository(db)
    convs = await chat_repo.get_user_conversations(current_user.id)
    response_list = [
        ConversationResponse(
            id=c.id,
            user_id=c.user_id,
            title=c.title,
            messages=[_format_message(m) for m in (c.messages or [])],
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in convs
    ]
    return BaseResponse(success=True, data=response_list)


@router.get("/conversations/{conversation_id}", response_model=BaseResponse[ConversationResponse])
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch complete message history for a specific conversation."""
    chat_repo = ChatRepository(db)
    c = await chat_repo.get_conversation_with_messages(conversation_id, current_user.id)
    if not c:
        raise ResourceNotFoundError(resource="Conversation", resource_id=conversation_id)

    return BaseResponse(
        success=True,
        data=ConversationResponse(
            id=c.id,
            user_id=c.user_id,
            title=c.title,
            messages=[_format_message(m) for m in (c.messages or [])],
            created_at=c.created_at,
            updated_at=c.updated_at,
        ),
    )


@router.delete("/conversations/{conversation_id}", response_model=BaseResponse[dict])
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a conversation thread and its message history."""
    chat_repo = ChatRepository(db)
    conv = await chat_repo.get_conversation_with_messages(conversation_id, current_user.id)
    if not conv:
        raise ResourceNotFoundError(resource="Conversation", resource_id=conversation_id)

    await chat_repo.delete(conversation_id)
    return BaseResponse(
        success=True,
        message="Conversation deleted.",
        data={"deleted_id": conversation_id},
    )
