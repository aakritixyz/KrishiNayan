import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from sklearn.utils.class_weight import compute_class_weight

# =========================
# CONFIG
# =========================

DATASET_DIR = os.path.expanduser(
    "~/Downloads/Rice leaf disease"
)

TRAIN_DIR = os.path.join(DATASET_DIR, "Training data")
VAL_DIR = os.path.join(DATASET_DIR, "Validation data")
TEST_DIR = os.path.join(DATASET_DIR, "Testing data")

MODEL_DIR = "backend/models"
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "KrishiNayan_Rice_EfficientNetB0_v3.keras"
)

CLASS_NAMES_PATH = os.path.join(
    MODEL_DIR,
    "rice_class_names.json"
)

IMG_SIZE = (300, 300)
BATCH_SIZE = 16
INITIAL_EPOCHS = 15
FINE_TUNE_EPOCHS = 20
SEED = 42


# =========================
# CHECK DATASET
# =========================

print("\n==============================")
print("CHECKING DATASET")
print("==============================")

for directory in [TRAIN_DIR, VAL_DIR, TEST_DIR]:
    if not os.path.exists(directory):
        raise FileNotFoundError(
            f"Dataset folder not found: {directory}"
        )

print("Dataset found!")


# =========================
# LOAD DATA
# =========================

train_ds = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    seed=SEED,
    shuffle=True
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    VAL_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    seed=SEED,
    shuffle=False
)

test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    seed=SEED,
    shuffle=False
)

class_names = train_ds.class_names
num_classes = len(class_names)

print("\nClasses:")
for i, name in enumerate(class_names):
    print(i, "->", name)

with open(CLASS_NAMES_PATH, "w") as f:
    json.dump(class_names, f, indent=2)


# =========================
# CLASS WEIGHTS
# =========================

print("\n==============================")
print("CALCULATING CLASS WEIGHTS")
print("==============================")

class_counts = []

for class_name in class_names:
    class_dir = os.path.join(TRAIN_DIR, class_name)

    count = len([
        f for f in os.listdir(class_dir)
        if os.path.isfile(os.path.join(class_dir, f))
    ])

    class_counts.append(count)

class_weights_array = compute_class_weight(
    class_weight="balanced",
    classes=np.arange(num_classes),
    y=np.concatenate([
        np.full(count, i)
        for i, count in enumerate(class_counts)
    ])
)

class_weights = {
    i: float(weight)
    for i, weight in enumerate(class_weights_array)
}

print("\nClass counts:")
for i, name in enumerate(class_names):
    print(
        f"{name}: {class_counts[i]} "
        f"(weight={class_weights[i]:.3f})"
    )


# =========================
# PERFORMANCE
# =========================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)
test_ds = test_ds.prefetch(AUTOTUNE)


# =========================
# DATA AUGMENTATION
# =========================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.15),
    layers.RandomZoom(0.15),
    layers.RandomContrast(0.15),
])


# =========================
# BASE MODEL
# =========================

base_model = EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(300, 300, 3)
)

base_model.trainable = False

# =========================
# MODEL
# =========================

inputs = layers.Input(shape=(300, 300, 3))

x = data_augmentation(inputs)

x = base_model(x, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.BatchNormalization()(x)

x = layers.Dropout(0.4)(x)

x = layers.Dense(
    256,
    activation="relu"
)(x)

x = layers.Dropout(0.3)(x)

outputs = layers.Dense(
    num_classes,
    activation="softmax"
)(x)

model = models.Model(inputs, outputs)


# =========================
# INITIAL TRAINING
# =========================

print("\n==============================")
print("PHASE 1: TRAINING CLASSIFIER")
print("==============================")

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.0005
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

callbacks_phase1 = [
    tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        mode="max",
        verbose=1
    ),

    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=2,
        min_lr=1e-6,
        verbose=1
    ),

    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=5,
        restore_best_weights=True,
        verbose=1
    )
]

model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=INITIAL_EPOCHS,
    class_weight=class_weights,
    callbacks=callbacks_phase1
)


# =========================
# FINE TUNING
# =========================

print("\n==============================")
print("PHASE 2: FINE-TUNING")
print("==============================")

base_model.trainable = True

# Freeze most of EfficientNet
# Only fine-tune the last layers

for layer in base_model.layers[:-60]:
    layer.trainable = False

# Keep BatchNorm layers frozen
for layer in base_model.layers:
    if isinstance(layer, layers.BatchNormalization):
        layer.trainable = False


model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

callbacks_phase2 = [
    tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH,
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
        patience=5,
        restore_best_weights=True,
        verbose=1
    )
]

model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=FINE_TUNE_EPOCHS,
    class_weight=class_weights,
    callbacks=callbacks_phase2
)


# =========================
# TEST
# =========================

print("\n==============================")
print("EVALUATING RICE MODEL")
print("==============================")

test_loss, test_accuracy = model.evaluate(test_ds)

print("\n==============================")
print("Rice Model Test Accuracy:", test_accuracy)
print("==============================")


# =========================
# SAVE MODEL
# =========================

model.save(MODEL_PATH)

print("\nModel saved to:")
print(MODEL_PATH)

print("\nClass names saved to:")
print(CLASS_NAMES_PATH)