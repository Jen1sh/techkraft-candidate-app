from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base
from app.db.session import engine, get_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="TechCraft Candidate Score API", lifespan=lifespan)


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
