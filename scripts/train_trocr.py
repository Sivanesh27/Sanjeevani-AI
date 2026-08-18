from pathlib import Path
import csv
import math
import os
import random
import time

import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from jiwer import cer

from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
)

# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "pretrained"
    / "trocr"
)

DATASET_DIR = (
    BASE_DIR
    / "datasets"
    / "ocr"
    / "prepared"
)

TRAIN_CSV = DATASET_DIR / "train.csv"
VAL_CSV = DATASET_DIR / "validation.csv"
TEST_CSV = DATASET_DIR / "test.csv"

OUTPUT_DIR = (
    BASE_DIR
    / "models"
    / "trained"
    / "trocr_sanjeevani"
)

CHECKPOINT_DIR = (
    BASE_DIR
    / "checkpoints"
    / "trocr"
)

# ============================================================
# TRAINING SETTINGS
# ============================================================

BATCH_SIZE = 1

GRADIENT_ACCUMULATION_STEPS = 8

EPOCHS = 3

LEARNING_RATE = 5e-5

WEIGHT_DECAY = 0.01

MAX_TEXT_LENGTH = 64

NUM_WORKERS = 0

SEED = 42

# Start with encoder frozen because the RTX 3050 has 8 GB VRAM.
FREEZE_ENCODER = True

# ============================================================
# REPRODUCIBILITY
# ============================================================

random.seed(SEED)
torch.manual_seed(SEED)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

print("=" * 75)
print("SANJEEVANI AI - TrOCR FINE-TUNING")
print("=" * 75)

print("Device:", DEVICE)

if torch.cuda.is_available():

    print(
        "GPU:",
        torch.cuda.get_device_name(0)
    )

    print(
        "VRAM:",
        round(
            torch.cuda.get_device_properties(0).total_memory
            / (1024 ** 3),
            2
        ),
        "GB"
    )

# ============================================================
# CHECK FILES
# ============================================================

for path in [
    MODEL_PATH,
    TRAIN_CSV,
    VAL_CSV,
    TEST_CSV,
]:

    if not path.exists():

        raise FileNotFoundError(
            f"Required file/folder not found:\n{path}"
        )

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

CHECKPOINT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

# ============================================================
# CSV DATASET
# ============================================================


class OCRDataset(Dataset):

    def __init__(
        self,
        csv_path,
        processor,
    ):

        self.processor = processor

        self.records = []

        with open(
            csv_path,
            "r",
            encoding="utf-8"
        ) as f:

            reader = csv.DictReader(f)

            for row in reader:

                self.records.append({
                    "image": row["image"],
                    "text": row["text"],
                })

        print(
            f"Loaded {len(self.records)} samples from "
            f"{csv_path.name}"
        )

    def __len__(self):

        return len(self.records)

    def __getitem__(self, index):

        record = self.records[index]

        image_path = (
            BASE_DIR / record["image"]
        )

        image = Image.open(
            image_path
        ).convert("RGB")

        # ----------------------------------------------------
        # IMAGE PROCESSING
        # ----------------------------------------------------

        pixel_values = self.processor(
            images=image,
            return_tensors="pt"
        ).pixel_values.squeeze(0)

        # ----------------------------------------------------
        # TEXT TOKENIZATION
        # ----------------------------------------------------

        labels = self.processor.tokenizer(
            record["text"],
            padding="max_length",
            max_length=MAX_TEXT_LENGTH,
            truncation=True,
            return_tensors="pt"
        ).input_ids.squeeze(0)

        # ----------------------------------------------------
        # IGNORE PAD TOKENS IN LOSS
        # ----------------------------------------------------

        labels[
            labels
            == self.processor.tokenizer.pad_token_id
        ] = -100

        return {
            "pixel_values": pixel_values,
            "labels": labels,
        }

# ============================================================
# LOAD PROCESSOR
# ============================================================


print("\nLoading TrOCR processor...")

processor = TrOCRProcessor.from_pretrained(
    str(MODEL_PATH)
)

# ============================================================
# LOAD MODEL
# ============================================================

print("Loading TrOCR model...")

model = VisionEncoderDecoderModel.from_pretrained(
    str(MODEL_PATH)
)

# ============================================================
# MODEL CONFIGURATION
# ============================================================

tokenizer = processor.tokenizer

model.config.pad_token_id = (
    tokenizer.pad_token_id
)

model.config.vocab_size = (
    model.config.decoder.vocab_size
)

# Set decoder start token if missing
if model.config.decoder_start_token_id is None:

    if tokenizer.cls_token_id is not None:

        model.config.decoder_start_token_id = (
            tokenizer.cls_token_id
        )

    elif tokenizer.bos_token_id is not None:

        model.config.decoder_start_token_id = (
            tokenizer.bos_token_id
        )

    else:

        model.config.decoder_start_token_id = (
            tokenizer.eos_token_id
        )

# Generation configuration

model.generation_config.max_length = MAX_TEXT_LENGTH

model.generation_config.num_beams = 2

model.generation_config.early_stopping = True

# ============================================================
# FREEZE ENCODER
# ============================================================

if FREEZE_ENCODER:

    print("\nFreezing vision encoder...")

    for parameter in model.encoder.parameters():

        parameter.requires_grad = False

else:

    print("\nVision encoder will be trained.")

# ============================================================
# GRADIENT CHECKPOINTING
# ============================================================

try:

    model.gradient_checkpointing_enable()

    print("Gradient checkpointing: ENABLED")

except Exception:

    print(
        "Gradient checkpointing unavailable."
    )

model.to(DEVICE)

# ============================================================
# DATASETS
# ============================================================

print("\nPreparing datasets...")

train_dataset = OCRDataset(
    TRAIN_CSV,
    processor
)

val_dataset = OCRDataset(
    VAL_CSV,
    processor
)

test_dataset = OCRDataset(
    TEST_CSV,
    processor
)

# ============================================================
# DATALOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=NUM_WORKERS,
    pin_memory=torch.cuda.is_available(),
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=torch.cuda.is_available(),
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=torch.cuda.is_available(),
)

# ============================================================
# OPTIMIZER
# ============================================================

trainable_parameters = [
    parameter
    for parameter in model.parameters()
    if parameter.requires_grad
]

print(
    "\nTrainable parameters:",
    sum(
        p.numel()
        for p in trainable_parameters
    )
)

optimizer = torch.optim.AdamW(
    trainable_parameters,
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY,
)

# ============================================================
# MIXED PRECISION
# ============================================================

use_amp = DEVICE.type == "cuda"

scaler = torch.amp.GradScaler(
    "cuda",
    enabled=use_amp
)

# ============================================================
# VALIDATION
# ============================================================


def evaluate(model, loader):

    model.eval()

    total_loss = 0.0

    references = []

    predictions = []

    with torch.no_grad():

        for batch in loader:

            pixel_values = (
                batch["pixel_values"]
                .to(DEVICE)
            )

            labels = (
                batch["labels"]
                .to(DEVICE)
            )

            # ----------------------------------------------
            # LOSS
            # ----------------------------------------------

            with torch.autocast(
                device_type="cuda",
                dtype=torch.float16,
                enabled=use_amp
            ):

                outputs = model(
                    pixel_values=pixel_values,
                    labels=labels
                )

            total_loss += (
                outputs.loss.item()
            )

            # ----------------------------------------------
            # GENERATION
            # ----------------------------------------------

            generated_ids = model.generate(
                pixel_values,
                max_length=MAX_TEXT_LENGTH,
                num_beams=2
            )

            predicted_text = (
                processor.batch_decode(
                    generated_ids,
                    skip_special_tokens=True
                )
            )

            # Restore padding for decoding
            labels_for_decode = labels.clone()

            labels_for_decode[
                labels_for_decode == -100
            ] = tokenizer.pad_token_id

            reference_text = (
                processor.batch_decode(
                    labels_for_decode,
                    skip_special_tokens=True
                )
            )

            predictions.extend(
                predicted_text
            )

            references.extend(
                reference_text
            )

    average_loss = (
        total_loss / len(loader)
    )

    score = cer(
        references,
        predictions
    )

    return average_loss, score

# ============================================================
# SAVE MODEL
# ============================================================


def save_model(
    model,
    processor,
    output_path
):

    output_path.mkdir(
        parents=True,
        exist_ok=True
    )

    print(
        f"\nSaving model to:\n{output_path}"
    )

    model.save_pretrained(
        str(output_path)
    )

    processor.save_pretrained(
        str(output_path)
    )

    print("Model saved successfully.")

# ============================================================
# TRAINING
# ============================================================


print("\n" + "=" * 75)
print("STARTING TRAINING")
print("=" * 75)

print(
    f"Epochs: {EPOCHS}"
)

print(
    f"Batch size: {BATCH_SIZE}"
)

print(
    f"Gradient accumulation: "
    f"{GRADIENT_ACCUMULATION_STEPS}"
)

print(
    f"Effective batch size: "
    f"{BATCH_SIZE * GRADIENT_ACCUMULATION_STEPS}"
)

print(
    f"Learning rate: {LEARNING_RATE}"
)

best_val_cer = float("inf")

for epoch in range(EPOCHS):

    print(
        "\n"
        +"=" * 75
    )

    print(
        f"EPOCH {epoch + 1}/{EPOCHS}"
    )

    print(
        "=" * 75
    )

    model.train()

    optimizer.zero_grad(
        set_to_none=True
    )

    running_loss = 0.0

    start_time = time.time()

    for step, batch in enumerate(
        train_loader
    ):

        pixel_values = (
            batch["pixel_values"]
            .to(
                DEVICE,
                non_blocking=True
            )
        )

        labels = (
            batch["labels"]
            .to(
                DEVICE,
                non_blocking=True
            )
        )

        # ----------------------------------------------------
        # FORWARD PASS
        # ----------------------------------------------------

        with torch.autocast(
            device_type="cuda",
            dtype=torch.float16,
            enabled=use_amp
        ):

            outputs = model(
                pixel_values=pixel_values,
                labels=labels
            )

            loss = outputs.loss

            loss = (
                loss
                / GRADIENT_ACCUMULATION_STEPS
            )

        # ----------------------------------------------------
        # BACKPROPAGATION
        # ----------------------------------------------------

        scaler.scale(
            loss
        ).backward()

        running_loss += (
            loss.item()
            * GRADIENT_ACCUMULATION_STEPS
        )

        # ----------------------------------------------------
        # OPTIMIZER STEP
        # ----------------------------------------------------

        if (
            (step + 1)
            % GRADIENT_ACCUMULATION_STEPS
            == 0
        ):

            scaler.step(
                optimizer
            )

            scaler.update()

            optimizer.zero_grad(
                set_to_none=True
            )

        # ----------------------------------------------------
        # PROGRESS
        # ----------------------------------------------------

        if (
            (step + 1) % 50 == 0
            or step == 0
        ):

            elapsed = (
                time.time()
                -start_time
            )

            avg_loss = (
                running_loss
                / (step + 1)
            )

            print(
                f"Step "
                f"{step + 1}/"
                f"{len(train_loader)} "
                f"| Loss: {avg_loss:.4f} "
                f"| Time: {elapsed / 60:.1f} min"
            )

    # ========================================================
    # VALIDATION
    # ========================================================

    print("\nRunning validation...")

    val_loss, val_cer = evaluate(
        model,
        val_loader
    )

    train_loss = (
        running_loss
        / len(train_loader)
    )

    print(
        f"\nEpoch {epoch + 1} results:"
    )

    print(
        f"Training Loss:   {train_loss:.4f}"
    )

    print(
        f"Validation Loss: {val_loss:.4f}"
    )

    print(
        f"Validation CER:  {val_cer:.4f}"
    )

    # ========================================================
    # SAVE CHECKPOINT
    # ========================================================

    checkpoint_path = (
        CHECKPOINT_DIR
        / f"epoch_{epoch + 1}"
    )

    save_model(
        model,
        processor,
        checkpoint_path
    )

    # ========================================================
    # BEST MODEL
    # ========================================================

    if val_cer < best_val_cer:

        best_val_cer = val_cer

        print(
            "\nNew best model!"
        )

        save_model(
            model,
            processor,
            OUTPUT_DIR
        )

# ============================================================
# FINAL TEST
# ============================================================

print("\n" + "=" * 75)
print("FINAL TEST")
print("=" * 75)

test_loss, test_cer = evaluate(
    model,
    test_loader
)

print(
    f"Test Loss: {test_loss:.4f}"
)

print(
    f"Test CER:  {test_cer:.4f}"
)

# ============================================================
# FINAL SAVE
# ============================================================

save_model(
    model,
    processor,
    OUTPUT_DIR
)

# ============================================================
# FINISHED
# ============================================================

print("\n" + "=" * 75)
print("TRAINING COMPLETE")
print("=" * 75)

print(
    "\nBest validation CER:",
    best_val_cer
)

print(
    "\nFinal model:"
)

print(
    OUTPUT_DIR
)

print(
    "\nYou can load this model later using:"
)

print(
    "TrOCRProcessor.from_pretrained("
)

print(
    f'    r"{OUTPUT_DIR}"'
)

print(
    ")"
)

print(
    "\nTraining finished successfully."
)
