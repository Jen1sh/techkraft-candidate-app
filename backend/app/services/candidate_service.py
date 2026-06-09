import math

from sqlalchemy import String, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.candidate import Candidate


class CandidateService:

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        offset: int = 0,
        limit: int = 20,
        status: str | None = None,
        role_applied: str | None = None,
        skill: str | None = None,
        keyword: str | None = None,
    ) -> tuple[list[Candidate], int]:
        stmt = select(Candidate)

        if status:
            stmt = stmt.where(Candidate.status == status)
        if role_applied:
            stmt = stmt.where(Candidate.role_applied.ilike(f"%{role_applied}%"))
        if skill:
            stmt = stmt.where(cast(Candidate.skills, String).contains(skill))
        if keyword:
            pattern = f"%{keyword}%"
            stmt = stmt.where(
                Candidate.name.ilike(pattern) | Candidate.email.ilike(pattern)
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await db.scalar(count_stmt) or 0

        stmt = stmt.order_by(Candidate.id).offset(offset).limit(limit)
        result = await db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    @staticmethod
    async def get_by_id(db: AsyncSession, candidate_id: int) -> Candidate | None:
        result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
        return result.scalar_one_or_none()
