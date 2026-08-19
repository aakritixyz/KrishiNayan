import base64
import io
import json

from functools import lru_cache

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError
import tensorflow as tf
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


def _decode_and_resize_image(image_bytes):
    """
    Shared decode + resize step used by both prediction and
    Grad-CAM, so the model always sees the same preprocessing.
    """
    image = Image.open(io.BytesIO(image_bytes))
    image = ImageOps.exif_transpose(image)
    image = image.convert("RGB")

    _, image_size = load_class_information()
    image = image.resize(image_size)

    return image, image_size


@lru_cache(maxsize=1)
def _find_last_conv_layer_name():
    """
    Find the name of the last convolutional layer in the model
    (looking inside nested sub-models like EfficientNetB0),
    used as the Grad-CAM target layer.
    """
    model = load_model()

    for layer in reversed(model.layers):
        if isinstance(layer, keras.layers.Conv2D):
            return layer.name

        if isinstance(layer, keras.Model):
            for inner_layer in reversed(layer.layers):
                if isinstance(inner_layer, keras.layers.Conv2D):
                    return inner_layer.name

    raise ValueError("No convolution layer found for Grad-CAM.")


def _make_gradcam_heatmap(image_array, model, pred_index):
    """
    Run a forward pass with gradient tracking on the base model's
    convolution output to build a Grad-CAM heatmap for pred_index.

    Mirrors the training-notebook implementation, using the same
    named layers: data_augmentation -> efficientnetb0 ->
    global_average_pooling -> dropout -> disease_predictions.
    """
    data_augmentation = model.get_layer("data_augmentation")
    base_model = model.get_layer("efficientnetb0")
    pooling_layer = model.get_layer("global_average_pooling")
    dropout_layer = model.get_layer("dropout")
    prediction_layer = model.get_layer("disease_predictions")

    with tf.GradientTape() as tape:
        x = data_augmentation(image_array, training=False)

        conv_outputs = base_model(x, training=False)
        tape.watch(conv_outputs)

        x = pooling_layer(conv_outputs)
        x = dropout_layer(x, training=False)

        predictions = prediction_layer(x)
        class_channel = predictions[:, pred_index]

    grads = tape.gradient(class_channel, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]

    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0)

    max_value = tf.math.reduce_max(heatmap)

    if max_value == 0:
        return heatmap.numpy()

    heatmap = heatmap / max_value

    return heatmap.numpy()


def _apply_jet_colormap(grayscale_uint8):
    """
    Approximate the classic "jet" colormap (blue -> green -> red)
    using plain NumPy, so we don't need an OpenCV/matplotlib
    dependency just for this.
    """
    normalized = grayscale_uint8.astype(np.float32) / 255.0

    red = np.clip(1.5 - np.abs(4 * normalized - 3), 0, 1)
    green = np.clip(1.5 - np.abs(4 * normalized - 2), 0, 1)
    blue = np.clip(1.5 - np.abs(4 * normalized - 1), 0, 1)

    colored = np.stack([red, green, blue], axis=-1)

    return (colored * 255).astype(np.uint8)


def generate_gradcam_overlay(image_bytes):
    """
    Generate a Grad-CAM heatmap overlay for the uploaded image and
    return it as a base64-encoded PNG data URI, along with the
    disease/confidence it was generated for.

    Returns None if anything goes wrong — Grad-CAM is supporting
    explainability, not the core diagnosis, so a failure here
    should never break the main /predict response.
    """
    try:
        image, image_size = _decode_and_resize_image(image_bytes)

        original_array = np.asarray(image, dtype=np.uint8)

        image_array = np.expand_dims(
            np.asarray(image, dtype=np.float32),
            axis=0
        )

        model = load_model()
        class_names, _ = load_class_information()

        predictions = model.predict(image_array, verbose=0)[0]
        predicted_index = int(np.argmax(predictions))
        confidence = float(predictions[predicted_index])

        heatmap = _make_gradcam_heatmap(
            image_array,
            model,
            predicted_index
        )

        heatmap_image = Image.fromarray(
            np.uint8(255 * heatmap)
        ).resize(image_size, Image.BILINEAR)

        heatmap_resized = np.array(heatmap_image)
        heatmap_colored = _apply_jet_colormap(heatmap_resized)

        superimposed = (
            original_array.astype(np.float32) * 0.6
            + heatmap_colored.astype(np.float32) * 0.4
        )
        superimposed = np.clip(superimposed, 0, 255).astype(np.uint8)

        output_buffer = io.BytesIO()
        Image.fromarray(superimposed).save(output_buffer, format="PNG")

        encoded_image = base64.b64encode(
            output_buffer.getvalue()
        ).decode("utf-8")

        return {
            "disease": class_names[predicted_index],
            "confidence": round(confidence * 100, 2),
            "heatmap_image": f"data:image/png;base64,{encoded_image}"
        }

    except Exception:
        return None
