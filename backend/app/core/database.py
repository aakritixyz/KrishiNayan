from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import DATABASE_URL


connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


class Base(DeclarativeBase):
    pass


def get_db():
    """
    FastAPI dependency that yields a database session and always
    closes it, even if the request raises.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Create any tables that don't exist yet. Safe to call on every
    startup - existing tables and data are left untouched.
    """
    from app.models import user  # noqa: F401  (registers the model)
    from app.models import scan_record  # noqa: F401
    from app.models import officer_advisory  # noqa: F401

    Base.metadata.create_all(bind=engine)

    # Lightweight SQLite migration for this prototype. create_all() does not
    # add columns to an existing table, so older local databases are upgraded
    # in place without deleting farmer data.
    if DATABASE_URL.startswith("sqlite"):
        existing = {c["name"] for c in inspect(engine).get_columns("users")}
        migrations = {
            "role": "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'farmer'",
            "institutional_id": "ALTER TABLE users ADD COLUMN institutional_id VARCHAR",
            "organisation": "ALTER TABLE users ADD COLUMN organisation VARCHAR",
            "designation": "ALTER TABLE users ADD COLUMN designation VARCHAR",
            "access_state": "ALTER TABLE users ADD COLUMN access_state VARCHAR",
            "access_district": "ALTER TABLE users ADD COLUMN access_district VARCHAR",
            "is_active": "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1",
        }
        with engine.begin() as connection:
            for column, statement in migrations.items():
                if column not in existing:
                    connection.execute(text(statement))
            connection.execute(text(
                "UPDATE users SET role='farmer' WHERE role IS NULL OR role=''"
            ))
            connection.execute(text(
                "UPDATE users SET is_active=1 WHERE is_active IS NULL"
            ))

    _seed_demo_officer()


def _truthy_env(name: str) -> bool:
    import os
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


def _seed_demo_officer():
    """
    Optionally provision a demo officer for local/hackathon use.

    This is OFF by default so a public deployment never gains a predictable
    institutional account just by starting the application. To enable it, set
    KRISHINAYAN_ENABLE_DEMO_OFFICER=true and provide both the institutional ID
    and password via environment variables.
    """
    import os

    if not _truthy_env("KRISHINAYAN_ENABLE_DEMO_OFFICER"):
        return

    from app.core.security import hash_password
    from app.models.user import User

    officer_id = os.getenv("KRISHINAYAN_DEMO_OFFICER_ID", "").strip().upper()
    password = os.getenv("KRISHINAYAN_DEMO_OFFICER_PASSWORD", "")

    if not officer_id or not password:
        raise RuntimeError(
            "Demo officer seeding is enabled, but KRISHINAYAN_DEMO_OFFICER_ID "
            "and KRISHINAYAN_DEMO_OFFICER_PASSWORD are both required."
        )

    if len(password) < 12:
        raise RuntimeError(
            "KRISHINAYAN_DEMO_OFFICER_PASSWORD must be at least 12 characters."
        )

    db = SessionLocal()
    try:
        officer = db.query(User).filter(User.institutional_id == officer_id).first()
        if not officer:
            db.add(User(
                full_name=os.getenv(
                    "KRISHINAYAN_DEMO_OFFICER_NAME",
                    "District Agriculture Officer"
                ),
                email=None,
                phone=None,
                password_hash=hash_password(password),
                role="officer",
                institutional_id=officer_id,
                organisation=os.getenv(
                    "KRISHINAYAN_DEMO_ORGANISATION",
                    "District Agriculture Office"
                ),
                designation=os.getenv(
                    "KRISHINAYAN_DEMO_DESIGNATION",
                    "Agriculture Officer"
                ),
                access_state=os.getenv("KRISHINAYAN_DEMO_STATE", "Maharashtra"),
                access_district=os.getenv("KRISHINAYAN_DEMO_DISTRICT", "Pune"),
                is_active=True,
                profile_completed=True,
            ))
            db.commit()
    finally:
        db.close()
