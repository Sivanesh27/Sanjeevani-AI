import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import gradio as gr
from backend.app.api.v1.router import api_router

with gr.Blocks() as demo:
    gr.Markdown("# SanjeevaniAI Engine")

# Mount the api routers directly onto demo.app
demo.app.include_router(api_router, prefix="/api/v1")

# Launch with ssr_mode=False to disable SvelteKit SSR completely!
app_instance, local_url, share_url = demo.launch(
    ssr_mode=False,
    prevent_thread_lock=True,
    server_name="127.0.0.1",
    server_port=7865,
)

print("SUCCESS: Launched with ssr_mode=False on", local_url)

# Test an API endpoint
from fastapi.testclient import TestClient
client = TestClient(demo.app)
res = client.get("/api/v1/health")
print("Health status:", res.status_code, res.json())

res_ner = client.post("/api/v1/ner/analyze", json={"text": "Metformin 500mg"})
print("NER status:", res_ner.status_code, [e["text"] for e in res_ner.json().get("entities", [])])

demo.close()
