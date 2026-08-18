# SanjeevaniAI — REST API Reference (v1)

Base URL: `http://localhost:8000/api/v1`  
Interactive OpenAPI UI: `http://localhost:8000/docs`  
ReDoc UI: `http://localhost:8000/redoc`

All successful responses follow the standardized JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional descriptive status",
  "request_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "timestamp": "2026-08-18T21:00:00Z"
}
```

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
Create a new patient, clinician, or administrator account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "Dr. Sarah Jenkins",
  "role": "DOCTOR"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 7200,
    "user": {
      "id": "c1f725a2-9426-4d1e-84b2-f3e498c0b5f1",
      "email": "user@example.com",
      "full_name": "Dr. Sarah Jenkins",
      "role": "DOCTOR",
      "is_active": true
    }
  }
}
```

### `POST /auth/login`
Authenticate user with email and password.

---

## 2. Biomedical NER Endpoints (`/ner`)

### `POST /ner/analyze`
Extract biomedical entities from arbitrary clinical text using the local RoBERTa-large BC5CDR model.

**Request Body:**
```json
{
  "text": "The patient was prescribed metformin 500mg and lisinopril 10mg for type 2 diabetes mellitus and hypertension."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "model": {
      "name": "roberta-large-bc5cdr",
      "version": "1.0.0",
      "provider": "local_pytorch",
      "device": "cuda:0",
      "status": "ready"
    },
    "entities": [
      {
        "text": "metformin",
        "label": "CHEMICAL",
        "start": 27,
        "end": 36,
        "confidence": 0.9998,
        "model": "roberta-large-bc5cdr"
      },
      {
        "text": "lisinopril",
        "label": "CHEMICAL",
        "start": 47,
        "end": 57,
        "confidence": 0.9996,
        "model": "roberta-large-bc5cdr"
      },
      {
        "text": "type 2 diabetes mellitus",
        "label": "DISEASE",
        "start": 68,
        "end": 92,
        "confidence": 0.9985,
        "model": "roberta-large-bc5cdr"
      },
      {
        "text": "hypertension",
        "label": "DISEASE",
        "start": 97,
        "end": 109,
        "confidence": 0.9992,
        "model": "roberta-large-bc5cdr"
      }
    ],
    "entity_count": 4,
    "processing_time_ms": 14.8,
    "text_length": 110
  }
}
```

### `GET /ner/model-info`
Retrieve local model health, hardware device allocation, and parameter footprint.

---

## 3. Medical Document Management (`/documents`)

### `POST /documents/upload`
Upload a medical report (multipart/form-data: PDF, DOCX, TXT).  
Automatically extracts text, computes SHA-256 integrity hash, runs local BC5CDR entity recognition, and generates a non-diagnostic summary.

### `GET /documents`
List all uploaded reports for the authenticated user.

### `GET /documents/{document_id}`
Retrieve full structured analysis, raw text, and identified entity spans for a specific document.

### `DELETE /documents/{document_id}`
Permanently remove a document and its associated analysis.

---

## 4. AI Consultation Assistant (`/chat`)

### `POST /chat/message`
Send a clinical query to the AI assistant with automatic patient profile injection and red-flag triage.

**Request Body:**
```json
{
  "message": "What are typical lifestyle considerations for managing Type 2 Diabetes?",
  "conversation_id": null
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversation_id": "d3b07384-d113-4632-bc5d-8521c7d2427a",
    "message": {
      "id": "e4a18295-e224-4743-9d7e-9632d8e3538b",
      "role": "assistant",
      "content": "Type 2 Diabetes management involves glycemic control, balanced nutrition, and regular physical activity.",
      "structured_data": {
        "summary": "Educational guidance on Type 2 Diabetes management strategies.",
        "possible_considerations": [
          "Consistent carbohydrate counting and complex fiber intake improve postprandial glucose stability.",
          "Regular aerobic and resistance exercise enhances insulin sensitivity."
        ],
        "questions_for_doctor": [
          "What is my target HbA1c range given my current medication regimen?",
          "Should I consult a certified diabetes educator (CDCES)?"
        ],
        "safety_warning": "SanjeevaniAI provides decision-support information, not definitive diagnosis. Always consult your physician.",
        "is_emergency": false,
        "emergency_instructions": null
      },
      "model_provider": "Google Gemini / Local Clinical Engine"
    },
    "disclaimer": "SanjeevaniAI provides AI-assisted healthcare information and decision-support insights. It is not a substitute for professional medical diagnosis, treatment, or emergency care."
  }
}
```

---

## 5. Patient Profile (`/profile`)

### `GET /profile`
Retrieve authenticated user's clinical profile.

### `PUT /profile`
Update age, gender, blood group, height, weight, allergies, chronic conditions, and current medications.

---

## 6. History & Timeline (`/history`)

### `GET /history?limit=50`
Retrieve chronological activity records with entity counts and timestamps.

---

## 7. Administrator Telemetry & Auditing (`/admin`)

### `GET /admin/stats` (Admin Only)
Platform aggregates: total users, total documents, extracted entities count, and neural model device status.

### `GET /admin/audit-logs?limit=100` (Admin Only)
Security audit records covering logins, uploads, deletions, and administrative actions.
