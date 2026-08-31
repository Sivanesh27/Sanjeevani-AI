import spaces  # ZeroGPU MUST be imported on line 1
import os
import uvicorn
import gradio as gr
from backend.app.main import app as fastapi_app
from backend.app.ml.manager import model_manager

# 1. ZeroGPU Inference Function (Registered with ZeroGPU supervisor)
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

# 2. Gradio Interface (Provides the @spaces.GPU hook for ZeroGPU supervisor)
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

# 3. Mount Gradio under /gradio so FastAPI natively controls root / and /api/v1/ with ZERO SvelteKit interference
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

# 4. Launch the single blocking uvicorn server on port 7860
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860, log_level="info")
