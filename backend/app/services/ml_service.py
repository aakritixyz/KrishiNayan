import io
import json

from functools import lru_cache

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError
from tensorflow import keras

from app.core.config import (
    CLASS_NAMES_PATH,
    CONFIDENCE_THRESHOLD,
    MODEL_PATH
)


@lru_cache(maxsize=1)
def load_model():
    """
    Load the trained model only once.
    Later predictions reuse the same model.
    """
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found: {MODEL_PATH}"
        )

    model = keras.models.load_model(
        MODEL_PATH,
        compile=False
    )

    return model


@lru_cache(maxsize=1)
def load_class_information():
    """
    Load the disease names and expected image size.
    """
    if not CLASS_NAMES_PATH.exists():
        raise FileNotFoundError(
            f"Class file not found: {CLASS_NAMES_PATH}"
        )

    with open(
        CLASS_NAMES_PATH,
        "r",
        encoding="utf-8"
    ) as file:
        class_data = json.load(file)

    if isinstance(class_data, list):
        class_names = class_data
        image_size = (224, 224)

    else:
        class_names = (
            class_data.get("display_class_names")
            or class_data.get("folder_class_names")
        )

        image_size = tuple(
            class_data.get(
                "image_size",
                [224, 224]
            )
        )

    if not class_names:
        raise ValueError(
            "No class names found in class_names.json"
        )

    return class_names, image_size


def predict_disease(image_bytes):
    """
    Predict a tomato disease from uploaded image bytes.
    """
    if not image_bytes:
        raise ValueError(
            "The uploaded image is empty."
        )

    try:
        image = Image.open(
            io.BytesIO(image_bytes)
        )

        # Correct rotation from phone-camera metadata.
        image = ImageOps.exif_transpose(image)

        # Convert every image to three RGB channels.
        image = image.convert("RGB")

    except UnidentifiedImageError as error:
        raise ValueError(
            "The uploaded file is not a valid image."
        ) from error

    class_names, image_size = (
        load_class_information()
    )

    image = image.resize(image_size)

    image_array = np.asarray(
        image,
        dtype=np.float32
    )

    # Add batch dimension:
    # (224, 224, 3) becomes (1, 224, 224, 3).
    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    model = load_model()

    probabilities = model.predict(
        image_array,
        verbose=0
    )[0]

    predicted_index = int(
        np.argmax(probabilities)
    )

    confidence = float(
        probabilities[predicted_index]
    )

    if predicted_index >= len(class_names):
        raise ValueError(
            "Model output does not match class_names.json."
        )

    predicted_disease = class_names[
        predicted_index
    ]

    status = (
        "supported"
        if confidence >= CONFIDENCE_THRESHOLD
        else "uncertain"
    )

    return {
        "disease": predicted_disease,
        "confidence": round(
            confidence * 100,
            2
        ),
        "status": status
    }
