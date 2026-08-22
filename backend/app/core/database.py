from sqlalchemy import create_engine
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

    Base.metadata.create_all(bind=engine)
