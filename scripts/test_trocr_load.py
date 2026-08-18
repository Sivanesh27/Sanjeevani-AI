from pathlib import Path

import torch

from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
)

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "pretrained"
    / "trocr"
)

print("=" * 70)
print("SANJEEVANI - TrOCR LOAD TEST")
print("=" * 70)

print("Model:", MODEL_PATH)

print(
    "CUDA:",
    torch.cuda.is_available()
)

if torch.cuda.is_available():

    print(
        "GPU:",
        torch.cuda.get_device_name(0)
    )

# ------------------------------------------------------------
# PROCESSOR
# ------------------------------------------------------------

print("\nLoading processor...")

processor = TrOCRProcessor.from_pretrained(
    str(MODEL_PATH)
)

print("Processor loaded successfully.")

# ------------------------------------------------------------
# MODEL
# ------------------------------------------------------------

print("\nLoading model...")

model = VisionEncoderDecoderModel.from_pretrained(
    str(MODEL_PATH)
)

print("Model loaded successfully.")

# ------------------------------------------------------------
# GPU
# ------------------------------------------------------------

if torch.cuda.is_available():

    model = model.to("cuda")

    print(
        "\nModel moved to GPU successfully."
    )

# ------------------------------------------------------------
# SUMMARY
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("SUCCESS")
print("=" * 70)

print("TrOCR processor: OK")
print("TrOCR model:     OK")

if torch.cuda.is_available():
    print("CUDA:            OK")
    print(
        "GPU:             "
        +torch.cuda.get_device_name(0)
    )

print("=" * 70)
