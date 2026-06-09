from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routers.auth import router as auth_router
from app.api.routers.candidates import router as candidate_router
from app.db.base import Base
from app.db.seed import seed_candidates, seed_scores, seed_users
from app.db.session import async_session, engine, get_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with async_session() as db:
        await seed_users(db)
        await seed_candidates(db)
        await seed_scores(db)
    yield


app = FastAPI(title="TechCraft Candidate Score API", lifespan=lifespan)


def _human_readable_error(field: str, err: dict) -> str:
    label = field.replace("_", " ").title()

    if err["type"] == "missing":
        return f"{label} is required"

    ctx = err.get("ctx", {})

    if err["type"] == "string_too_short":
        min_len = ctx.get("min_length")
        if min_len:
            return f"{label} must be at least {min_len} character{'s' if min_len > 1 else ''}"
        return f"{label} is too short"

    if err["type"] == "string_too_long":
        max_len = ctx.get("max_length")
        if max_len:
            return f"{label} must be at most {max_len} characters"
        return f"{label} is too long"

    if err["type"] == "value_error" and "reason" in ctx:
        return f"{label} is invalid"

    return err["msg"].capitalize()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors: dict[str, str] = {}
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err["loc"] if loc not in ("body", "query", "path", "header"))
        errors[field] = _human_readable_error(field, err)
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"errors": errors})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "errors" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"errors": {"detail": exc.detail}})


app.include_router(auth_router)
app.include_router(candidate_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/db-health")
async def db_health():
    async for db in get_db():
        try:
            await db.execute(text("SELECT 1"))
            return {"status": "ok", "db": "connected"}
        except Exception as e:
            return {"status": "error", "db": str(e)}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
