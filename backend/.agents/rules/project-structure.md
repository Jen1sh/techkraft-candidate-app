```python
content = """# FastAPI Enterprise Project Structure

FastAPI is inherently "un-opinionated," meaning it doesn't force a structure upon you like NestJS. However, for mid-to-senior level projects, adopting a modular, decoupled architecture is essential for maintainability, testability, and scalability.

This structure mimics the service-oriented patterns you are likely familiar with from NestJS, ensuring your business logic remains isolated from your transport layer (HTTP/FastAPI).

## Project Directory Tree

```text
my-fastapi-app/
├── app/
│   ├── api/                # API Route Handlers (Controllers)
│   │   ├── v1/
│   │   │   └── endpoints/  # Feature-based routes (e.g., users.py, auth.py)
│   │   └── deps.py         # Dependencies (Auth, DB session, etc.)
│   ├── core/               # App configuration, security, & settings
│   │   ├── config.py       # Pydantic Settings (Environment variables)
│   │   └── security.py     # JWT/OAuth2 logic
│   ├── db/                 # Database connection & models
│   │   ├── base.py         # SQLAlchemy Base/Import all models here
│   │   └── session.py      # Database engine & sessionmaker
│   ├── schemas/            # Pydantic Models (DTOs)
│   │   ├── user.py         # User DTOs (Request/Response schemas)
│   │   └── token.py
│   ├── services/           # Business Logic Layer (The "Service" layer)
│   │   ├── crud.py         # Generic CRUD operations
│   │   └── user_service.py # Specific domain logic
│   ├── main.py             # FastAPI App entry point & middleware setup
│   └── models/             # ORM Models (SQLAlchemy/SQLModel)
├── tests/                  # Pytest directory
│   ├── conftest.py         # Shared test fixtures
│   └── api/
├── alembic/                # Database migrations
├── .env                    # Environment variables (git-ignored)
├── pyproject.toml          # Dependency management
└── Dockerfile

```

## Key Architectural Principles

### 1. The Service Layer (`app/services/`)

Just like NestJS `@Injectable` services, this is where your heavy lifting happens.

* **Why:** Routes (`app/api/`) should be thin. They should only handle request parsing (Pydantic), calling the service, and returning a response.
* **Benefit:** Allows you to unit test your business logic without needing to mock the entire FastAPI request/response lifecycle.

### 2. Schema Layer (`app/schemas/`)

These are your Data Transfer Objects (DTOs).

* **Best Practice:** Always separate your request models (`UserCreate`) from response models (`UserRead`). This prevents accidental leakage of sensitive fields like `hashed_password`.

### 3. Dependency Injection (`app/api/deps.py`)

FastAPI’s `Depends` system is powerful. Use this file to define reusable dependencies like:

* `get_db`: Yielding a database session.
* `get_current_user`: Handling JWT/OAuth2 authentication.

### 4. Configuration (`app/core/config.py`)

Use Pydantic's `BaseSettings` for environment variables. It provides automatic validation (e.g., erroring out if `DATABASE_URL` is missing).

---

## Simple Entry Point Example (`main.py`)

Keep `main.py` clean. Use it to register routers and middleware, not to write endpoint logic.

```python
from fastapi import FastAPI
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Register routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {"status": "ok"}

```

## Moving from NestJS to FastAPI

* **NestJS Modules → FastAPI `api/` folders:** Keep features grouped by directory.
* **NestJS DTOs → Pydantic `schemas/`:** Functionally identical.
* **NestJS `@Injectable()` → `services/` modules:** You don't have built-in DI containers as rigid as NestJS, so you will often pass dependencies (like the DB session) as arguments to functions. This is actually a standard Python "Dependency Injection" pattern.
