import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import gradio as gr
from backend.app.main import app as fastapi_app

with gr.Blocks() as demo:
    gr.Markdown("# SanjeevaniAI Engine")

app_instance, local_url, share_url = demo.launch(
    _app=fastapi_app,
    ssr_mode=False,
    prevent_thread_lock=True,
    server_name="127.0.0.1",
    server_port=7865,
)

print("SUCCESS: Launched on", local_url)
demo.close()
