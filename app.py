import spaces  # ZeroGPU MUST be imported on line 1 before any framework
import os
import gradio as gr
from backend.app.main import app as fastapi_app
from backend.app.ml.manager import model_manager

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

# Mount FastAPI app onto Gradio
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
