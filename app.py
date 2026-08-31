import os
import gradio as gr
import uvicorn
from backend.app.main import app as fastapi_app
from backend.app.ml.manager import model_manager

# ZeroGPU integration
try:
    import spaces
    HAS_SPACES = True
except ImportError:
    HAS_SPACES = False

# Explicit @spaces.GPU function bound to Gradio event for ZeroGPU verification
if HAS_SPACES:
    @spaces.GPU(duration=60)
    def gradio_ner_predict(text: str):
        if not text or not text.strip():
            return "Please provide clinical text."
        try:
            model = model_manager.get_ner_model()
            entities = model.predict(text)
            if not entities:
                return "No entities detected."
            return "\n".join([f"• [{e.label}] '{e.text}' (Confidence: {round((e.confidence or 1.0)*100, 1)}%)" for e in entities])
        except Exception as e:
            return f"Inference notice: {e}"
else:
    def gradio_ner_predict(text: str):
        if not text or not text.strip():
            return "Please provide clinical text."
        try:
            model = model_manager.get_ner_model()
            entities = model.predict(text)
            if not entities:
                return "No entities detected."
            return "\n".join([f"• [{e.label}] '{e.text}' (Confidence: {round((e.confidence or 1.0)*100, 1)}%)" for e in entities])
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
        input_text = gr.Textbox(label="Test Clinical Text", value="Metformin 500mg prescribed for type 2 diabetes mellitus and hypertension.")
        output_text = gr.Textbox(label="ZeroGPU Extracted Biomedical Entities")
    run_btn = gr.Button("⚡ Run ZeroGPU Clinical NER", variant="primary")
    run_btn.click(gradio_ner_predict, inputs=input_text, outputs=output_text)

# Mount Gradio UI onto FastAPI
gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(fastapi_app, host="0.0.0.0", port=7860)
