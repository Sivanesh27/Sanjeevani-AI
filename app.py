try:
    import spaces
    has_spaces = True
except ImportError:
    has_spaces = False

import os
import gradio as gr
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1.router import api_router
from backend.app.ml.manager import model_manager
from backend.app.core.database import init_db
from backend.app.core.config import settings

# ZeroGPU synchronous worker
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
        "This Space powers the backend REST API for **SanjeevaniAI** on ZeroGPU.\n\n"
        "- **API Health Endpoint**: `/api/v1/health`\n"
        "- **Interactive OpenAPI Swagger Docs**: `/docs`\n"
        "- **NER Analysis**: `/api/v1/ner/analyze`"
    )
    with gr.Row():
        inp = gr.Textbox(label="Test Clinical Text", value="Metformin 500mg prescribed for type 2 diabetes mellitus and hypertension.")
        out = gr.Textbox(label="ZeroGPU Extracted Biomedical Entities")
    btn = gr.Button("⚡ Run ZeroGPU Clinical NER", variant="primary")
    btn.click(fn=predict_ner, inputs=inp, outputs=out)

# 1. Enable full CORS for Vercel and cross-origin clients
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Async startup event: initialize database schema & models
@demo.app.on_event("startup")
async def startup_event():
    await init_db()
    try:
        model_manager.initialize()
    except Exception as e:
        print(f"ML Model initialization notice: {e}")

# 3. Mount all REST API endpoints under /api/v1
demo.app.include_router(api_router, prefix="/api/v1")

# 4. Convenience health check alias
@demo.app.get("/health", tags=["Health"])
async def root_health():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}

if __name__ == "__main__":
    # Disable experimental SSR so SvelteKit does not block incoming POST requests
    demo.launch(server_name="0.0.0.0", server_port=7860, ssr=False)
