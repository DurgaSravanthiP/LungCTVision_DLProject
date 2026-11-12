import json
import os
import sys
from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image


PYTHON_DIR = Path(__file__).resolve().parent
MODEL_PATH = PYTHON_DIR / "lung_cancer_classifier.keras"
CLASS_NAMES_PATH = PYTHON_DIR / "lung_ct_class_names.json"
IMAGE_SIZE = (224, 224)


def predict(image_path: str):
    if not os.path.isfile(image_path):
        raise FileNotFoundError("Image file not found.")
    if not MODEL_PATH.is_file() or not CLASS_NAMES_PATH.is_file():
        raise FileNotFoundError(
            "The five-class lung model is not trained yet. "
            "Run train_lung_ct_model.py first."
        )

    class_names = json.loads(CLASS_NAMES_PATH.read_text(encoding="utf-8"))
    if not isinstance(class_names, list) or not class_names:
        raise ValueError("The saved lung CT class list is invalid.")

    image = Image.open(image_path).convert("RGB")
    image = image.resize(IMAGE_SIZE, Image.Resampling.BILINEAR)
    image_array = np.expand_dims(np.asarray(image, dtype=np.float32), axis=0)

    model = tf.keras.models.load_model(MODEL_PATH)
    probabilities = np.asarray(model.predict(image_array, verbose=0))[0]
    if probabilities.size != len(class_names):
        raise ValueError(
            "The model output does not match the saved lung CT class list."
        )

    class_index = int(np.argmax(probabilities))
    return {
        "prediction": class_names[class_index],
        "confidence": round(float(probabilities[class_index]) * 100, 2),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(
            json.dumps(
                {"success": False, "message": "Please provide an image path."}
            )
        )
        sys.exit(1)

    try:
        print(json.dumps(predict(sys.argv[1])))
    except Exception as exc:  # pragma: no cover - CLI safety
        print(json.dumps({"success": False, "message": str(exc)}))
        sys.exit(1)
