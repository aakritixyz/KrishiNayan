import tensorflow as tf
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

MODEL_PATH = "backend/models/KrishiNayan_Rice_EfficientNetB0_v2.keras"
TEST_DIR = "/Users/Dell/Downloads/Rice leaf disease/Testing data"

model = tf.keras.models.load_model(MODEL_PATH)

test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=(224, 224),
    batch_size=16,
    shuffle=False
)

class_names = test_ds.class_names

y_true = np.concatenate([y.numpy() for x, y in test_ds])

predictions = model.predict(test_ds)
y_pred = np.argmax(predictions, axis=1)

print("\n==============================")
print("V2 CLASSIFICATION REPORT")
print("==============================")

print(classification_report(
    y_true,
    y_pred,
    target_names=class_names,
    digits=3
))

print("\n==============================")
print("V2 CONFUSION MATRIX")
print("==============================")

print(confusion_matrix(y_true, y_pred))