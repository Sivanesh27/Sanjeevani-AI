import os
import hashlib
import json
import uuid
from pathlib import Path
from typing import List, Tuple, Optional
import aiofiles
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from pypdf import PdfReader
import docx2txt

from backend.app.models.document import MedicalDocument, DocumentAnalysis
from backend.app.models.entity import MedicalEntity
from backend.app.repositories.document_repo import DocumentRepository
from backend.app.repositories.audit_repo import AuditRepository
from backend.app.ml.manager import model_manager
from backend.app.schemas.ner import NERRequest
from backend.app.core.config import settings
from backend.app.core.logger import logger
from backend.app.core.exceptions import DocumentProcessingError, ResourceNotFoundError


class DocumentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.doc_repo = DocumentRepository(db)
        self.audit_repo = AuditRepository(db)
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def process_document_upload(
        self,
        file: UploadFile,
        user_id: str,
        ip_address: Optional[str] = None
    ) -> MedicalDocument:
        filename = file.filename or "unknown_file"
        file_ext = filename.split(".")[-1].lower() if "." in filename else ""

        if file_ext not in settings.ALLOWED_EXTENSIONS:
            raise DocumentProcessingError(
                message=f"File extension '.{file_ext}' is not supported. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        content = await file.read()
        file_size = len(content)

        if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise DocumentProcessingError(
                message=f"File size exceeds maximum permitted limit ({settings.MAX_UPLOAD_SIZE_MB}MB)."
            )

        file_hash = hashlib.sha256(content).hexdigest()
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        saved_path = self.upload_dir / unique_filename

        # Write to disk securely
        async with aiofiles.open(saved_path, "wb") as out_file:
            await out_file.write(content)

        # Create Document record
        doc = MedicalDocument(
            user_id=user_id,
            filename=unique_filename,
            original_filename=filename,
            file_path=str(saved_path),
            file_type=file_ext,
            file_size=file_size,
            file_hash=file_hash,
            status="PROCESSING",
        )
        saved_doc = await self.doc_repo.create(doc)

        try:
            # 1. Text Extraction
            raw_text = self._extract_text(saved_path, file_ext)
            if not raw_text.strip():
                raise DocumentProcessingError(message="No readable text could be extracted from the document.")

            cleaned_text = self._normalize_text(raw_text)

            # 2. Biomedical NER via local RoBERTa-large BC5CDR
            ner_service = model_manager.get_ner_service()
            # Process in overlapping chunks of up to 1000 characters
            chunks = self._chunk_text(cleaned_text, max_chars=1000)
            all_entities = []

            for chunk, offset in chunks:
                ner_resp = ner_service.analyze_text(NERRequest(text=chunk))
                for ent in ner_resp.entities:
                    ent.start += offset
                    ent.end += offset
                    all_entities.append(ent)

            # Deduplicate entities
            unique_conditions = list(set([e.text for e in all_entities if e.label == "DISEASE"]))
            unique_medications = list(set([e.text for e in all_entities if e.label == "CHEMICAL"]))

            # 3. Clinical Summarization & Findings
            summary, findings, recs = self._generate_clinical_summary(
                cleaned_text, unique_conditions, unique_medications
            )

            # 4. Save Analysis
            analysis = DocumentAnalysis(
                document_id=saved_doc.id,
                raw_text=raw_text[:50000],  # bounded storage
                cleaned_text=cleaned_text[:50000],
                summary=summary,
                important_findings=json.dumps(findings),
                detected_conditions=json.dumps(unique_conditions),
                detected_medications=json.dumps(unique_medications),
                clinical_recommendations=recs,
            )
            saved_analysis = await self.doc_repo.save_analysis(analysis)

            # 5. Save Medical Entities
            entity_records = [
                MedicalEntity(
                    analysis_id=saved_analysis.id,
                    text=e.text,
                    label=e.label,
                    start_offset=e.start,
                    end_offset=e.end,
                    confidence=e.confidence,
                    model_name=e.model,
                )
                for e in all_entities[:100]  # Store top detected entities
            ]
            if entity_records:
                await self.doc_repo.save_entities(entity_records)

            # 6. Update document status
            saved_doc.status = "COMPLETED"
            await self.doc_repo.update(saved_doc)

            # 7. Audit & History
            await self.audit_repo.add_history(
                user_id=user_id,
                action_type="REPORT_ANALYSIS",
                description=f"Analyzed medical document '{filename}'",
                entity_count=len(all_entities),
                reference_id=saved_doc.id,
            )
            await self.audit_repo.log_event(
                action="DOCUMENT_UPLOAD_PROCESSED",
                user_id=user_id,
                ip_address=ip_address,
                details=f"Document {saved_doc.id} processed ({len(all_entities)} entities detected)",
            )

            return await self.doc_repo.get_document_details(saved_doc.id, user_id)

        except Exception as e:
            logger.error(f"Error processing document {saved_doc.id}: {str(e)}", exc_info=True)
            saved_doc.status = "FAILED"
            saved_doc.error_message = str(e)
            await self.doc_repo.update(saved_doc)
            raise DocumentProcessingError(message=f"Failed to analyze medical document: {str(e)}")

    def _extract_text(self, file_path: Path, file_ext: str) -> str:
        if file_ext == "pdf":
            reader = PdfReader(str(file_path))
            text_parts = [page.extract_text() or "" for page in reader.pages]
            return "\n".join(text_parts)
        elif file_ext == "docx":
            return docx2txt.process(str(file_path)) or ""
        elif file_ext == "txt":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        return ""

    def _normalize_text(self, text: str) -> str:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        return "\n".join(lines)

    def _chunk_text(self, text: str, max_chars: int = 1000) -> List[Tuple[str, int]]:
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + max_chars, len(text))
            chunks.append((text[start:end], start))
            if end == len(text):
                break
            start += max_chars - 100  # 100 char overlap
        return chunks

    def _generate_clinical_summary(
        self, text: str, conditions: List[str], medications: List[str]
    ) -> Tuple[str, List[str], str]:
        findings = []
        if conditions:
            findings.append(f"Detected potential medical conditions/indications: {', '.join(conditions[:8])}.")
        if medications:
            findings.append(f"Identified pharmaceutical agents/chemicals: {', '.join(medications[:8])}.")

        summary = (
            f"Medical document extraction completed. The document references "
            f"{len(conditions)} clinical condition(s) and {len(medications)} pharmaceutical/chemical entity(s)."
        )

        recs = (
            "Extracted entities and automated summaries are provided for decision-support and educational review only. "
            "All findings, dosages, and treatment plans should be verified by a licensed healthcare provider."
        )

        return summary, findings, recs
