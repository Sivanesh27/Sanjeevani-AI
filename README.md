---
title: Sanjeevani AI API
emoji: 🏥
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Sanjeevani AI API

AI-powered healthcare backend API for the Sanjeevani platform.

# SanjeevaniAI — Industry-Grade Healthcare AI Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![HuggingFace](https://img.shields.io/badge/Model-RoBERTa--large--BC5CDR-FFD21E?style=flat&logo=huggingface&logoColor=black)](https://huggingface.co/tner/roberta-large-bc5cdr)
[![Next.js](https://img.shields.io/badge/Next.js-14.2+-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com)
[![Tests](https://img.shields.io/badge/Tests-16%2F16%20Passing-brightgreen?style=flat&logo=pytest&logoColor=white)](backend/tests)

> **Clinical Notice & Positioning**: SanjeevaniAI provides **AI-assisted healthcare information and clinical decision-support insights**. It is **not an autonomous diagnostic system** and is not a substitute for direct clinical examination, laboratory diagnosis, or emergency medical care.

---

## 🏥 Architecture Overview

```
SanjeevaniAI Platform
├── Frontend (Next.js 14 + Tailwind CSS + Lucide Icons)
│   ├── /                -> Landing page with medical disclaimer & capabilities
│   ├── /dashboard       -> Clinical intelligence overview & metrics
│   ├── /ner             -> Real-time local RoBERTa BC5CDR NER visualizer
│   ├── /reports         -> Document upload, SHA-256 integrity & analysis
│   ├── /reports/[id]    -> Structured clinical findings & raw text
│   ├── /assistant       -> Conversational AI with emergency triage
│   ├── /profile         -> Patient physiological profile & BMI
│   ├── /history         -> Traceable medical timeline
│   ├── /admin           -> System telemetry & security audit logs
│   └── /demo            -> Guided 5-step mentor presentation walkthrough
│
├── Backend (FastAPI + Async SQLAlchemy + PyTorch)
│   ├── Core & Security  -> JWT, bcrypt hashing, RBAC, Request ID, CSP headers
│   ├── ML Engine        -> Local RoBERTa-large BC5CDR (355M params, CUDA/CPU)
│   ├── Document Pipeline-> PDF/DOCX/TXT parser, chunker, entity aggregator
│   ├── AI Assistant     -> Multi-provider LLM (Gemini + Mock) & triage engine
│   └── Persistence      -> Async SQLite / PostgreSQL with audit trail
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Python**: 3.10+ (Recommended: Python 3.11)
- **Node.js**: 18.x or 20+ (with npm)
- **NVIDIA GPU (Optional)**: CUDA 11.8+ for accelerated inference (CPU fallback automatic)
- **Pretrained NER Model**: Stored locally in `models/bc5cdr-ner`

### 2. Backend Setup
```bash
# Activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
# source .venv/bin/activate    # Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Run synthetic demo database seeder
python scripts/seed_demo_data.py

# Launch FastAPI backend
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API Swagger UI will be live at `http://localhost:8000/docs`.*

### 3. Frontend Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Run Next.js development server
npm run dev
```
*Application UI will be live at `http://localhost:3000`.*

---

## 🐳 Docker Deployment

To launch the full containerized stack:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Health Check: `http://localhost:8000/api/v1/health`

---

## 🧪 Test Suite & Verification

The platform includes a comprehensive automated test suite in `backend/tests/`:

```bash
pytest backend/tests -v
```

### Verified Test Results (16/16 Passing):
- `test_auth.py`: User registration, login, JWT validation, and invalid credential handling.
- `test_ner.py`: BC5CDR model info, entity extraction, character span alignment, and 422 validation.
- `test_documents.py`: File upload, SHA-256 fingerprinting, raw text extraction, and entity linking.
- `test_chat.py`: Multi-turn consultation, patient profile injection, and heuristic red-flag emergency detection.
- `test_profile.py`: Patient profile updates, vitals calculations, and RBAC admin permission enforcement.
- `test_health.py`: Liveness and readiness probes.

---

## 👨‍🏫 Mentor Demonstration Credentials

Use the **"Demo Roles"** dropdown in the navigation bar or log in with these pre-seeded accounts:

| Account | Email | Password | Role / Access Level |
| :--- | :--- | :--- | :--- |
| **Patient** | `demo.patient@sanjeevani.ai` | `DemoPatient2026!` | Health profile, documents, AI consultation |
| **Doctor** | `demo.doctor@sanjeevani.ai` | `DemoDoctor2026!` | Clinical decision support & document review |
| **Administrator** | `demo.admin@sanjeevani.ai` | `DemoAdmin2026!` | Platform telemetry, model status, security audit logs |

---

## 📚 Technical Documentation

- 📐 [**System Architecture & Mermaid Diagrams**](docs/ARCHITECTURE.md)
- 🔌 [**REST API Catalog & OpenAPI Specification**](docs/API.md)
- 🧠 [**Machine Learning & Local RoBERTa BC5CDR Specs**](docs/ML_MODELS.md)
- 🎯 [**10-Minute Mentor Presentation Script**](docs/MENTOR_DEMO.md)
- 🔍 [**Initial Project Audit & Gap Analysis**](docs/PROJECT_AUDIT.md)

---

## 🛡️ Medical Safety & Privacy Disclaimers

1. **AI-Assisted Decision Support**: SanjeevaniAI generates educational insights to assist healthcare providers and patients. It does not issue binding clinical diagnoses or prescribe treatment plans.
2. **Emergency Triage Protocol**: If severe acute symptoms (e.g. crushing chest pain, difficulty breathing, stroke symptoms) are entered, the platform immediately presents an emergency escalation alert advising immediate contact with emergency medical services (911 / 112 / 108).
3. **Data Security**: Uploaded files are fingerprinted with SHA-256, sensitive credentials hashed with direct bcrypt, and all administrative events logged in an immutable audit table.

---

## 📄 License
MIT License. Developed for healthcare AI intelligence and clinical decision-support research.
