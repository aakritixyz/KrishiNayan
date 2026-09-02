import importlib

import app.core.config as config


def test_database_url_defaults_to_psycopg_driver_for_postgres(monkeypatch):
    monkeypatch.setenv(
        "KRISHINAYAN_DATABASE_URL",
        "postgresql://user:pass@example.com:5432/postgres?sslmode=require",
    )

    reloaded = importlib.reload(config)

    assert reloaded.DATABASE_URL.startswith("postgresql+psycopg://")
