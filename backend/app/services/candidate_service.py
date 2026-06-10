from __future__ import annotations

import asyncio
import math
from datetime import datetime, timezone

from sqlalchemy import String, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.orm import joinedload

from app.db.models.candidate import Candidate, CandidateStatus
from app.db.models.score import Score
from app.db.models.user import User
from app.services.summary_templates import generate_random_summary


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

    @staticmethod
    async def get_my_scores(
        db: AsyncSession, candidate_id: int, reviewer_id: int
    ) -> list[Score]:
        result = await db.execute(
            select(Score).where(
                Score.candidate_id == candidate_id,
                Score.reviewer_id == reviewer_id,
            )
        )
        return list(result.scalars().all())

    @staticmethod
    async def add_scores(
        db: AsyncSession,
        candidate_id: int,
        reviewer_id: int,
        categories: list[dict],
    ) -> list[Score]:
        scores = []
        for cat in categories:
            result = await db.execute(
                select(Score).where(
                    Score.candidate_id == candidate_id,
                    Score.reviewer_id == reviewer_id,
                    Score.category == cat["category"],
                )
            )
            existing = result.scalar_one_or_none()
            if existing:
                existing.score = cat["score"]
                existing.note = cat.get("note")
                scores.append(existing)
            else:
                score = Score(
                    candidate_id=candidate_id,
                    reviewer_id=reviewer_id,
                    category=cat["category"],
                    score=cat["score"],
                    note=cat.get("note"),
                )
                db.add(score)
                scores.append(score)
        await db.commit()
        for s in scores:
            await db.refresh(s)
        return scores

    @staticmethod
    async def update(
        db: AsyncSession,
        candidate_id: int,
        status: str | None = None,
        internal_notes: str | None = None,
    ) -> Candidate:
        candidate = await CandidateService.get_by_id(db, candidate_id)
        if candidate is None:
            raise ValueError("Candidate not found")
        if status is not None:
            candidate.status = CandidateStatus(status)
        if internal_notes is not None:
            candidate.internal_notes = internal_notes
        await db.commit()
        await db.refresh(candidate)
        return candidate

    @staticmethod
    async def get_summary(db: AsyncSession) -> dict:
        result = await db.execute(
            select(Candidate.status, func.count()).group_by(Candidate.status)
        )
        counts = {row[0]: row[1] for row in result.all()}
        return {
            "total": sum(counts.values()),
            "new": counts.get(CandidateStatus.NEW.value, 0),
            "reviewed": counts.get(CandidateStatus.REVIEWED.value, 0),
            "hired": counts.get(CandidateStatus.HIRED.value, 0),
            "rejected": counts.get(CandidateStatus.REJECTED.value, 0),
        }

    @staticmethod
    async def get_reviews(
        db: AsyncSession, candidate_id: int
    ) -> list[dict]:
        result = await db.execute(
            select(Score, User)
            .join(User, Score.reviewer_id == User.id)
            .where(Score.candidate_id == candidate_id)
            .order_by(User.id, Score.category)
        )
        rows = result.all()

        reviews_map: dict[int, dict] = {}
        for score, user in rows:
            if user.id not in reviews_map:
                reviews_map[user.id] = {
                    "reviewer": {"id": user.id, "name": user.name, "email": user.email},
                    "categories": [],
                }
            reviews_map[user.id]["categories"].append({
                "category": score.category,
                "score": score.score,
                "note": score.note,
            })

        return list(reviews_map.values())

    @staticmethod
    async def generate_summary(
        db: AsyncSession, candidate_id: int, reviewer_id: int
    ) -> dict:
        result = await db.execute(
            select(Score).where(Score.candidate_id == candidate_id).limit(1)
        )
        if result.scalar_one_or_none() is None:
            raise ValueError("This candidate has not been scored yet for the AI review")

        await asyncio.sleep(2)

        return {
            "candidate_id": candidate_id,
            "reviewer_id": reviewer_id,
            "summary": generate_random_summary(),
            "generated_at": datetime.now(timezone.utc),
        }
