import json
import os
import time
from pathlib import Path

import joblib
import numpy as np
from PIL import Image
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report

PYTHON_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = PYTHON_DIR / "processed_data" / "lung_cancer_ct"
MODEL_PATH = PYTHON_DIR / "lung_cancer_classifier.joblib"
CLASS_NAMES_PATH = PYTHON_DIR / "lung_ct_class_names.json"

CLASS_NAMES = [
    "adenocarcinoma",
    "Benign cases",
    "large cell carcinoma",
    "Normal cases",
    "squamous cell carcinoma",
]
CLASS_TO_IDX = {c: i for i, c in enumerate(CLASS_NAMES)}


def extract_features(img_path):
    img = Image.open(img_path).convert("L").resize((128, 128))
    arr = np.asarray(img, dtype=np.float32) / 255.0

    # Full image histogram
    hist, _ = np.histogram(arr, bins=32, range=(0, 1), density=True)

    # Central lung field (nodules and tumor core)
    c = arr[32:96, 32:96]
    c_hist, _ = np.histogram(c, bins=16, range=(0, 1), density=True)

    # Statistical distribution
    stats = [
        float(np.mean(arr)),
        float(np.std(arr)),
        float(np.percentile(arr, 10)),
        float(np.percentile(arr, 25)),
        float(np.percentile(arr, 50)),
        float(np.percentile(arr, 75)),
        float(np.percentile(arr, 90)),
        float(np.mean(c)),
        float(np.std(c)),
        float(np.percentile(c, 10)),
        float(np.percentile(c, 25)),
        float(np.percentile(c, 50)),
        float(np.percentile(c, 75)),
        float(np.percentile(c, 90)),
    ]

    # Radial symmetry profiles
    h, w = arr.shape
    y, x = np.ogrid[:h, :w]
    center_y, center_x = h / 2.0, w / 2.0
    r = np.hypot(x - center_x, y - center_y)
    r_bins = np.linspace(0, h / 2.0, 9)
    radial = [
        float(np.mean(arr[(r >= r_bins[i]) & (r < r_bins[i + 1])]))
        if np.any((r >= r_bins[i]) & (r < r_bins[i + 1]))
        else 0.0
        for i in range(8)
    ]

    return np.concatenate([hist, c_hist, stats, radial])


def train_and_save():
    print("Extracting features from dataset...")
    start_time = time.time()

    X_train, y_train = [], []
    for c in CLASS_NAMES:
        folder = PROCESSED_DIR / "train" / c
        if not folder.is_dir():
            folder = PYTHON_DIR / "datasets" / "Lung Cancer Dataset" / c
        for f in folder.iterdir():
            if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                X_train.append(extract_features(f))
                y_train.append(CLASS_TO_IDX[c])

    X_test, y_test = [], []
    for c in CLASS_NAMES:
        folder = PROCESSED_DIR / "test" / c
        if folder.is_dir():
            for f in folder.iterdir():
                if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                    X_test.append(extract_features(f))
                    y_test.append(CLASS_TO_IDX[c])

    print(f"Features extracted in {time.time() - start_time:.2f}s.")
    print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")

    clf = HistGradientBoostingClassifier(
        random_state=42,
        max_iter=150,
        learning_rate=0.08,
        min_samples_leaf=5,
    )
    clf.fit(X_train, y_train)

    train_acc = accuracy_score(y_train, clf.predict(X_train))
    print(f"Train Accuracy: {train_acc * 100:.2f}%")

    if X_test:
        y_pred = clf.predict(X_test)
        test_acc = accuracy_score(y_test, y_pred)
        print(f"Test Accuracy: {test_acc * 100:.2f}%")
        print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=CLASS_NAMES))

    # Save model and classes
    joblib.dump(clf, MODEL_PATH)
    CLASS_NAMES_PATH.write_text(json.dumps(CLASS_NAMES, indent=2) + "\n", encoding="utf-8")
    print(f"Saved model to: {MODEL_PATH}")
    print(f"Saved class names to: {CLASS_NAMES_PATH}")


if __name__ == "__main__":
    train_and_save()

