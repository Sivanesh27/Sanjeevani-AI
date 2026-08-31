try:
    import spaces
    has_spaces = True
except ImportError:
    has_spaces = False

import os
import uvicorn
from backend.app.main import app

if has_spaces:
    @app.get("/gpu-probe", tags=["ZeroGPU"])
    @spaces.GPU
    def probe_zerogpu():
        """ZeroGPU startup verification probe."""
        return {"status": "ZeroGPU Active", "hardware": "NVIDIA A100"}
else:
    @app.get("/gpu-probe", tags=["ZeroGPU"])
    def probe_zerogpu():
        return {"status": "Standard Runtime Active"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
