# SanjeevaniAI — Mentor Presentation & Technical Demonstration Guide

**Duration**: 10–15 Minutes  
**Target Audience**: Technical Mentors, Senior Architects, Faculty Evaluators

---

## 🎯 Executive Pitch (1 Minute)
> *"SanjeevaniAI is an industry-grade healthcare intelligence and clinical decision-support platform designed to assist healthcare professionals and patients with biomedical named entity recognition, medical report analysis, and structured conversational AI consultation. It runs a fine-tuned RoBERTa-large BC5CDR model completely locally on disk without third-party NER dependencies, enforces strict non-diagnostic clinical safety boundaries, and provides an immutable audit trail."*

---

## 📋 Demonstration Flow

### Stage 1: Local Neural Model Verification (3 Minutes)
1. Navigate to `/ner` (Biomedical NER Visualizer).
2. **Show the Mentor**:
   - Status badge confirms model loaded locally from `D:\SanjeevaniAI\models\bc5cdr-ner`.
   - Hardware device indicates active acceleration (`cuda:0` / `CPU`).
3. Click the preset: **"Diabetes & Hypertension (Standard Case)"**.
4. Click **"Run BC5CDR Inference"**.
5. **Key Talking Points**:
   - Notice the exact token highlight: `metformin` and `lisinopril` tagged in **emerald** as `CHEMICAL`, `type 2 diabetes mellitus` and `hypertension` tagged in **rose** as `DISEASE`.
   - Sub-word token BPE reconstruction correctly handles multi-word entities and punctuation.
   - Inference completes in under **20 milliseconds** with confidence scores $>99.8\%$.

---

### Stage 2: Medical Report Ingestion & Structured Extraction (3 Minutes)
1. Navigate to `/reports`.
2. Inspect the pre-loaded synthetic report: `Metabolic_Panel_Report_2026.txt`.
3. Click **"View Analysis"** (`/reports/[id]`).
4. **Key Talking Points**:
   - Shows SHA-256 fingerprinting for tamper-evidence.
   - Shows automated extraction of key findings, aggregated conditions, and pharmacological agents.
   - Non-diagnostic summary language: framed strictly as educational decision support.

---

### Stage 3: Conversational Clinical AI & Emergency Triage (4 Minutes)
1. Navigate to `/assistant`.
2. **Standard Query Demo**:
   - Ask: *"Why is metformin taken with meals and what are typical gastrointestinal side effects?"*
   - Show structured response output:
     - 📝 Clinical Summary
     - 💡 Considerations (extended-release formulations, Vitamin B12 absorption)
     - ❓ Questions to ask your doctor
     - ⚠️ Medical disclaimer
3. **Emergency Red-Flag Triage Demo**:
   - Click the prompt: *"I am having severe crushing chest pain, shortness of breath, and left arm numbness."*
   - **Show the Mentor**:
     - System triggers the **emergency triage heuristic engine**.
     - Prominently displays the **Red Emergency Alert Banner** directing the user to call 911 / 112 / 108 or proceed to the nearest emergency department immediately.

---

### Stage 4: Patient Longitudinal Health Profile & Timeline (2 Minutes)
1. Navigate to `/profile`.
2. Show the real-time BMI calculator, allergies list, chronic conditions, and current medications.
3. Explain how this clinical profile is automatically injected as context into the AI consultation assistant.
4. Navigate to `/history` to show the chronological activity log with entity counts and timestamps.

---

### Stage 5: System Telemetry & Security Audit Trail (2 Minutes)
1. Click **"Demo Roles"** in the top navigation bar and select **"Admin"** (or log in as `demo.admin@sanjeevani.ai` / `DemoAdmin2026!`).
2. Navigate to `/admin`.
3. **Show the Mentor**:
   - Real-time platform aggregates: Total Users, Processed Documents, Extracted Biomedical Entities.
   - Live hardware status of the local RoBERTa model.
   - Tamper-evident Security Audit Log recording logins, report uploads, and consultation events.

---

## 🔑 Pre-Seeded Demonstration Accounts

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Patient** | `demo.patient@sanjeevani.ai` | `DemoPatient2026!` | Standard patient portal, health profile, medical documents |
| **Doctor** | `demo.doctor@sanjeevani.ai` | `DemoDoctor2026!` | Clinician decision support and report review |
| **Administrator** | `demo.admin@sanjeevani.ai` | `DemoAdmin2026!` | System telemetry, model health, and security audit logs |
