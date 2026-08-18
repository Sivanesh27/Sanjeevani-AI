from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = BASE_DIR / "models" / "pretrained"

for model_dir in MODEL_DIR.iterdir():
    if model_dir.is_dir():
        files = list(model_dir.rglob("*"))
        files = [f for f in files if f.is_file()]

        print(f"{model_dir.name:30} {len(files):5} files")

print("\nModel directory check completed.")