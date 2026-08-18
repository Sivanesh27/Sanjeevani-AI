from pathlib import Path
from huggingface_hub import snapshot_download

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_DIR = BASE_DIR / "models" / "pretrained"

MODELS = {
    "trocr": "microsoft/trocr-base-printed",

    "biomedbert":
        "microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext",

    "sapbert":
        "cambridgeltl/SapBERT-from-PubMedBERT-fulltext",

    "intent":
        "distilbert/distilbert-base-uncased",

    "whisper":
        "openai/whisper-base",

    "indictrans_en_indic":
        "ai4bharat/indictrans2-en-indic-dist-200M",

    "indictrans_indic_indic":
        "ai4bharat/indictrans2-indic-indic-dist-320M",
}

# Only download files required for PyTorch/Transformers.
# This avoids downloading TensorFlow, Flax and duplicate PyTorch weights.
ALLOW_PATTERNS = [
    "*.json",
    "*.safetensors",
    "*.txt",
    "*.model",
    "*.vocab",
    "*.merges",
    "*.tiktoken",
    "*.py",
]

for name, repo_id in MODELS.items():

    destination = MODEL_DIR / name

    print("\n" + "=" * 70)
    print(f"Downloading: {name}")
    print(f"Repository: {repo_id}")
    print(f"Destination: {destination}")
    print("=" * 70)

    destination.mkdir(
        parents=True,
        exist_ok=True
    )

    try:

        snapshot_download(
            repo_id=repo_id,
            local_dir=str(destination),
            allow_patterns=ALLOW_PATTERNS,
            max_workers=2,
        )

        print(f"\n✅ Finished: {name}")

    except Exception as e:

        print(f"\n❌ FAILED: {name}")
        print(f"Error: {e}")

        print(
            "\nThe script will continue with the next model."
        )

print("\n" + "=" * 70)
print("MODEL DOWNLOAD PROCESS FINISHED")
print("=" * 70)
