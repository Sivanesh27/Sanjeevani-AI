import spaces  # ZeroGPU MUST be imported on line 1 before anything else
import os
import uvicorn
from backend.app.main import app

@app.get("/gpu-probe", tags=["ZeroGPU"])
@spaces.GPU
def probe_zerogpu():
    """ZeroGPU startup verification probe."""
    return {"status": "ZeroGPU Active", "hardware": "NVIDIA A100"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
