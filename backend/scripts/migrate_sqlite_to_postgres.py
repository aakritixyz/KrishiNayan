"""
Copy local SQLite prototype data into the configured PostgreSQL database.

Usage:
    KRISHINAYAN_SOURCE_SQLITE=./storage/krishinayan.db \
    KRISHINAYAN_DATABASE_URL=postgresql+psycopg://... \
    python scripts/migrate_sqlite_to_postgres.py
"""

import os
from pathlib import Path
import sys

from sqlalchemy import create_engine, select, text

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import Base
from app.models.farm_plot import FarmPlot
from app.models.officer_advisory import OfficerAdvisory
from app.models.officer_registration_request import OfficerRegistrationRequest
from app.models.recovery import RecoveryPlan, RecoveryTask
from app.models.scan_record import ScanRecord
from app.models.user import User


TABLES = [
    User.__table__,
    FarmPlot.__table__,
    ScanRecord.__table__,
    RecoveryPlan.__table__,
    RecoveryTask.__table__,
    OfficerAdvisory.__table__,
    OfficerRegistrationRequest.__table__,
]


def _sqlite_url() -> str:
    source = os.getenv("KRISHINAYAN_SOURCE_SQLITE", "./storage/krishinayan.db")
    path = Path(source).expanduser().resolve()
    if not path.exists():
        raise SystemExit(f"SQLite source database not found: {path}")
    return f"sqlite:///{path}"


def _postgres_url() -> str:
    target = os.getenv("KRISHINAYAN_DATABASE_URL", "")
    if not target.startswith("postgresql"):
        raise SystemExit(
            "KRISHINAYAN_DATABASE_URL must point to Supabase/PostgreSQL."
        )
    return target


def _existing_ids(connection, table) -> set[int]:
    return {
        row[0]
        for row in connection.execute(select(table.c.id))
    }


def _reset_identity_sequences(connection):
    for table in TABLES:
        connection.execute(
            text(
                "select setval("
                "pg_get_serial_sequence(:table_name, 'id'), "
                "coalesce((select max(id) from "
                f"{table.name}"
                "), 1), "
                "true"
                ")"
            ),
            {"table_name": f"public.{table.name}"},
        )


def main():
    source_engine = create_engine(_sqlite_url())
    target_engine = create_engine(_postgres_url())

    Base.metadata.create_all(bind=target_engine)

    with source_engine.begin() as source, target_engine.begin() as target:
        for table in TABLES:
            existing = _existing_ids(target, table)
            rows = [
                dict(row._mapping)
                for row in source.execute(select(table).order_by(table.c.id))
                if row._mapping["id"] not in existing
            ]
            if rows:
                target.execute(table.insert(), rows)
            print(f"{table.name}: copied {len(rows)} row(s)")

        if target_engine.dialect.name == "postgresql":
            _reset_identity_sequences(target)


if __name__ == "__main__":
    main()
