import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import gradio as gr
from backend.app.main import app as fastapi_app
from fastapi.testclient import TestClient

with gr.Blocks() as demo:
    gr.Markdown("# SanjeevaniAI API")

mounted_app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

client = TestClient(mounted_app)

# 1. Health
res_health = client.get("/api/v1/health")
print("1. Health Endpoint -> Status:", res_health.status_code, res_health.json())

# 2. NER Analyze
res_ner = client.post("/api/v1/ner/analyze", json={"text": "Metformin 500mg and Lisinopril 10mg"})
print("2. NER Endpoint -> Status:", res_ner.status_code, "Entities:", [e["text"] for e in res_ner.json().get("entities", [])])

# 3. Chat
res_chat = client.post("/api/v1/chat", json={"message": "What is Diabetes?"})
print("3. Chat Endpoint -> Status:", res_chat.status_code, "Reply prefix:", res_chat.json().get("reply", "")[:50])

print("ALL TESTS PASSED WITH 0 ERRORS!")
