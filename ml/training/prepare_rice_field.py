import os
import shutil
import random

# =========================
# CONFIG
# =========================

BASE_DIR = os.path.expanduser(
    "~/Documents/KrishiNayan/ml/data/rice_field"
)

SEED = 42

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# Dataset folder name -> KrishiNayan class name
CLASS_MAPPING = {
    "Blast": "Leaf Blast",
    "Narrow_Brown_Spot": "Narrow Brown Leaf Spot",
    "Normal_Leaf": "Healthy Rice Leaf",
    "Sheath_Blight": "Sheath Blight"
}

# =========================
# CHECK
# =========================

random.seed(SEED)

print("\n==============================")
print("PREPARING RICE FIELD DATASET")
print("==============================")

for folder in CLASS_MAPPING:
    source = os.path.join(BASE_DIR, folder)

    if not os.path.exists(source):
        raise FileNotFoundError(
            f"Missing source folder: {source}"
        )

# =========================
# CREATE SPLIT DIRECTORIES
# =========================

for split in ["train", "validation", "test"]:
    for class_name in CLASS_MAPPING.values():
        os.makedirs(
            os.path.join(BASE_DIR, split, class_name),
            exist_ok=True
        )

# =========================
# SPLIT DATA
# =========================

for source_class, target_class in CLASS_MAPPING.items():

    source_dir = os.path.join(BASE_DIR, source_class)

    images = [
        f for f in os.listdir(source_dir)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    random.shuffle(images)

    total = len(images)

    train_end = int(total * TRAIN_RATIO)
    val_end = train_end + int(total * VAL_RATIO)

    train_images = images[:train_end]
    val_images = images[train_end:val_end]
    test_images = images[val_end:]

    print("\n" + source_class)
    print("Total:", total)
    print("Train:", len(train_images))
    print("Validation:", len(val_images))
    print("Test:", len(test_images))

    splits = {
        "train": train_images,
        "validation": val_images,
        "test": test_images
    }

    for split, split_images in splits.items():

        destination = os.path.join(
            BASE_DIR,
            split,
            target_class
        )

        for image in split_images:

            source_path = os.path.join(
                source_dir,
                image
            )

            destination_path = os.path.join(
                destination,
                image
            )

            shutil.copy2(
                source_path,
                destination_path
            )

# =========================
# SUMMARY
# =========================

print("\n==============================")
print("FIELD DATASET READY")
print("==============================")

for split in ["train", "validation", "test"]:

    print("\n", split.upper())

    split_dir = os.path.join(BASE_DIR, split)

    for class_name in CLASS_MAPPING.values():

        class_dir = os.path.join(
            split_dir,
            class_name
        )

        count = len([
            f for f in os.listdir(class_dir)
            if f.lower().endswith(
                (".jpg", ".jpeg", ".png")
            )
        ])

        print(
            f"{class_name}: {count}"
        )

print("\nDataset location:")
print(BASE_DIR)