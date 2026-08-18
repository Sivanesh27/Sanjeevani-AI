# SanjeevaniAI — Comprehensive Project Audit

**Audit Date:** August 18, 2026  
**Auditor:** Lead Software Architect & ML/DevOps Engineer  
**Project Path:** `D:\SanjeevaniAI`  
**Repository State:** Initialized with pretrained ML models and clinical datasets; core application layers (Frontend, FastAPI Backend, Database, Auth, APIs) require development.

---

## 1. Executive Summary

SanjeevaniAI is an AI-powered healthcare intelligence and decision-support platform designed to assist clinicians and patients with biomedical named entity recognition (NER), medical document analysis, clinical summarization, health profiling, and interactive AI consultation.

An in-depth audit of `D:\SanjeevaniAI` reveals high-value pretrained machine learning assets—most notably a locally verified `tner/roberta-large-bc5cdr` biomedical NER model and extensive clinical/pharmacological datasets—alongside an empty application scaffold (`app/`, `clinical_engine/`, `rag/`, `evaluation/`).

This document details the existing state, inventory of models and datasets, technical debt, and provides an actionable blueprint for constructing a production-grade, HIPAA/privacy-conscious, modular healthcare system.

---

## 2. Directory Structure & Asset Inventory

```
D:\SanjeevaniAI\
├── .venv/                         # Python 3.11.9 Virtual Environment with PyTorch & Transformers
├── checkpoints/                   # TrOCR training checkpoints (epoch 1-3)
├── datasets/                      # Rich clinical and NLP datasets
│   ├── clinical/
│   │   ├── ddi/                   # Drug-Drug Interaction dataset (CSV)
│   │   ├── ddi_severity/          # DDI Database with severity ratings (JSON)
│   │   ├── medicines_250k/        # 250,000+ Medicine dataset (CSV)
│   │   └── mid/                   # Medical Information Database & Therapeutic class counts (XLSX)
│   ├── intent/                    # CLINC150 Intent Classification data
│   ├── ner/
│   │   └── bc5cdr/                # BC5CDR BioCreative V CDR Corpus data & loader
│   ├── ocr/                       # Prescription & medical text OCR samples
│   ├── speech/                    # Audio speech samples for medical transcription
│   └── translation/               # Parallel translation benchmarks
├── models/                        # Pretrained & fine-tuned model store
│   ├── bc5cdr-ner/                # ⭐ Verified Local RoBERTa-large BC5CDR NER Model
│   │   ├── config.json            # RobertaForTokenClassification (Chemical & Disease tags)
│   │   ├── pytorch_model.bin      # Pretrained PyTorch weights (~1.4 GB)
│   │   ├── merges.txt, vocab.json # BPE Tokenizer assets
│   │   ├── tokenizer_config.json
│   │   └── eval/                  # Metric files (F1: 88.4%, Chemical F1: 92.6%, Disease F1: 83.4%)
│   ├── gguf/                      # Quantized LLM weights store
│   ├── pretrained/                # Base Hugging Face model repositories
│   │   ├── biomedbert/            # Microsoft BiomedNLP-BiomedBERT-base-uncased
│   │   ├── indictrans_en_indic/   # IndicTrans2 English to Indic translation
│   │   ├── indictrans_indic_indic/# IndicTrans2 Indic to Indic translation
│   │   ├── intent/                # DistilBERT for intent classification
│   │   ├── sapbert/               # SapBERT biomedical entity representation
│   │   ├── trocr/                 # Microsoft TrOCR base printed
│   │   └── whisper/               # OpenAI Whisper base speech-to-text
│   └── trained/                   # Custom fine-tuned weights output directory
├── app/                           # [EMPTY] Target directory for FastAPI modular backend
├── clinical_engine/               # [EMPTY] Clinical decision support engine
├── evaluation/                    # [EMPTY] ML evaluation scripts
├── rag/                           # [EMPTY] Retrieval-Augmented Generation subsystem
├── scripts/                       # Maintenance & training utilities
│   ├── download_models.py         # Hugging Face snapshot downloader
│   ├── prepare_mobile_ocr.py      # Mobile OCR preprocessing pipeline
│   ├── test_models.py             # Integrity checker for model weights
│   ├── test_trocr_load.py         # TrOCR loading script
│   └── train_trocr.py             # TrOCR fine-tuning workflow
├── training/                      # Training scripts
│   ├── intent/                    # Intent classification fine-tuning
│   ├── ner/                       # Token classification fine-tuning (train_ner.py)
│   └── ocr/                       # TrOCR training and evaluation
├── README.md                      # [EMPTY - 0 bytes] Needs comprehensive documentation
└── requirements.txt               # [BASIC] Missing FastAPI, SQLAlchemy, Alembic, Pydantic, etc.
```

---

## 3. Existing Machine Learning Models Verification

### 3.1 Local Biomedical NER Model (`models/bc5cdr-ner`)
* **Architecture:** `RobertaForTokenClassification` fine-tuned on BioCreative V CDR (BC5CDR).
* **Entity Classes:**
  * `0: O` (Outside)
  * `1: B-Chemical` (Beginning of Chemical/Drug name)
  * `2: B-Disease` (Beginning of Disease/Condition name)
  * `3: I-Disease` (Inside of Disease name)
  * `4: I-Chemical` (Inside of Chemical name)
* **Performance:** Overall F1: `88.41%` (Chemical F1: `92.57%`, Disease F1: `83.38%`).
* **Live Inference Verification:**
  * Successfully loaded onto CUDA (`cuda:0`) via HuggingFace `pipeline("ner")`.
  * Sample: *"The patient was prescribed metformin for type 2 diabetes mellitus."*
  * Result: `Chemical: metformin (confidence 0.9998)`, `Disease: type 2 diabetes mellitus (confidence 0.9985)`.
* **Deployment Consideration:** The model weights are ~1.4GB. The FastAPI application must load the model once as a singleton during application startup (`lifespan` handler) to prevent latency penalties on individual requests.

---

## 4. Technology Stack & Environment Assessment

| Subsystem | Existing State | Target Production Architecture |
| :--- | :--- | :--- |
| **Python Environment** | Python 3.11.9 with PyTorch 2.8.0 (CUDA 12.9), Transformers 4.57.1 | Extend `.venv` with FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, python-jose, passlib, pypdf, httpx |
| **Node.js Environment** | Node.js v22.17.0, npm 10.9.2 | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Radix/shadcn UI, TanStack Query |
| **Backend Framework** | None (Empty `app/` folder) | FastAPI with modular layered architecture (`api/v1`, `services`, `repositories`, `models`, `ml`) |
| **Database** | None | PostgreSQL (production/docker) & SQLite (aiosqlite dev fallback) via SQLAlchemy async engine + Alembic |
| **Authentication** | None | Secure JWT auth with refresh tokens, Argon2/Bcrypt password hashing, Role-Based Access Control (RBAC) |
| **Document Processing** | None | Multi-format extraction pipeline (PDF via `pypdf`/`pdfplumber`, TXT, DOCX), sanitization, entity linking |
| **AI LLM Provider** | None | Abstract `LLMProvider` with `GeminiProvider` (Google GenAI), `OpenAIProvider`, and `MockLLMProvider` |
| **Task Queue / Cache** | None | Redis with Celery / FastAPI async background tasks fallback |
| **Containerization** | None | Multi-stage `Dockerfile` (Backend & Frontend) + `docker-compose.yml` (App, DB, Redis, Worker) |

---

## 5. Identified Gaps & Technical Problems

1. **Missing Backend Application Layer:** The `app/` directory is completely empty. There are no API routers, service layers, Pydantic schemas, or data models.
2. **Missing Frontend Client:** No Next.js or React frontend exists. All UI interactions, dashboards, and visualizations must be built from scratch.
3. **Missing Database Schemas & Migrations:** No relational tables or Alembic migration environments are established.
4. **Missing Authentication & Authorization:** No user identity, session management, or RBAC controls exist.
5. **No Medical Safety Guards:** AI responses need guardrails distinguishing extracted facts from AI considerations, with clear disclaimers that SanjeevaniAI is not an autonomous diagnostic device.
6. **No API Documentation & Health Probes:** Missing OpenAPI schemas, `/health`, and `/ready` endpoints.
7. **No Automated Test Suites:** Missing unit, integration, and ML inference validation tests.

---

## 6. Recommended Migration & Architecture Plan

1. **Preserve High-Value Data & Models:** Retain all files under `models/` (especially `models/bc5cdr-ner`) and `datasets/`.
2. **Build Modular FastAPI Backend:** Implement clean separation of concerns:
   `Router -> Schema Validation -> Service Layer -> Repository / ML Engine -> Database`.
3. **Build Modern Next.js TypeScript Frontend:** Modern healthcare SaaS UI with responsive sidebar, dark/light clinical theme, accessible components, and interactive NER visualizer.
4. **Implement Local ML Adapter (`MLManager`):** Encapsulate `models/bc5cdr-ner` with cached singleton lifecycle, warm-up routines, and fallback error handling.
5. **Implement Resilient Document Pipeline:** Secure upload handler with MIME validation, SHA256 hashing, structured entity extraction, and clinical summarization.
6. **Implement Multi-Provider LLM Engine:** Pluggable AI Assistant supporting Google Gemini with fallback to MockLLM for offline development.
7. **Provide Complete DevOps & Testing Tooling:** Alembic migrations, Pytest suite, Jest/React testing, Docker Compose configurations, and comprehensive documentation.
