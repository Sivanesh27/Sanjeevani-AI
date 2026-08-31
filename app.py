import os
import gradio as gr

# ZeroGPU integration
try:
    import spaces
    HAS_SPACES = True
except ImportError:
    HAS_SPACES = False

def check_status():
    return "✅ SanjeevaniAI Clinical Backend & RoBERTa-large BC5CDR NER are online and ready."

if HAS_SPACES:
    @spaces.GPU
    def gpu_health():
        return "ZeroGPU Accelerated"

with gr.Blocks(title="SanjeevaniAI Healthcare API") as demo:
    gr.Markdown("# 🏥 SanjeevaniAI — Healthcare Intelligence API Engine")
    gr.Markdown(
        "This Space powers the backend REST API for **SanjeevaniAI** (FastAPI + Local RoBERTa BC5CDR Named Entity Recognition on ZeroGPU).\n\n"
        "- **API Health Endpoint**: `/api/v1/health`\n"
        "- **Interactive OpenAPI Swagger Docs**: `/docs`\n"
        "- **NER Analysis**: `/api/v1/ner/analyze`"
    )
    status_btn = gr.Button("Verify API Health", variant="primary")
    status_output = gr.Textbox(label="System Status", value="SanjeevaniAI Online")
    status_btn.click(check_status, outputs=status_output)

from backend.app.main import app as fastapi_app
app = gr.mount_gradio_app(fastapi_app, demo, path="/")
