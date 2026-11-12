import random
import shutil
from pathlib import Path


PYTHON_DIR = Path(__file__).resolve().parent
DATASET_DIR = PYTHON_DIR / "datasets" / "Lung Cancer Dataset"
PROCESSED_DIR = PYTHON_DIR / "processed_data" / "lung_cancer_ct"
CLASS_NAMES = [
    "adenocarcinoma",
    "Benign cases",
    "large cell carcinoma",
    "Normal cases",
    "squamous cell carcinoma",
]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def prepare_dataset(seed=42):
    if not DATASET_DIR.is_dir():
        raise FileNotFoundError(
            f"Lung CT dataset not found. Expected class folders under: {DATASET_DIR}"
        )

    actual_classes = {path.name for path in DATASET_DIR.iterdir() if path.is_dir()}
    expected_classes = set(CLASS_NAMES)
    if actual_classes != expected_classes:
        missing = sorted(expected_classes - actual_classes)
        unexpected = sorted(actual_classes - expected_classes)
        raise ValueError(
            f"Dataset class folders do not match. Missing: {missing}; "
            f"unexpected: {unexpected}"
        )

    class_images = {}
    for class_name in CLASS_NAMES:
        images = sorted(
            path
            for path in (DATASET_DIR / class_name).rglob("*")
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        )
        if len(images) < 3:
            raise ValueError(
                f"Class '{class_name}' needs at least 3 supported images; "
                f"found {len(images)}."
            )
        class_images[class_name] = images

    if PROCESSED_DIR.exists():
        shutil.rmtree(PROCESSED_DIR)

    rng = random.Random(seed)
    counts = {
        split: {name: 0 for name in CLASS_NAMES}
        for split in ("train", "validation", "test")
    }
    for class_name, images in class_images.items():
        shuffled = images.copy()
        rng.shuffle(shuffled)

        test_count = max(1, round(len(shuffled) * 0.15))
        validation_count = max(1, round(len(shuffled) * 0.15))
        train_count = len(shuffled) - test_count - validation_count
        if train_count < 1:
            raise ValueError(f"Class '{class_name}' does not have enough images to split.")

        split_images = {
            "train": shuffled[:train_count],
            "validation": shuffled[train_count : train_count + validation_count],
            "test": shuffled[train_count + validation_count :],
        }
        for split, paths in split_images.items():
            destination = PROCESSED_DIR / split / class_name
            destination.mkdir(parents=True, exist_ok=True)
            for index, source in enumerate(paths):
                target = destination / source.name
                if target.exists():
                    target = destination / f"{index}_{source.name}"
                shutil.copy2(source, target)
            counts[split][class_name] = len(paths)

    return counts


if __name__ == "__main__":
    for split_name, class_counts in prepare_dataset().items():
        print(f"{split_name}: {class_counts}")
