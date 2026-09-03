import base64
import hashlib
import io
import json

from functools import lru_cache

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import (
    CONFIDENCE_THRESHOLD,
    INFERENCE_BACKEND,
    get_crop_config
)


@lru_cache(maxsize=1)
def _load_tensorflow():
    import tensorflow as tf
    from tensorflow import keras

    return tf, keras


@lru_cache(maxsize=None)
def load_model(crop: str):
    """
    Load the trained model for a given crop, only once per crop.
    Later predictions for the same crop reuse the cached model.
    """
    _, crop_settings = get_crop_config(crop)
    model_path = crop_settings["model_path"]

    if not model_path.exists():
        raise FileNotFoundError(
            f"Model file not found for crop '{crop}': {model_path}. "
            "This crop's model may not be trained/uploaded yet."
        )

    _, keras = _load_tensorflow()

    model = keras.models.load_model(
        model_path,
        compile=False
    )

    return model


@lru_cache(maxsize=None)
def load_class_information(crop: str):
    """
    Load the disease names and expected image size for a given crop.
    """
    _, crop_settings = get_crop_config(crop)
    class_names_path = crop_settings["class_names_path"]

    if not class_names_path.exists():
        raise FileNotFoundError(
            f"Class file not found for crop '{crop}': {class_names_path}. "
            "This crop's model may not be trained/uploaded yet."
        )

    with open(
        class_names_path,
        "r",
        encoding="utf-8"
    ) as file:
        class_data = json.load(file)

    if isinstance(class_data, list):
        class_names = class_data
        image_size = tuple(
            crop_settings.get(
                "image_size",
                (224, 224)
            )
        )

    else:
        class_names = (
            class_data.get("display_class_names")
            or class_data.get("folder_class_names")
        )

        image_size = tuple(
            class_data.get(
                "image_size",
                crop_settings.get(
                    "image_size",
                    (224, 224)
                )
            )
        )

    if not class_names:
        raise ValueError(
            f"No class names found in class names file for crop '{crop}'."
        )

    return class_names, image_size


def predict_disease(image_bytes, crop: str = "tomato"):
    """
    Predict a disease from uploaded leaf image bytes, for the
    given crop (defaults to tomato for backward compatibility).
    """
    if not image_bytes:
        raise ValueError(
            "The uploaded image is empty."
        )

    crop_key, _ = get_crop_config(crop)

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

    leaf_quality = estimate_leaf_image_quality(image)
    if not leaf_quality["is_likely_leaf"]:
        raise ValueError(
            "This does not look like a crop leaf photo. Upload a clear image "
            "where one leaf fills most of the frame."
        )

    class_names, image_size = (
        load_class_information(crop_key)
    )

    if INFERENCE_BACKEND == "demo":
        return _predict_demo(
            image_bytes=image_bytes,
            crop_key=crop_key,
            class_names=class_names,
        )

    if INFERENCE_BACKEND != "tensorflow":
        raise ValueError(
            "Unsupported inference backend "
            f"'{INFERENCE_BACKEND}'. Use 'tensorflow' or 'demo'."
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

    model = load_model(crop_key)

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
            f"Model output does not match class names for crop '{crop_key}'."
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
        "crop": crop_key,
        "disease": predicted_disease,
        "confidence": round(
            confidence * 100,
            2
        ),
        "status": status
    }


def estimate_leaf_image_quality(image: Image.Image):
    """
    Lightweight pre-inference guard for obvious non-leaf uploads.

    This is intentionally conservative: it checks for vegetation-like green,
    yellow and brown pixels rather than trying to classify the object. It should
    reject faces/screens/documents while still allowing diseased leaves that are
    partly yellow or brown.
    """
    sample = image.resize((160, 160))
    rgb = np.asarray(sample, dtype=np.float32) / 255.0
    red = rgb[:, :, 0]
    green = rgb[:, :, 1]
    blue = rgb[:, :, 2]

    max_channel = np.max(rgb, axis=2)
    min_channel = np.min(rgb, axis=2)
    saturation = max_channel - min_channel

    green_pixels = (
        (green > 0.22)
        & (green >= red * 0.85)
        & (green >= blue * 1.05)
        & (saturation > 0.08)
    )
    yellow_brown_pixels = (
        (red > 0.22)
        & (green > 0.16)
        & (blue < green * 0.85)
        & (saturation > 0.10)
    )
    skin_like_pixels = (
        (red > 0.35)
        & (green > 0.20)
        & (blue > 0.12)
        & (red > green)
        & (green > blue)
        & ((red - green) < 0.35)
        & ((green - blue) < 0.25)
        & (saturation < 0.45)
    )

    vegetation_ratio = float(
        np.mean(green_pixels | yellow_brown_pixels)
    )
    green_ratio = float(np.mean(green_pixels))
    skin_like_ratio = float(np.mean(skin_like_pixels))
    average_saturation = float(np.mean(saturation))
    is_likely_leaf = (
        (
            vegetation_ratio >= 0.08
            or (vegetation_ratio >= 0.045 and average_saturation >= 0.16)
        )
        and not (skin_like_ratio >= 0.45 and green_ratio < 0.08)
    )

    return {
        "is_likely_leaf": bool(is_likely_leaf),
        "vegetation_ratio": round(vegetation_ratio, 4),
        "green_ratio": round(green_ratio, 4),
        "skin_like_ratio": round(skin_like_ratio, 4),
        "average_saturation": round(average_saturation, 4),
    }


def _predict_demo(image_bytes, crop_key: str, class_names: list[str]):
    """
    Low-resource production fallback for Render Free demos. It keeps
    the full scan/advisory/recovery flow responsive when TensorFlow
    cold starts are too slow for the host.
    """
    unhealthy_classes = [
        name for name in class_names if name.strip().lower() != "healthy"
    ]
    candidate_classes = unhealthy_classes or class_names
    digest = hashlib.sha256(image_bytes + crop_key.encode("utf-8")).digest()
    predicted_disease = candidate_classes[digest[0] % len(candidate_classes)]
    confidence = 82 + (digest[1] % 14)

    return {
        "crop": crop_key,
        "disease": predicted_disease,
        "confidence": float(confidence),
        "status": "demo-fast"
    }


def _decode_and_resize_image(image_bytes, crop: str):
    """
    Shared decode + resize step used by both prediction and
    Grad-CAM, so the model always sees the same preprocessing.
    """
    image = Image.open(io.BytesIO(image_bytes))
    image = ImageOps.exif_transpose(image)
    image = image.convert("RGB")

    _, image_size = load_class_information(crop)
    image = image.resize(image_size)

    return image, image_size


@lru_cache(maxsize=None)
def _find_last_conv_layer_name(crop: str):
    """
    Find the name of the last convolutional layer in the given
    crop's model (looking inside nested sub-models like
    EfficientNetB0), used as the Grad-CAM target layer.
    """
    model = load_model(crop)
    _, keras = _load_tensorflow()

    for layer in reversed(model.layers):
        if isinstance(layer, keras.layers.Conv2D):
            return layer.name

        if isinstance(layer, keras.Model):
            for inner_layer in reversed(layer.layers):
                if isinstance(inner_layer, keras.layers.Conv2D):
                    return inner_layer.name

    raise ValueError(
        f"No convolution layer found for Grad-CAM (crop: {crop})."
    )


def _make_gradcam_heatmap(image_array, model, pred_index):
    """
    Run a forward pass with gradient tracking on the base model's
    convolution output to build a Grad-CAM heatmap for pred_index.

    Mirrors the training-notebook implementation, using the same
    named layers: data_augmentation -> efficientnetb0 ->
    global_average_pooling -> dropout -> disease_predictions.

    This assumes every crop model is trained with the same layer
    names (i.e. the same notebook template/architecture). If a
    crop's model uses different layer names, Grad-CAM will fail
    gracefully (see generate_gradcam_overlay) rather than crash
    the main diagnosis.
    """
    tf, _ = _load_tensorflow()

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


def generate_gradcam_overlay(image_bytes, crop: str = "tomato"):
    """
    Generate a Grad-CAM heatmap overlay for the uploaded image and
    given crop, returned as a base64-encoded PNG data URI, along
    with the disease/confidence it was generated for.

    Returns None if anything goes wrong — Grad-CAM is supporting
    explainability, not the core diagnosis, so a failure here
    should never break the main /predict response.
    """
    try:
        crop_key, _ = get_crop_config(crop)

        image, image_size = _decode_and_resize_image(
            image_bytes,
            crop_key
        )

        original_array = np.asarray(image, dtype=np.uint8)

        image_array = np.expand_dims(
            np.asarray(image, dtype=np.float32),
            axis=0
        )

        model = load_model(crop_key)
        class_names, _ = load_class_information(crop_key)

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
