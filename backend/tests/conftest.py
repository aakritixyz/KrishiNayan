import os
import tempfile


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
