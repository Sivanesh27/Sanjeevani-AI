from typing import List, Optional, Dict, Any
from backend.app.services.llm.base import BaseLLMProvider
from backend.app.schemas.chat import AIStructuredOutput
from backend.app.schemas.common import MEDICAL_DISCLAIMER


class MockLLMProvider(BaseLLMProvider):
    """
    Offline/Demonstration Clinical AI Provider.
    Generates structured, safe medical considerations adhering to clinical safety rules.
    """

    def get_provider_name(self) -> str:
        return "MockLLM (Offline Decision Support Mode)"

    async def generate_response(
        self,
        query: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        patient_context: Optional[Dict[str, Any]] = None,
    ) -> AIStructuredOutput:
        query_lower = query.lower()

        # Check for critical emergency red flags
        emergency_keywords = [
            "chest pain", "heart attack", "can't breathe", "difficulty breathing",
            "severe bleeding", "unconscious", "stroke", "sudden numbness", "anaphylaxis",
            "loss of speech", "severe head injury", "coughing blood"
        ]

        is_emergency = any(kw in query_lower for kw in emergency_keywords)

        if is_emergency:
            return AIStructuredOutput(
                summary="CRITICAL HEALTHCARE ADVISORY: The symptoms you described may indicate a medical emergency requiring immediate attention.",
                possible_considerations=[
                    "Acute cardiopulmonary distress or severe cardiovascular / neurological emergency.",
                    "Time-sensitive clinical conditions requiring emergency department triage."
                ],
                relevant_medical_info=[
                    "Emergency medical services are equipped to perform immediate diagnostics (ECG, vitals monitoring, oxygenation) and intervene rapidly.",
                    "Do not wait to see if symptoms subside or attempt home remedies."
                ],
                questions_for_doctor=[
                    "What emergency protocols should be activated immediately?",
                    "What is the current oxygen saturation and blood pressure?"
                ],
                safety_warning="EMERGENCY NOTICE: Call 911 / 112 / your local emergency services or proceed to the nearest emergency hospital immediately.",
                is_emergency=True,
                emergency_instructions="Call emergency medical services immediately. Do not drive yourself. Remain seated in a comfortable upright position.",
            )

        # Contextual intelligence based on query topics
        considerations = []
        medical_info = []
        questions = []

        if "diabetes" in query_lower or "metformin" in query_lower or "sugar" in query_lower:
            considerations.extend([
                "Glycemic regulation and metabolic status.",
                "Potential association with Type 1 or Type 2 Diabetes Mellitus.",
                "Medication adherence and lifestyle factors affecting insulin sensitivity."
            ])
            medical_info.extend([
                "Metformin is a first-line biguanide antihyperglycemic agent that reduces hepatic glucose production.",
                "HbA1c testing evaluates average blood glucose levels over the prior 2 to 3 months."
            ])
            questions.extend([
                "What is my target fasting and post-prandial blood glucose range?",
                "Are there dietary or renal function considerations with my current medication dosage?"
            ])

        elif "headache" in query_lower or "migraine" in query_lower:
            considerations.extend([
                "Tension-type headache, vascular/migraine headache, or sinus inflammation.",
                "Hydration, screen fatigue, sleep deprivation, or stress factors."
            ])
            medical_info.extend([
                "Primary headaches are non-structural; however, 'thunderclap' sudden onset headaches warrant urgent evaluation.",
                "Maintaining a headache diary tracking triggers (hydration, caffeine, sleep) aids clinical review."
            ])
            questions.extend([
                "Would a formal neurological evaluation or imaging be warranted if headaches increase in frequency?",
                "What non-pharmacological or prophylactic options exist for my symptoms?"
            ])

        elif "blood pressure" in query_lower or "hypertension" in query_lower:
            considerations.extend([
                "Blood pressure elevation and cardiovascular health.",
                "Sodium intake, physical activity, and stress-related sympathetic activation."
            ])
            medical_info.extend([
                "Clinical guidelines categorize sustained readings above 130/80 mmHg as hypertension requiring medical tracking.",
                "Serial morning and evening BP measurements provide a more reliable clinical picture than single readings."
            ])
            questions.extend([
                "Should home blood pressure monitoring logs be kept prior to our next visit?",
                "Are there specific dietary interventions (e.g., DASH diet) recommended for my profile?"
            ])

        else:
            considerations.extend([
                "The symptoms described may be associated with various common physiological or medical factors.",
                "Differential diagnostic assessment requires in-person clinical history, physical exam, and laboratory verification."
            ])
            medical_info.extend([
                "Symptoms should be evaluated in context with duration, progression, and personal medical history.",
                "Clinical decision support systems provide educational context but cannot substitute for direct physical examination."
            ])
            questions.extend([
                "What diagnostic tests or blood work would help clarify these symptoms?",
                "What red-flag signs should prompt me to seek urgent care?"
            ])

        # Integrate patient profile context if available
        if patient_context:
            if patient_context.get("known_allergies"):
                medical_info.append(f"Recorded patient allergies: {', '.join(patient_context['known_allergies'])}")
            if patient_context.get("chronic_conditions"):
                considerations.append(f"Existing documented history of: {', '.join(patient_context['chronic_conditions'])}")

        summary = (
            f"Based on your query regarding '{query[:100]}', here is structured health information "
            f"and clinical decision-support context to discuss with your healthcare provider."
        )

        return AIStructuredOutput(
            summary=summary,
            possible_considerations=considerations,
            relevant_medical_info=medical_info,
            questions_for_doctor=questions,
            safety_warning=MEDICAL_DISCLAIMER,
            is_emergency=False,
        )
