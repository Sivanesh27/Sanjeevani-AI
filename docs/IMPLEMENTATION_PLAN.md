# SanjeevaniAI — Implementation Plan

## Phase Overview

The construction of **SanjeevaniAI** follows a disciplined 15-phase engineering roadmap designed to deliver a robust, modular, testable, and presentation-ready healthcare AI platform.

---

## Roadmap

### Phase 1: Architecture & Project Audit (Completed)
- [x] Complete directory scan and asset inventory
- [x] Model verification for `models/bc5cdr-ner` (RoBERTa-large BC5CDR Token Classification)
- [x] Create `docs/PROJECT_AUDIT.md` and `docs/IMPLEMENTATION_PLAN.md`
- [x] Establish architecture diagrams and technical specifications

### Phase 2: Environment Configuration & Dependencies
- [ ] Update `requirements.txt` with FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, python-jose, passlib, pypdf, httpx, uvicorn, redis, etc.
- [ ] Create `.env.example` and default `.env` configuration
- [ ] Install missing backend packages into `D:\SanjeevaniAI\.venv`

### Phase 3: Backend Foundation & Modular Architecture
- [ ] Scaffold `backend/` directory structure:
  - `app/main.py`: Application factory with lifespan event handling, CORS, rate limiting, and exception handlers
  - `app/core/`: Settings (`config.py`), security (`security.py`), logging (`logger.py`), exceptions (`exceptions.py`)
  - `app/api/v1/`: API Routers for auth, users, ner, documents, chat, history, profile, and admin
  - `app/models/`: SQLAlchemy ORM models (users, profiles, documents, entities, conversations, audit_logs)
  - `app/schemas/`: Pydantic validation schemas
  - `app/repositories/`: Data access layer
  - `app/services/`: Business logic layer
  - `app/ml/`: Model manager & local NER adapter
  - `app/middleware/`: Request ID, audit logging, security headers

### Phase 4: Local Biomedical NER Model Integration
- [ ] Implement `app/ml/ner/base.py` (Abstract NER interface)
- [ ] Implement `app/ml/ner/bc5cdr.py` (Local RoBERTa-large BC5CDR inference engine)
- [ ] Implement `app/ml/ner/service.py` & `app/ml/manager.py` (Lifecycle, warmup, error isolation, batch inference)
- [ ] Expose `POST /api/v1/ner/analyze` with confidence scores, offsets, entity types (`CHEMICAL`, `DISEASE`), and model metadata
- [ ] Unit & integration tests for NER pipeline

### Phase 5: Database Schema & Migrations
- [ ] Configure SQLAlchemy async engine (supporting PostgreSQL with SQLite dev fallback)
- [ ] Define normalized models: `User`, `Role`, `PatientProfile`, `MedicalDocument`, `DocumentAnalysis`, `MedicalEntity`, `AIConversation`, `AIMessage`, `AuditLog`
- [ ] Setup Alembic migration environment (`alembic/`)
- [ ] Generate and apply baseline database migration

### Phase 6: Authentication & Authorization (RBAC)
- [ ] Secure JWT authentication (Access & Refresh tokens)
- [ ] Password hashing via Argon2 / Bcrypt
- [ ] RBAC for `USER`, `PATIENT`, `DOCTOR`, `ADMIN`
- [ ] Endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`

### Phase 7: Medical Document Analysis Pipeline
- [ ] Secure multi-format text extraction (`PDF`, `TXT`, `DOCX`)
- [ ] Filename sanitization, SHA256 integrity hashing, size limits
- [ ] Pipeline: Upload -> Text Extraction -> Normalization -> BC5CDR NER -> Clinical Summarization -> Structured Storage
- [ ] Endpoints: `POST /api/v1/documents/upload`, `GET /api/v1/documents`, `GET /api/v1/documents/{id}`, `DELETE /api/v1/documents/{id}`

### Phase 8: AI Medical Assistant & Multi-Provider Abstraction
- [ ] Implement `BaseLLMProvider`, `GeminiProvider` (Google GenAI API), and `MockLLMProvider` (offline fallback)
- [ ] Strict clinical safety guardrails (extracted facts vs. AI considerations, emergency disclaimers, no speculative diagnoses)
- [ ] Endpoints: `POST /api/v1/chat/completions`, `GET /api/v1/chat/conversations`, `DELETE /api/v1/chat/conversations/{id}`

### Phase 9: Patient Profile, Medical History & Audit Logging
- [ ] Patient profile management (`GET`/`PUT /api/v1/profile`)
- [ ] Chronological medical timeline (`GET /api/v1/history`)
- [ ] Structured security audit logger for sensitive events (`LOGIN`, `DOCUMENT_UPLOAD`, `AI_ANALYSIS`, `ADMIN_ACTION`)

### Phase 10: Frontend Foundation (Next.js 14+ / React / Tailwind)
- [ ] Initialize Next.js TypeScript project in `frontend/`
- [ ] Configure Tailwind CSS, Lucide React icons, and accessible component library
- [ ] Create layout architecture: Sidebar navigation, Header, Breadcrumbs, Dark/Light theme, Clinical Disclaimer Banner
- [ ] Setup API Client with Axios/TanStack Query and JWT authentication context

### Phase 11: Frontend Pages & Features
- [ ] **Landing Page (`/`)**: Hero, product capabilities, architecture overview, medical safety disclaimer
- [ ] **Auth Pages (`/login`, `/register`)**: Accessible forms with Zod validation
- [ ] **Dashboard (`/dashboard`)**: Summary metric cards, recent document analyses, detected conditions, activity timeline
- [ ] **Biomedical NER Visualizer (`/ner`)**: Dedicated mentor demo page with live entity highlighting (`CHEMICAL` / `DISEASE`), confidence metrics, and execution latency
- [ ] **Medical Document Manager (`/reports`, `/reports/[id]`)**: Drag-and-drop file upload, progress bar, clinical entity viewer, summary export
- [ ] **AI Assistant Interface (`/assistant`)**: Conversational UI, structured medical guidance, chat history, emergency alerts
- [ ] **Patient Profile & Timeline (`/profile`, `/history`)**: Editable vitals/allergies/medications and chronological action history
- [ ] **Admin & System Health (`/admin`)**: User statistics, model usage metrics, system logs, audit trails
- [ ] **Mentor Demonstration Mode (`/demo`)**: Synthetic patient flow for 10-minute presentation

### Phase 12: Seed Data & Testing Suites
- [ ] Synthetic seed generator: `scripts/seed_demo_data.py` (No real patient data)
- [ ] Backend test suite: `pytest` covering auth, NER, document analysis, RBAC, error handlers
- [ ] Frontend validation: Lint, TypeScript build verification

### Phase 13: Containerization & Docker Setup
- [ ] `backend/Dockerfile` and `frontend/Dockerfile`
- [ ] `docker-compose.yml` (Backend, Frontend, PostgreSQL, Redis)
- [ ] Model volume mounting configuration

### Phase 14: CI/CD & Security Auditing
- [ ] GitHub Actions workflows: `.github/workflows/test.yml`, `.github/workflows/lint.yml`
- [ ] Security hardening: Rate limiting, CORS policies, XSS/CSRF headers, path traversal protection

### Phase 15: Documentation & Presentation Package
- [ ] Root `README.md`
- [ ] `docs/ARCHITECTURE.md` (with Mermaid diagrams)
- [ ] `docs/API.md` (OpenAPI specification & curl examples)
- [ ] `docs/ML_MODELS.md` (BC5CDR NER specs & performance metrics)
- [ ] `docs/MENTOR_DEMO.md` (Step-by-step 10-15 minute demonstration script)
