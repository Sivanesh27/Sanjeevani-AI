import asyncio
import json
import sys
from pathlib import Path

# Add root directory to sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.core.database import AsyncSessionLocal, init_db
from backend.app.core.security import get_password_hash, UserRole
from backend.app.models.user import User
from backend.app.models.profile import PatientProfile
from backend.app.models.document import MedicalDocument, DocumentAnalysis
from backend.app.models.entity import MedicalEntity
from backend.app.models.conversation import AIConversation, AIMessage
from backend.app.models.audit import AuditLog, AnalysisHistory
from sqlalchemy import select


async def seed_data():
    print("=" * 60)
    print("SANJEEVANI AI -- SYNTHETIC DEMO DATA GENERATOR")
    print("NOTICE: All data generated is synthetic and for demonstration only.")
    print("=" * 60)

    await init_db()

    async with AsyncSessionLocal() as session:
        # 1. Create Demo Patient
        patient_email = "demo.patient@sanjeevani.ai"
        res = await session.execute(select(User).where(User.email == patient_email))
        demo_patient = res.scalars().first()

        if not demo_patient:
            demo_patient = User(
                email=patient_email,
                hashed_password=get_password_hash("DemoPatient2026!"),
                full_name="Alex Mercer (Synthetic Demo Patient)",
                role=UserRole.PATIENT.value,
                is_active=True,
                is_verified=True,
            )
            session.add(demo_patient)
            await session.commit()
            await session.refresh(demo_patient)

            # Profile
            profile = PatientProfile(
                user_id=demo_patient.id,
                age=52,
                gender="Male",
                blood_group="A+",
                height_cm=178.0,
                weight_kg=82.5,
                known_allergies=json.dumps(["Penicillin", "Sulfa drugs"]),
                chronic_conditions=json.dumps(["Type 2 Diabetes Mellitus", "Essential Hypertension", "Mild Hyperlipidemia"]),
                current_medications=json.dumps(["Metformin 500mg BID", "Lisinopril 10mg Daily", "Atorvastatin 20mg QHS"]),
                emergency_contact="Elena Mercer (Spouse) - +1 (555) 019-4821",
            )
            session.add(profile)
            await session.commit()
            print("[OK] Created synthetic demo patient and clinical profile.")

        # 2. Create Demo Doctor
        doctor_email = "demo.doctor@sanjeevani.ai"
        res_doc = await session.execute(select(User).where(User.email == doctor_email))
        if not res_doc.scalars().first():
            demo_doctor = User(
                email=doctor_email,
                hashed_password=get_password_hash("DemoDoctor2026!"),
                full_name="Dr. Sarah Jenkins, MD (Cardiologist)",
                role=UserRole.DOCTOR.value,
                is_active=True,
                is_verified=True,
            )
            session.add(demo_doctor)
            await session.commit()
            print("[OK] Created synthetic demo clinician account.")

        # 3. Create Demo Admin
        admin_email = "demo.admin@sanjeevani.ai"
        res_adm = await session.execute(select(User).where(User.email == admin_email))
        if not res_adm.scalars().first():
            demo_admin = User(
                email=admin_email,
                hashed_password=get_password_hash("DemoAdmin2026!"),
                full_name="Platform Administrator",
                role=UserRole.ADMIN.value,
                is_active=True,
                is_verified=True,
            )
            session.add(demo_admin)
            await session.commit()
            print("[OK] Created demo administrator account.")

        # 4. Create Synthetic Analyzed Documents
        res_docs = await session.execute(select(MedicalDocument).where(MedicalDocument.user_id == demo_patient.id))
        if not res_docs.scalars().first():
            sample_text_1 = (
                "CLINICAL COMPREHENSIVE PROGRESS REPORT\n"
                "Patient: Alex Mercer | Age: 52 | Sex: M\n"
                "Chief Complaint: Routine metabolic follow-up and blood pressure monitoring.\n"
                "Clinical Assessment: The patient has well-managed type 2 diabetes mellitus and secondary hypertension.\n"
                "Pharmacotherapy: The patient continues metformin 500mg twice daily and lisinopril 10mg daily. "
                "Atorvastatin was initiated for moderate hypercholesterolemia.\n"
                "Laboratory Review: Fasting blood glucose 118 mg/dL, HbA1c 6.8%, serum creatinine 0.9 mg/dL.\n"
                "Recommendation: Maintain dietary glycemic restrictions, routine 30-minute aerobic activity, and repeat HbA1c in 90 days."
            )

            doc1 = MedicalDocument(
                user_id=demo_patient.id,
                filename="synthetic_metabolic_report_2026.txt",
                original_filename="Metabolic_Panel_Report_2026.txt",
                file_path="uploads/synthetic_metabolic_report_2026.txt",
                file_type="txt",
                file_size=len(sample_text_1.encode("utf-8")),
                file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                status="COMPLETED",
            )
            session.add(doc1)
            await session.commit()
            await session.refresh(doc1)

            analysis1 = DocumentAnalysis(
                document_id=doc1.id,
                raw_text=sample_text_1,
                cleaned_text=sample_text_1,
                summary="Routine metabolic evaluation demonstrates controlled type 2 diabetes mellitus and hypertension with stable renal parameters.",
                important_findings=json.dumps([
                    "Glycemic control is satisfactory (HbA1c 6.8%).",
                    "Blood pressure therapy is stabilized on lisinopril.",
                    "Lipid management supported by atorvastatin."
                ]),
                detected_conditions=json.dumps(["type 2 diabetes mellitus", "hypertension", "hypercholesterolemia"]),
                detected_medications=json.dumps(["metformin", "lisinopril", "atorvastatin"]),
                clinical_recommendations="Educational decision support: Continue current pharmacotherapy and monitor glycemic trends.",
            )
            session.add(analysis1)
            await session.commit()
            await session.refresh(analysis1)

            # Add entities
            entities = [
                MedicalEntity(analysis_id=analysis1.id, text="diabetes mellitus", label="DISEASE", start_offset=180, end_offset=197, confidence=0.9984),
                MedicalEntity(analysis_id=analysis1.id, text="hypertension", label="DISEASE", start_offset=212, end_offset=224, confidence=0.9991),
                MedicalEntity(analysis_id=analysis1.id, text="hypercholesterolemia", label="DISEASE", start_offset=375, end_offset=395, confidence=0.9856),
                MedicalEntity(analysis_id=analysis1.id, text="metformin", label="CHEMICAL", start_offset=266, end_offset=275, confidence=0.9997),
                MedicalEntity(analysis_id=analysis1.id, text="lisinopril", label="CHEMICAL", start_offset=307, end_offset=317, confidence=0.9995),
                MedicalEntity(analysis_id=analysis1.id, text="atorvastatin", label="CHEMICAL", start_offset=336, end_offset=348, confidence=0.9998),
            ]
            session.add_all(entities)
            await session.commit()
            print("[OK] Created synthetic analyzed medical documents and extracted entity records.")

        # 5. Create Synthetic Consultation
        res_conv = await session.execute(select(AIConversation).where(AIConversation.user_id == demo_patient.id))
        if not res_conv.scalars().first():
            conv = AIConversation(
                user_id=demo_patient.id,
                title="Metformin Dosage and Dietary Interaction",
            )
            session.add(conv)
            await session.commit()
            await session.refresh(conv)

            m1 = AIMessage(
                conversation_id=conv.id,
                role="user",
                content="Should metformin be taken with meals, and what are common gastrointestinal effects?",
            )
            session.add(m1)

            m2_structured = {
                "summary": "Clinical guidance indicates taking metformin with or immediately after meals reduces common gastrointestinal symptoms.",
                "possible_considerations": [
                    "Metformin biguanide mechanism may cause transient nausea, abdominal cramps, or loose stools during initial therapy or dose titration.",
                    "Extended-release (XR) formulations often mitigate gastrointestinal side effects compared to immediate-release tablets."
                ],
                "relevant_medical_info": [
                    "Taking metformin with food slows absorption and decreases gastric irritation.",
                    "Long-term metformin usage is associated with reduced Vitamin B12 absorption; periodic monitoring is recommended."
                ],
                "questions_for_doctor": [
                    "Would switching to an extended-release (XR) formulation be suitable if GI upset persists?",
                    "Should Vitamin B12 levels or renal panel (eGFR) be scheduled at our next review?"
                ],
                "safety_warning": "SanjeevaniAI provides decision-support insights. Consult your prescribing physician regarding any medication adjustments.",
                "is_emergency": False,
                "emergency_instructions": None
            }
            m2 = AIMessage(
                conversation_id=conv.id,
                role="assistant",
                content=m2_structured["summary"],
                structured_data=json.dumps(m2_structured),
                model_provider="Google Gemini / Local Decision Support",
            )
            session.add(m2)
            await session.commit()
            print("[OK] Created synthetic medical consultation conversation.")

        # 6. Add History and Audit Logs
        session.add(AnalysisHistory(
            user_id=demo_patient.id,
            action_type="REPORT_ANALYSIS",
            description="Uploaded and analyzed 'Metabolic_Panel_Report_2026.txt'",
            entity_count=6,
        ))
        session.add(AnalysisHistory(
            user_id=demo_patient.id,
            action_type="CHAT",
            description="Consulted AI on 'Metformin Dosage and Dietary Interaction'",
            entity_count=2,
        ))
        session.add(AuditLog(
            user_id=demo_patient.id,
            action="USER_LOGIN",
            status="SUCCESS",
            details="Demo user authenticated from synthetic session",
        ))
        await session.commit()
        print("[OK] Added synthetic history and audit logs.")

    print("=" * 60)
    print("DEMO CREDENTIALS READY FOR MENTOR PRESENTATION:")
    print("Patient Login: demo.patient@sanjeevani.ai / DemoPatient2026!")
    print("Doctor Login:  demo.doctor@sanjeevani.ai  / DemoDoctor2026!")
    print("Admin Login:   demo.admin@sanjeevani.ai   / DemoAdmin2026!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_data())
