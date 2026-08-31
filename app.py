try:
    import spaces
    has_spaces = True
except ImportError:
    has_spaces = False

import os
import gradio as gr
from fastapi.middleware.cors import CORSMiddleware
from backend.app.main import app as fastapi_app
from backend.app.ml.manager import model_manager
from backend.app.core.database import init_db
from backend.app.core.config import settings

# 1. ZeroGPU Synchronous Worker Function (Required by ZeroGPU supervisor)
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

# 2. Gradio Interface (Provides the @spaces.GPU event hook for ZeroGPU supervisor)
with gr.Blocks(title="SanjeevaniAI Healthcare Intelligence") as demo:
    gr.Markdown("# 🏥 SanjeevaniAI — Healthcare Intelligence Engine")
    gr.Markdown(
        "Backend REST API Engine powered by **FastAPI** on Hugging Face **ZeroGPU**.\n\n"
        "- **Health Status**: `/api/v1/health`\n"
        "- **Interactive API Docs**: `/docs`\n"
        "- **NER Analysis**: `/api/v1/ner/analyze`"
    )
    with gr.Row():
        inp = gr.Textbox(label="Test Clinical Text", value="Metformin 500mg prescribed for type 2 diabetes mellitus and hypertension.")
        out = gr.Textbox(label="ZeroGPU Extracted Biomedical Entities")
    btn = gr.Button("⚡ Run ZeroGPU Clinical NER", variant="primary")
    btn.click(fn=predict_ner, inputs=inp, outputs=out)

# 3. Add CORS middleware to demo.app for Vercel
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Inject all native FastAPI routes at Index 0 (Priority Routing over Gradio)
for route in fastapi_app.routes:
    demo.app.routes.insert(0, route)

# 5. Startup lifecycle initialization
@demo.app.on_event("startup")
async def startup_init():
    await init_db()
    try:
        model_manager.initialize()
    except Exception as e:
        print(f"ML Model initialization: {e}")

if __name__ == "__main__":
    demo.launch()
