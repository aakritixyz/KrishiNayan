import argparse
import json
import random
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.services.ml_service import predict_disease  # noqa: E402


RICE_FIELD_LABELS = {
    "Blast": "Leaf Blast",
    "Narrow_Brown_Spot": "Narrow Brown Leaf Spot",
    "Normal_Leaf": "Healthy Rice Leaf",
    "Sheath_Blight": "Sheath Blight",
}


def evaluate_rice_field(sample_per_class: int = 50, seed: int = 42):
    dataset_root = ROOT / "ml" / "data" / "rice_field"
    samples = []

    for folder, expected in RICE_FIELD_LABELS.items():
        files = sorted((dataset_root / folder).glob("*.jpg"))
        random.Random(seed).shuffle(files)
        samples.extend((path, expected) for path in files[:sample_per_class])

    total = len(samples)
    correct = 0
    answered = 0
    by_class = {
        expected: {"total": 0, "correct": 0, "answered": 0}
        for expected in RICE_FIELD_LABELS.values()
    }

    for path, expected in samples:
        result = predict_disease(path.read_bytes(), crop="rice")
        predicted = result["disease"]
        status = result["status"]

        by_class[expected]["total"] += 1
        if status == "supported":
            answered += 1
            by_class[expected]["answered"] += 1
        if predicted == expected:
            correct += 1
            by_class[expected]["correct"] += 1

    return {
        "dataset": "ml/data/rice_field",
        "crop": "rice",
        "sample_strategy": f"balanced random sample, {sample_per_class} per class",
        "sample_size": total,
        "accuracy_all_images": round(correct / total * 100, 2) if total else 0,
        "confidence_threshold": 70,
        "answered_share": round(answered / total * 100, 2) if total else 0,
        "by_class": by_class,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample-per-class", type=int, default=50)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()

    metrics = evaluate_rice_field(args.sample_per_class, args.seed)
    text = json.dumps(metrics, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text + "\n", encoding="utf-8")
    print(text)


if __name__ == "__main__":
    main()
