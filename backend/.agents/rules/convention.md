Here is an industry-standard production guide and coding convention style guide for **FastAPI**. This is tailored to establish standard configurations, clear layer boundaries, robust maintainability, and trivial unit testing/mocking.

---

# FastAPI Production Standards & Style Guide

## 1. Domain-Driven Project Architecture

Avoid putting all route logic in a single file or spreading logic across unorganized files. Use a structured layout that groups by technical responsibility or by business domain feature. The directory skeleton recommended below matches the architecture outlined in your assignment guidelines:

```text
backend/
├── app/
│   ├── main.py                  # App initialization, middleware, and router mounting only
│   ├── models.py                # Core DB Entities (SQLAlchemy/SQLModel / Beanie)
│   ├── schemas.py               # Request/Response Data Transfer Objects (Pydantic DTOs)
│   ├── auth.py                  # JWT hashing, parsing, and token generation utilities
│   ├── core/
│   │   └── config.py            # Global validation settings via Pydantic BaseSettings
│   ├── api/
│   │   ├── deps.py              # Injected global dependencies (get_db, get_current_user)
│   │   └── routers/
│   │       ├── auth.py          # Auth routes (/login, /register)
│   │       └── candidates.py    # Feature routes (/candidates)
│   └── services/
│       └── candidate_service.py # Pure isolation of domain logic and raw database executions
├── tests/
│   ├── conftest.py              # Pytest fixtures (Overridden DB sessions, client configs)
│   └── test_api.py              # Endpoint route tests
└── requirements.txt

```

---

## 2. Configuration Management via Environment Variables

Never read parameters via raw `os.environ.get()` inside random script paths. Consolidate your system configurations utilizing `pydantic-settings`. This validates the configuration at server startup, guaranteeing the engine crashes instantly if mandatory configuration variables are missing.

```python
# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import EmailStr

class Settings(BaseSettings):
    PROJECT_NAME: str = "Recruitment Workflow Portal"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    # Load settings from a localized root environment file safely
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()

```

---

## 3. Strict Layer Separation: DTOs vs. DB Models

- **Database Models (`app/models.py`)**: Define storage layout mapping database entities.
- **Pydantic Schemas (`app/schemas.py`)**: Handle validation, ingestion format parsing, and payload delivery restrictions.

**Rule**: _Never leak internal fields or return database ORM objects directly across boundaries without validating data transfer contracts._

```python
# app/schemas.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional

class CandidateBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role_applied: str
    skills: List[str]

# DTO variant consumed during ingestion (excludes automated metadata or secret attributes)
class CandidateCreate(CandidateBase):
    pass

# DTO variant returned over the API network (includes generated primary keys, safe tracking data)
class CandidateRead(CandidateBase):
    id: int
    status: str
    created_at: datetime

    class ModelConfig:
        from_attributes = True  # Allows FastAPI to transform ORM instances automatically

```

---

## 4. The Dependency Injection (DI) Pattern

Leverage FastAPI's built-in `Depends` mechanism for resources that use code contexts or connections, such as database sessions and authenticated session states. Avoid using global object instances across your functions.

```python
# app/api/deps.py
from typing import Generator
from sqlalchemy.orm import Session
from app.database import SessionLocal  # Assume configured connection factory

def get_db() -> Generator[Session, None, None]:
    """Provides a transactional database session scope per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Guarantees connection pool safety by disposing of resource cleanly

```

---

## 5. Domain Logic Extraction (Service Layer Pattern)

Routers should manage HTTP routing controls, endpoint metadata parameter definitions, and incoming payload validations. They should delegate complex business calculations and database reads to a service layer.

```python
# app/services/candidate_service.py
from sqlalchemy.orm import Session
from app import models, schemas

class CandidateService:
    @staticmethod
    def get_paginated(db: Session, status: str | None, offset: int, limit: int):
        query = db.query(models.Candidate)
        if status:
            query = query.filter(models.Candidate.status == status)
        return query.offset(offset).limit(limit).all()

```

By decoupling routers from database access, routing layers stay clean and declarative:

```python
# app/api/routers/candidates.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import schemas
from app.api.deps import get_db
from app.services.candidate_service import CandidateService

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("", response_model=List[schemas.CandidateRead])
def read_candidates(
    status: str | None = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50), # Enforces the assignment pagination max cap 50
    db: Session = Depends(get_db)
):
    """
    Fetch listed candidate profiles matching search filter states with explicit page boundaries.
    """
    return CandidateService.get_paginated(db, status=status, offset=offset, limit=limit)

```

---

## 6. Standard Asynchronous Handling & Mock LLM Simulation

When operations involve waiting on external network dependencies or asynchronous calls (like long-running AI summaries), use asynchronous programming keywords appropriately. Use non-blocking timers like `await asyncio.sleep()` to prevent blocking the application thread.

```python
import asyncio
from fastapi import APIRouter

router = APIRouter()

@router.post("/{id}/summary")
async def trigger_ai_summary(id: int):
    # CRITICAL: Always prefer non-blocking async operations inside asynchronous pathways
    # Avoid time.sleep(), as it blocks the core asynchronous execution loop
    await asyncio.sleep(2.0)
    return {"id": id, "summary": "Asynchronously processed Candidate insight compilation snippet template."}

```

---

## 7. Explicit Error & Status Handling

Do not rely on structural failures or generic internal network warnings to handle errors. Raise clear, typed `HTTPException` values with standard status codes to help frontend callers understand the response context.

```python
from fastapi import HTTPException, status

# Correct Pattern
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Access Denied: Reviewers cannot examine candidate internal administrative notes annotations."
)

```

---

## 8. High Testability Strategy (Pytest Fixture Overrides)

This project architecture supports straightforward dependency mocking without requiring modifications to the app's source code. You can use Pytest dependency injection overrides to dynamically swap target data connections for a mock setup or an in-memory SQLite backend.

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.api.deps import get_db
from app.database import Base

TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass
    # Swap out live engine targets cleanly without modifying core architecture configurations
    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

```
