import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers
from sklearn.utils.class_weight import compute_class_weight

# =========================
# CONFIG
# =========================

MODEL_PATH = "backend/models/KrishiNayan_Rice_EfficientNetB0_v2.keras"

FIELD_DIR = os.path.expanduser(
    "~/Documents/KrishiNayan/ml/data/rice_field"
)

FIELD_TRAIN = os.path.join(FIELD_DIR, "train")
FIELD_VAL = os.path.join(FIELD_DIR, "validation")
FIELD_TEST = os.path.join(FIELD_DIR, "test")

OUTPUT_MODEL = (
    "backend/models/"
    "KrishiNayan_Rice_Field_V4.keras"
)

IMG_SIZE = (300, 300)
BATCH_SIZE = 16
EPOCHS = 15
SEED = 42


# =========================
# CHECK
# =========================

print("\n==============================")
print("RICE FIELD FINE-TUNING V4")
print("==============================")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )

for folder in [FIELD_TRAIN, FIELD_VAL, FIELD_TEST]:
    if not os.path.exists(folder):
        raise FileNotFoundError(
            f"Dataset folder not found: {folder}"
        )

print("Model found.")
print("Field dataset found.")


# =========================
# LOAD DATA
# =========================

train_ds = tf.keras.utils.image_dataset_from_directory(
    FIELD_TRAIN,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    seed=SEED,
    shuffle=True
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    FIELD_VAL,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    seed=SEED,
    shuffle=False
)

test_ds = tf.keras.utils.image_dataset_from_directory(
    FIELD_TEST,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    seed=SEED,
    shuffle=False
)

field_classes = train_ds.class_names

print("\nField classes:")
for i, name in enumerate(field_classes):
    print(i, "->", name)


# =========================
# VERIFY 4 CLASSES
# =========================

expected_classes = [
    "Healthy Rice Leaf",
    "Leaf Blast",
    "Narrow Brown Leaf Spot",
    "Sheath Blight"
]

if set(field_classes) != set(expected_classes):
    raise ValueError(
        "Unexpected field dataset classes!"
    )


# =========================
# PERFORMANCE
# =========================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)
test_ds = test_ds.prefetch(AUTOTUNE)


# =========================
# LOAD EXISTING MODEL
# =========================

print("\nLoading existing Rice model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Existing model loaded.")


# =========================
# FREEZE MOST OF MODEL
# =========================

print("\nPreparing fine-tuning...")

for layer in model.layers:
    layer.trainable = False

# Find EfficientNet base model
base_model = None

for layer in model.layers:
    if isinstance(layer, tf.keras.Model):
        base_model = layer
        break

if base_model is None:
    raise ValueError(
        "Could not find EfficientNet base model."
    )

base_model.trainable = True

# Fine-tune only the final 30 layers
for layer in base_model.layers[:-30]:
    layer.trainable = False

for layer in base_model.layers:
    if isinstance(
        layer,
        tf.keras.layers.BatchNormalization
    ):
        layer.trainable = False


# =========================
# COMPILE
# =========================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)


# =========================
# CALLBACKS
# =========================

callbacks = [

    tf.keras.callbacks.ModelCheckpoint(
        OUTPUT_MODEL,
        monitor="val_accuracy",
        save_best_only=True,
        mode="max",
        verbose=1
    ),

    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=2,
        min_lr=1e-7,
        verbose=1
    ),

    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=4,
        restore_best_weights=True,
        verbose=1
    )
]


# =========================
# IMPORTANT
# =========================

print("\n==============================")
print("STARTING FIELD FINE-TUNING")
print("==============================")

print("\nNOTE:")
print("The field dataset contains only 4 of the")
print("8 model classes.")
print("This is being used only for controlled")
print("fine-tuning of the existing model.")


# =========================
# TRAIN
# =========================

model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks
)


# =========================
# FIELD TEST
# =========================

print("\n==============================")
print("FIELD TEST")
print("==============================")

loss, accuracy = model.evaluate(test_ds)

print("\n==============================")
print("FIELD TEST ACCURACY:", accuracy)
print("==============================")


# =========================
# SAVE
# =========================

model.save(OUTPUT_MODEL)

print("\nModel saved to:")
print(OUTPUT_MODEL)