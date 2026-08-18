import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.schemas.profile import PatientProfileUpdate, PatientProfileResponse
from backend.app.schemas.common import BaseResponse
from backend.app.repositories.user_repo import UserRepository
from backend.app.repositories.audit_repo import AuditRepository
from backend.app.models.profile import PatientProfile
from backend.app.models.user import User
from backend.app.api.deps import get_current_user

router = APIRouter()


def _format_profile(profile: PatientProfile) -> PatientProfileResponse:
    allergies = json.loads(profile.known_allergies) if profile.known_allergies else []
    conditions = json.loads(profile.chronic_conditions) if profile.chronic_conditions else []
    meds = json.loads(profile.current_medications) if profile.current_medications else []

    return PatientProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        age=profile.age,
        gender=profile.gender,
        blood_group=profile.blood_group,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        known_allergies=allergies,
        chronic_conditions=conditions,
        current_medications=meds,
        emergency_contact=profile.emergency_contact,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.get("", response_model=BaseResponse[PatientProfileResponse])
async def get_patient_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch the patient health profile for the current user."""
    user_repo = UserRepository(db)
    profile = await user_repo.get_profile_by_user_id(current_user.id)
    if not profile:
        profile = PatientProfile(user_id=current_user.id)
        profile = await user_repo.save_profile(profile)

    return BaseResponse(success=True, data=_format_profile(profile))


@router.put("", response_model=BaseResponse[PatientProfileResponse])
async def update_patient_profile(
    profile_in: PatientProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update patient health information, allergies, chronic conditions, and medications."""
    user_repo = UserRepository(db)
    audit_repo = AuditRepository(db)
    profile = await user_repo.get_profile_by_user_id(current_user.id)

    if not profile:
        profile = PatientProfile(user_id=current_user.id)

    profile.age = profile_in.age
    profile.gender = profile_in.gender
    profile.blood_group = profile_in.blood_group
    profile.height_cm = profile_in.height_cm
    profile.weight_kg = profile_in.weight_kg
    profile.known_allergies = json.dumps(profile_in.known_allergies or [])
    profile.chronic_conditions = json.dumps(profile_in.chronic_conditions or [])
    profile.current_medications = json.dumps(profile_in.current_medications or [])
    profile.emergency_contact = profile_in.emergency_contact

    saved_profile = await user_repo.save_profile(profile)

    await audit_repo.add_history(
        user_id=current_user.id,
        action_type="PROFILE_UPDATE",
        description="Updated patient health profile",
    )

    return BaseResponse(
        success=True,
        message="Patient health profile updated successfully.",
        data=_format_profile(saved_profile),
    )
