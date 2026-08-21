import os
import json
import random
import numpy as np
import tensorflow as tf

from pathlib import Path
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0


# ============================================================
# KRISHINAYAN RICE V5
# ORIGINAL DATASET + REAL FIELD DATASET
# ============================================================

print("\n====================================================")
print("          KRISHINAYAN RICE MODEL V5")
print("     ORIGINAL + REAL FIELD DATASET TRAINING")
print("====================================================\n")


# ============================================================
# CONFIG
# ============================================================

ORIGINAL_DATASET = os.path.expanduser(
    "~/Downloads/Rice leaf disease"
)

ORIGINAL_TRAIN = os.path.join(
    ORIGINAL_DATASET,
    "Training data"
)

ORIGINAL_VAL = os.path.join(
    ORIGINAL_DATASET,
    "Validation data"
)

ORIGINAL_TEST = os.path.join(
    ORIGINAL_DATASET,
    "Testing data"
)


FIELD_DATASET = os.path.expanduser(
    "~/Documents/KrishiNayan/ml/data/rice_field"
)

FIELD_TRAIN = os.path.join(
    FIELD_DATASET,
    "train"
)

FIELD_VAL = os.path.join(
    FIELD_DATASET,
    "validation"
)

FIELD_TEST = os.path.join(
    FIELD_DATASET,
    "test"
)


MODEL_DIR = "backend/models"

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


MODEL_PATH = os.path.join(
    MODEL_DIR,
    "KrishiNayan_Rice_EfficientNetB0_v5.keras"
)


CLASS_NAMES_PATH = os.path.join(
    MODEL_DIR,
    "rice_class_names.json"
)


IMG_SIZE = (300, 300)

BATCH_SIZE = 16

PHASE1_EPOCHS = 12

PHASE2_EPOCHS = 30

ORIGINAL_REPEAT = 2
FIELD_REPEAT = 1

SEED = 42


# ============================================================
# REPRODUCIBILITY
# ============================================================

random.seed(SEED)

np.random.seed(SEED)

tf.random.set_seed(SEED)


# ============================================================
# FIXED 8-CLASS MAPPING
# ============================================================

CLASS_NAMES = [
    "Bacterial Leaf Blight",
    "Brown Spot",
    "Healthy Rice Leaf",
    "Leaf Blast",
    "Leaf scald",
    "Narrow Brown Leaf Spot",
    "Rice Hispa",
    "Sheath Blight"
]


CLASS_TO_INDEX = {
    name: index
    for index, name in enumerate(CLASS_NAMES)
}


# ============================================================
# FIELD DATASET MAPPING
#
# RiceLeafBD contains only four classes.
#
# Those four classes are mapped into our 8-class model.
# ============================================================

FIELD_CLASS_MAPPING = {

    "Leaf Blast":
        "Leaf Blast",

    "Narrow Brown Leaf Spot":
        "Narrow Brown Leaf Spot",

    "Healthy Rice Leaf":
        "Healthy Rice Leaf",

    "Sheath Blight":
        "Sheath Blight"
}


# ============================================================
# VALID IMAGE EXTENSIONS
# ============================================================

VALID_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".JPG",
    ".JPEG",
    ".PNG"
}


# ============================================================
# CHECK DATASET DIRECTORIES
# ============================================================

print("==============================")
print("CHECKING DATASETS")
print("==============================")


required_directories = [

    ORIGINAL_TRAIN,
    ORIGINAL_VAL,
    ORIGINAL_TEST,

    FIELD_TRAIN,
    FIELD_VAL,
    FIELD_TEST
]


for directory in required_directories:

    if not os.path.exists(directory):

        raise FileNotFoundError(
            "\nDataset folder not found:\n"
            + directory
        )


print("Original dataset: FOUND")

print("RiceLeafBD field dataset: FOUND")


# ============================================================
# COLLECT ORIGINAL DATASET
# ============================================================

def collect_original_dataset(directory):

    image_paths = []

    labels = []

    directory = Path(directory)

    for class_name in CLASS_NAMES:

        class_directory = directory / class_name

        if not class_directory.exists():

            raise FileNotFoundError(
                f"\nMissing original class:\n"
                f"{class_directory}"
            )

        for file in class_directory.rglob("*"):

            if file.is_file() and file.suffix in VALID_EXTENSIONS:

                image_paths.append(
                    str(file)
                )

                labels.append(
                    CLASS_TO_INDEX[class_name]
                )

    return image_paths, labels


# ============================================================
# COLLECT FIELD DATASET
# ============================================================

def collect_field_dataset(directory):

    image_paths = []

    labels = []

    directory = Path(directory)

    for field_class, clean_class in FIELD_CLASS_MAPPING.items():

        class_directory = directory / field_class

        if not class_directory.exists():

            raise FileNotFoundError(
                f"\nMissing field class:\n"
                f"{class_directory}\n\n"
                f"Expected field classes:\n"
                f"{list(FIELD_CLASS_MAPPING.keys())}"
            )

        clean_index = CLASS_TO_INDEX[
            clean_class
        ]

        for file in class_directory.rglob("*"):

            if file.is_file() and file.suffix in VALID_EXTENSIONS:

                image_paths.append(
                    str(file)
                )

                labels.append(
                    clean_index
                )

    return image_paths, labels


# ============================================================
# LOAD ORIGINAL DATA
# ============================================================

print("\n==============================")
print("COLLECTING ORIGINAL DATA")
print("==============================")


original_train_paths, original_train_labels = \
    collect_original_dataset(
        ORIGINAL_TRAIN
    )


original_val_paths, original_val_labels = \
    collect_original_dataset(
        ORIGINAL_VAL
    )


original_test_paths, original_test_labels = \
    collect_original_dataset(
        ORIGINAL_TEST
    )


print(
    "Original train:",
    len(original_train_paths)
)

print(
    "Original validation:",
    len(original_val_paths)
)

print(
    "Original test:",
    len(original_test_paths)
)


# ============================================================
# LOAD FIELD DATA
# ============================================================

print("\n==============================")
print("COLLECTING FIELD DATA")
print("==============================")


field_train_paths, field_train_labels = \
    collect_field_dataset(
        FIELD_TRAIN
    )


field_val_paths, field_val_labels = \
    collect_field_dataset(
        FIELD_VAL
    )


field_test_paths, field_test_labels = \
    collect_field_dataset(
        FIELD_TEST
    )


print(
    "Field train:",
    len(field_train_paths)
)

print(
    "Field validation:",
    len(field_val_paths)
)

print(
    "Field test:",
    len(field_test_paths)
)


# ============================================================
# PRINT FIELD DISTRIBUTION
# ============================================================

print("\n==============================")
print("FIELD DATA DISTRIBUTION")
print("==============================")


for index, class_name in enumerate(CLASS_NAMES):

    count = sum(
        label == index
        for label in field_train_labels
    )

    if count > 0:

        print(
            f"{class_name}: {count}"
        )


# ============================================================
# BALANCED SOURCE TRAINING
#
# Original dataset is repeated so that the model does not
# become overly specialized to RiceLeafBD field images.
#
# Field data is kept once because it already gives us strong
# real-world performance.
# ============================================================

print("\n==============================")
print("BALANCING TRAINING SOURCES")
print("==============================")


# Repeat ORIGINAL dataset
train_paths = (
    original_train_paths * ORIGINAL_REPEAT
    +
    field_train_paths * FIELD_REPEAT
)

train_labels = (
    original_train_labels * ORIGINAL_REPEAT
    +
    field_train_labels * FIELD_REPEAT
)


print(
    "Original samples used:",
    len(original_train_paths) * ORIGINAL_REPEAT
)

print(
    "Field samples used:",
    len(field_train_paths) * FIELD_REPEAT
)

print(
    "Total training samples:",
    len(train_paths)
)


# ============================================================
# COMBINE VALIDATION DATA
# ============================================================

val_paths = (
    original_val_paths
    +
    field_val_paths
)


val_labels = (
    original_val_labels
    +
    field_val_labels
)


# ============================================================
# SHUFFLE TRAINING DATA
# ============================================================

combined_train = list(
    zip(
        train_paths,
        train_labels
    )
)


random.shuffle(
    combined_train
)


train_paths = [
    item[0]
    for item in combined_train
]


train_labels = [
    item[1]
    for item in combined_train
]


# ============================================================
# CLASS DISTRIBUTION
# ============================================================

print("\n==============================")
print("COMBINED TRAIN DISTRIBUTION")
print("==============================")


class_counts = np.bincount(
    np.array(train_labels),
    minlength=len(CLASS_NAMES)
)


for index, class_name in enumerate(CLASS_NAMES):

    print(
        f"{class_name}: "
        f"{class_counts[index]}"
    )


# ============================================================
# IMAGE LOADING
# ============================================================

def load_image(path, label):

    image = tf.io.read_file(
        path
    )

    image = tf.image.decode_image(
        image,
        channels=3,
        expand_animations=False
    )

    image.set_shape(
        [None, None, 3]
    )

    image = tf.image.resize(
        image,
        IMG_SIZE
    )

    image = tf.cast(
        image,
        tf.float32
    )

    return (
        image,
        tf.cast(
            label,
            tf.int32
        )
    )


# ============================================================
# DATA AUGMENTATION
#
# Designed to simulate real farmer photographs:
# rotation, crop/zoom, translation and lighting changes.
# ============================================================

data_augmentation = tf.keras.Sequential(

    [

        layers.RandomFlip(
            "horizontal"
        ),

        layers.RandomRotation(
            0.08
        ),

        layers.RandomZoom(
            height_factor=(-0.10, 0.15),
            width_factor=(-0.10, 0.15)
        ),

        layers.RandomTranslation(
            height_factor=0.05,
            width_factor=0.05
        ),

        layers.RandomContrast(
            0.15
        ),

        layers.RandomBrightness(
            0.10
        ),

        layers.RandomSaturation(
            0.10
        ),

    ],

    name="rice_field_augmentation"
)


# ============================================================
# TRAIN DATASET
# ============================================================

train_ds = tf.data.Dataset.from_tensor_slices(
    (
        train_paths,
        train_labels
    )
)


train_ds = train_ds.shuffle(
    buffer_size=len(train_paths),
    seed=SEED,
    reshuffle_each_iteration=True
)


train_ds = train_ds.map(
    load_image,
    num_parallel_calls=tf.data.AUTOTUNE
)


def augment_training(
    image,
    label
):

    image = data_augmentation(
        image,
        training=True
    )

    return (
        image,
        label
    )


train_ds = train_ds.map(
    augment_training,
    num_parallel_calls=tf.data.AUTOTUNE
)


train_ds = train_ds.batch(
    BATCH_SIZE
)


train_ds = train_ds.prefetch(
    tf.data.AUTOTUNE
)


# ============================================================
# VALIDATION DATASET
# ============================================================

val_ds = tf.data.Dataset.from_tensor_slices(
    (
        val_paths,
        val_labels
    )
)


val_ds = val_ds.map(
    load_image,
    num_parallel_calls=tf.data.AUTOTUNE
)


val_ds = val_ds.batch(
    BATCH_SIZE
)


val_ds = val_ds.prefetch(
    tf.data.AUTOTUNE
)


# ============================================================
# CLASS WEIGHTS
#
# Gentle square-root balancing.
#
# We don't want minority classes to dominate training.
# ============================================================

total_samples = len(
    train_labels
)


class_weights = {}


for index, count in enumerate(class_counts):

    if count == 0:

        class_weights[index] = 1.0

    else:

        weight = np.sqrt(
            total_samples /
            (
                len(CLASS_NAMES)
                * count
            )
        )

        class_weights[index] = float(
            np.clip(
                weight,
                0.85,
                1.20
            )
        )


print("\n==============================")
print("CLASS WEIGHTS")
print("==============================")


for index, class_name in enumerate(CLASS_NAMES):

    print(
        f"{class_name}: "
        f"{class_weights[index]:.3f}"
    )


# ============================================================
# BUILD EFFICIENTNETB0
# ============================================================

print("\n==============================")
print("BUILDING EFFICIENTNETB0")
print("==============================")


base_model = EfficientNetB0(

    include_top=False,

    weights="imagenet",

    input_shape=(
        IMG_SIZE[0],
        IMG_SIZE[1],
        3
    )
)


# ============================================================
# PHASE 1
#
# Freeze ImageNet backbone.
# Train classification head first.
# ============================================================

base_model.trainable = False


inputs = layers.Input(
    shape=(
        IMG_SIZE[0],
        IMG_SIZE[1],
        3
    )
)


x = base_model(
    inputs,
    training=False
)


x = layers.GlobalAveragePooling2D()(
    x
)


x = layers.BatchNormalization()(
    x
)


x = layers.Dropout(
    0.35
)(
    x
)


x = layers.Dense(
    256,
    activation="relu"
)(
    x
)


x = layers.BatchNormalization()(
    x
)


x = layers.Dropout(
    0.30
)(
    x
)


outputs = layers.Dense(
    len(CLASS_NAMES),
    activation="softmax"
)(
    x
)


model = models.Model(
    inputs,
    outputs
)


print("\nModel created.")


# ============================================================
# PHASE 1 COMPILE
# ============================================================

print("\n==============================")
print("PHASE 1: CLASSIFIER TRAINING")
print("==============================")


model.compile(

    optimizer=tf.keras.optimizers.Adam(
        learning_rate=3e-4
    ),

    loss="sparse_categorical_crossentropy",

    metrics=[
        "accuracy"
    ]
)


# ============================================================
# PHASE 1 CALLBACKS
# ============================================================

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

        mode="max",

        restore_best_weights=True,

        verbose=1
    )
]


# ============================================================
# PHASE 1 TRAINING
# ============================================================

history_phase1 = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=PHASE1_EPOCHS,

    class_weight=class_weights,

    callbacks=callbacks_phase1
)


# ============================================================
# LOAD BEST PHASE 1 MODEL
# ============================================================

print("\nLoading best Phase 1 model...")


model = tf.keras.models.load_model(
    MODEL_PATH
)


# ============================================================
# FIND EFFICIENTNET BACKBONE
# ============================================================

print("\n==============================")
print("PREPARING FINE-TUNING")
print("==============================")


base_model = None


for layer in model.layers:

    if isinstance(
        layer,
        tf.keras.Model
    ):

        if "efficientnet" in layer.name.lower():

            base_model = layer

            break


if base_model is None:

    raise RuntimeError(
        "Could not find EfficientNet backbone."
    )


print(
    "Backbone found:",
    base_model.name
)


# ============================================================
# PHASE 2 FINE-TUNING
# ============================================================

base_model.trainable = True


# Freeze earlier EfficientNet layers.
# Fine-tune only the upper portion.

fine_tune_from = max(
    0,
    len(base_model.layers) - 120
)


for layer_index, layer in enumerate(
    base_model.layers
):

    if layer_index < fine_tune_from:

        layer.trainable = False

    else:

        layer.trainable = True


# Keep BatchNorm frozen.
#
# This is important because the field dataset is
# relatively small compared with ImageNet.

for layer in base_model.layers:

    if isinstance(
        layer,
        layers.BatchNormalization
    ):

        layer.trainable = False


# ============================================================
# PHASE 2 COMPILE
#
# IMPORTANT:
# SparseCategoricalCrossentropy does NOT support
# label_smoothing.
#
# Therefore we use normal sparse categorical loss here.
# ============================================================

print("\n==============================")
print("PHASE 2: FINE-TUNING")
print("==============================")


model.compile(

    optimizer=tf.keras.optimizers.Adam(

        learning_rate=5e-6
    ),

    loss="sparse_categorical_crossentropy",

    metrics=[
        "accuracy"
    ]
)


# ============================================================
# PHASE 2 CALLBACKS
# ============================================================

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

        patience=6,

        mode="max",

        restore_best_weights=True,

        verbose=1
    )
]


# ============================================================
# PHASE 2 TRAINING
# ============================================================

history_phase2 = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=PHASE2_EPOCHS,

    class_weight=class_weights,

    callbacks=callbacks_phase2
)


# ============================================================
# LOAD BEST V5 MODEL
# ============================================================

print("\nLoading best V5 model...")


model = tf.keras.models.load_model(
    MODEL_PATH
)


# ============================================================
# SAVE CLASS NAMES
# ============================================================

with open(
    CLASS_NAMES_PATH,
    "w"
) as f:

    json.dump(
        CLASS_NAMES,
        f,
        indent=2
    )


# ============================================================
# TEST DATASET CREATOR
# ============================================================

def create_test_dataset(
    paths,
    labels
):

    dataset = tf.data.Dataset.from_tensor_slices(
        (
            paths,
            labels
        )
    )


    dataset = dataset.map(
        load_image,
        num_parallel_calls=tf.data.AUTOTUNE
    )


    dataset = dataset.batch(
        BATCH_SIZE
    )


    dataset = dataset.prefetch(
        tf.data.AUTOTUNE
    )


    return dataset


# ============================================================
# ORIGINAL TEST
# ============================================================

print("\n==============================")
print("ORIGINAL DATASET TEST")
print("==============================")


original_test_ds = create_test_dataset(

    original_test_paths,

    original_test_labels
)


original_loss, original_accuracy = model.evaluate(

    original_test_ds,

    verbose=1
)


print(
    "\nOriginal Test Accuracy:",
    f"{original_accuracy:.4f}"
)


# ============================================================
# FIELD TEST
# ============================================================

print("\n==============================")
print("REAL FIELD DATASET TEST")
print("==============================")


field_test_ds = create_test_dataset(

    field_test_paths,

    field_test_labels
)


field_loss, field_accuracy = model.evaluate(

    field_test_ds,

    verbose=1
)


print(
    "\nReal Field Test Accuracy:",
    f"{field_accuracy:.4f}"
)


# ============================================================
# COMBINED TEST
# ============================================================

print("\n==============================")
print("COMBINED TEST")
print("==============================")


combined_test_paths = (

    original_test_paths
    +
    field_test_paths
)


combined_test_labels = (

    original_test_labels
    +
    field_test_labels
)


combined_test_ds = create_test_dataset(

    combined_test_paths,

    combined_test_labels
)


combined_loss, combined_accuracy = model.evaluate(

    combined_test_ds,

    verbose=1
)


print(
    "\nCombined Test Accuracy:",
    f"{combined_accuracy:.4f}"
)


# ============================================================
# FINAL RESULTS
# ============================================================

print("\n")
print("====================================================")
print("                 V5 FINAL RESULTS")
print("====================================================")


print(
    f"Original Test Accuracy : "
    f"{original_accuracy:.4f}"
)


print(
    f"Field Test Accuracy    : "
    f"{field_accuracy:.4f}"
)


print(
    f"Combined Accuracy      : "
    f"{combined_accuracy:.4f}"
)


print("====================================================")


# ============================================================
# SAVE FINAL MODEL
# ============================================================

model.save(
    MODEL_PATH
)


print("\nModel saved to:")

print(
    MODEL_PATH
)


print("\nClass names saved to:")

print(
    CLASS_NAMES_PATH
)


print("\n==============================")
print("V5 TRAINING COMPLETE")
print("==============================")