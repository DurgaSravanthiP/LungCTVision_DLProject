import json
from pathlib import Path

import tensorflow as tf

from prepare_lung_ct_dataset import CLASS_NAMES, PROCESSED_DIR, prepare_dataset


IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
MODEL_PATH = Path(__file__).resolve().parent / "lung_cancer_classifier.keras"
CLASS_NAMES_PATH = Path(__file__).resolve().parent / "lung_ct_class_names.json"


def load_split(split_name, shuffle):
    return tf.keras.utils.image_dataset_from_directory(
        PROCESSED_DIR / split_name,
        class_names=CLASS_NAMES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="int",
        shuffle=shuffle,
        seed=42,
    ).prefetch(tf.data.AUTOTUNE)


def build_model():
    augmentation = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.05),
            tf.keras.layers.RandomZoom(0.08),
        ],
        name="image_augmentation",
    )
    base_model = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(*IMAGE_SIZE, 3),
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(*IMAGE_SIZE, 3))
    x = augmentation(inputs)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(len(CLASS_NAMES), activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def train_model():
    tf.keras.utils.set_random_seed(42)
    split_counts = prepare_dataset()
    print("Dataset split counts:")
    for split_name, class_counts in split_counts.items():
        print(f"  {split_name}: {class_counts}")

    train_ds = load_split("train", shuffle=True)
    validation_ds = load_split("validation", shuffle=False)
    test_ds = load_split("test", shuffle=False)

    total_training_images = sum(split_counts["train"].values())
    class_weights = {
        index: total_training_images
        / (len(CLASS_NAMES) * split_counts["train"][class_name])
        for index, class_name in enumerate(CLASS_NAMES)
    }

    model = build_model()
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.2,
            patience=2,
            min_lr=1e-6,
        ),
    ]
    model.fit(
        train_ds,
        validation_data=validation_ds,
        epochs=EPOCHS,
        class_weight=class_weights,
        callbacks=callbacks,
    )

    test_metrics = model.evaluate(test_ds, return_dict=True)
    model.save(MODEL_PATH)
    CLASS_NAMES_PATH.write_text(
        json.dumps(CLASS_NAMES, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Test metrics: {test_metrics}")
    print(f"Saved model: {MODEL_PATH}")
    print(f"Saved class names: {CLASS_NAMES_PATH}")
    return model, test_metrics


if __name__ == "__main__":
    train_model()
