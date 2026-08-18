from pathlib import Path
import csv
import random
from collections import defaultdict

# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

OCR_ROOT = (
    BASE_DIR
    / "datasets"
    / "ocr"
    / "mobile_packages"
)

OUTPUT_DIR = (
    BASE_DIR
    / "datasets"
    / "ocr"
    / "prepared"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

# ============================================================
# IMAGE EXTENSIONS
# ============================================================

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp"
}

# ============================================================
# FIND IMAGES BY MEDICINE
# ============================================================

print("=" * 70)
print("SANJEEVANI OCR DATASET PREPARATION")
print("=" * 70)

print("\nSearching:")
print(OCR_ROOT)

medicine_images = defaultdict(list)

for image_path in OCR_ROOT.rglob("*"):

    if not image_path.is_file():
        continue

    if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
        continue

    # Immediate parent folder = medicine/package name
    medicine_name = image_path.parent.name.strip()

    if not medicine_name:
        continue

    medicine_images[medicine_name].append(image_path)

print("\nUnique medicine/package classes:")
print(len(medicine_images))

print("\nTotal images:")

total_images = sum(
    len(images)
    for images in medicine_images.values()
)

print(total_images)

# ============================================================
# CHECK
# ============================================================

if total_images == 0:

    print("\nERROR: No images found.")
    print("Check the mobile_packages directory.")

    raise SystemExit

# ============================================================
# SHUFFLE MEDICINE CLASSES
# ============================================================

random.seed(42)

medicine_names = list(
    medicine_images.keys()
)

random.shuffle(medicine_names)

# ============================================================
# SPLIT BY MEDICINE
# ============================================================

total_medicines = len(medicine_names)

train_medicine_end = int(
    total_medicines * 0.80
)

validation_medicine_end = int(
    total_medicines * 0.90
)

train_medicines = medicine_names[:train_medicine_end
]

validation_medicines = medicine_names[
    train_medicine_end:validation_medicine_end
]

test_medicines = medicine_names[
    validation_medicine_end:
]

# ============================================================
# CREATE RECORDS
# ============================================================


def create_records(medicine_list):

    records = []

    for medicine_name in medicine_list:

        for image_path in medicine_images[
            medicine_name
        ]:

            records.append({
                "image": str(
                    image_path.relative_to(BASE_DIR)
                ),
                "text": medicine_name
            })

    return records


train_records = create_records(
    train_medicines
)

validation_records = create_records(
    validation_medicines
)

test_records = create_records(
    test_medicines
)

# ============================================================
# SHUFFLE IMAGES WITHIN EACH SPLIT
# ============================================================

random.shuffle(train_records)
random.shuffle(validation_records)
random.shuffle(test_records)

# ============================================================
# SAVE CSV
# ============================================================


def save_csv(records, filename):

    output_path = OUTPUT_DIR / filename

    with open(
        output_path,
        "w",
        newline="",
        encoding="utf-8"
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=[
                "image",
                "text"
            ]
        )

        writer.writeheader()

        writer.writerows(records)

    print(
        f"Saved {filename}: "
        f"{len(records)} images"
    )


save_csv(
    train_records,
    "train.csv"
)

save_csv(
    validation_records,
    "validation.csv"
)

save_csv(
    test_records,
    "test.csv"
)

# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("SPLIT SUMMARY")
print("=" * 70)

print(
    f"Training medicines:   {len(train_medicines)}"
)

print(
    f"Validation medicines: {len(validation_medicines)}"
)

print(
    f"Test medicines:       {len(test_medicines)}"
)

print()

print(
    f"Training images:       {len(train_records)}"
)

print(
    f"Validation images:     {len(validation_records)}"
)

print(
    f"Test images:           {len(test_records)}"
)

print("\nIMPORTANT:")
print(
    "The same medicine/package is NOT present "
    "across train, validation and test."
)

print("=" * 70)
print("DONE")
print("=" * 70)
