import os
from pathlib import Path
import tempfile
import sys
import types


# This module-level code runs before pytest imports any test file
# in this directory (conftest.py is always loaded first), and
# before `main` (and therefore app.core.config/database) is
# imported anywhere - so the test suite always gets its own,
# disposable SQLite file instead of touching backend/storage/.
_TEST_DB_PATH = os.path.join(
    tempfile.gettempdir(),
    "krishinayan_test.db"
)

if os.path.exists(_TEST_DB_PATH):
    os.remove(_TEST_DB_PATH)

os.environ["KRISHINAYAN_DATABASE_URL"] = f"sqlite:///{_TEST_DB_PATH}"
os.environ.setdefault(
    "KRISHINAYAN_JWT_SECRET",
    "test-only-secret-key-do-not-use-in-production-32bytes"
)
os.environ["KRISHINAYAN_DISABLE_RATE_LIMIT"] = "true"

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


if os.getenv("KRISHINAYAN_TEST_STUB_TENSORFLOW", "").lower() in {
    "1",
    "true",
    "yes",
}:
    tensorflow = types.ModuleType("tensorflow")
    keras = types.ModuleType("tensorflow.keras")
    keras.models = types.SimpleNamespace(load_model=lambda *args, **kwargs: None)
    keras.layers = types.SimpleNamespace(Conv2D=object)
    keras.Model = object
    tensorflow.keras = keras
    tensorflow.GradientTape = object
    tensorflow.newaxis = None
    tensorflow.reduce_mean = lambda *args, **kwargs: None
    tensorflow.maximum = lambda *args, **kwargs: None
    tensorflow.squeeze = lambda *args, **kwargs: None
    sys.modules.setdefault("tensorflow", tensorflow)
    sys.modules.setdefault("tensorflow.keras", keras)
