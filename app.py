try:
    import spaces
    has_spaces = True
except ImportError:
    has_spaces = False

import os
import gradio as gr
from backend.app.api.v1.router import api_router
from backend.app.ml.manager import model_manager
from backend.app.core.config import settings

# Initialize model manager at startup
try:
    model_manager.initialize()
except Exception as e:
    print(f"ML Model initialization: {e}")

if has_spaces:
    @spaces.GPU
    def predict_ner(text: str):
        if not text or not text.strip():
            return "Please provide clinical text."
        try:
            model = model_manager.get_ner_model()
            results = model.predict(text)
            if not results:
                return "No biomedical entities detected."
            return "\n".join([f"• [{e.label}] {e.text} (Confidence: {round((e.confidence or 1.0)*100, 1)}%)" for e in results])
        except Exception as e:
            return f"Inference notice: {e}"
else:
    def predict_ner(text: str):
        if not text or not text.strip():
            return "Please provide clinical text."
        try:
            model = model_manager.get_ner_model()
            results = model.predict(text)
            if not results:
                return "No biomedical entities detected."
            return "\n".join([f"• [{e.label}] {e.text} (Confidence: {round((e.confidence or 1.0)*100, 1)}%)" for e in results])
        except Exception as e:
            return f"Inference notice: {e}"

with gr.Blocks(title="SanjeevaniAI Healthcare API") as demo:
    gr.Markdown("# 🏥 SanjeevaniAI — Healthcare Intelligence API Engine")
    gr.Markdown(
        "This Space powers the backend REST API for **SanjeevaniAI** (FastAPI + Local RoBERTa BC5CDR Named Entity Recognition on ZeroGPU).\n\n"
        "- **API Health Endpoint**: `/api/v1/health`\n"
        "- **Interactive OpenAPI Swagger Docs**: `/docs`\n"
        "- **NER Analysis**: `/api/v1/ner/analyze`"
    )
    with gr.Row():
        inp = gr.Textbox(label="Test Clinical Text", value="Metformin 500mg prescribed for type 2 diabetes mellitus and hypertension.")
        out = gr.Textbox(label="ZeroGPU Extracted Biomedical Entities")
    btn = gr.Button("⚡ Run ZeroGPU Clinical NER", variant="primary")
    btn.click(fn=predict_ner, inputs=inp, outputs=out)

# Mount all FastAPI routes directly onto Gradio's internal web server
@demo.app.get("/api/v1/health", tags=["Health"])
def gradio_health():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION, "hardware": "ZeroGPU"}

@demo.app.get("/health", tags=["Health"])
def root_health():
    return {"status": "healthy", "app": settings.APP_NAME}

# Include all REST API routes (/api/v1/auth, /api/v1/ner, /api/v1/documents, /api/v1/chat)
demo.app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
