import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import Role, User
from app.schemas.candidate import AddScoresRequest, CandidateAdminResponse, CandidateResponse, CategoryScore, MyScoreResponse, PaginatedCandidatesResponse, PaginationMeta
from app.services.candidate_service import CandidateService

router = APIRouter(prefix="/candidates", tags=["Candidates"])


def _serialize(candidate, current_user: User):
    if current_user.role == Role.ADMIN:
        return CandidateAdminResponse.model_validate(candidate)
    return CandidateResponse.model_validate(candidate)


@router.get("")
async def list_candidates(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    status: str | None = Query(None),
    role_applied: str | None = Query(None),
    skill: str | None = Query(None),
    keyword: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedCandidatesResponse:
    items, total = await CandidateService.list(
        db, offset=offset, limit=limit,
        status=status, role_applied=role_applied,
        skill=skill, keyword=keyword,
    )

    page = (offset // limit) + 1 if limit else 1
    last_page = max(math.ceil(total / limit), 1) if limit else 1

    return PaginatedCandidatesResponse(
        data=[_serialize(c, current_user) for c in items],
        meta=PaginationMeta(page=page, total=total, limit=limit, last_page=last_page),
    )


@router.get("/{candidate_id}")
async def get_candidate(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CandidateResponse | CandidateAdminResponse:
    candidate = await CandidateService.get_by_id(db, candidate_id)
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"id": "Candidate not found"}},
        )
    return _serialize(candidate, current_user)


@router.get("/{candidate_id}/my-scores")
async def get_my_scores(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MyScoreResponse | None:
    scores = await CandidateService.get_my_scores(db, candidate_id, current_user.id)
    if not scores:
        return None
    return MyScoreResponse(
        candidate_id=candidate_id,
        reviewer_id=current_user.id,
        categories=[CategoryScore(category=s.category, score=s.score, note=s.note) for s in scores],
    )


@router.post("/{candidate_id}/my-scores", status_code=status.HTTP_201_CREATED)
async def add_my_scores(
    candidate_id: int,
    body: AddScoresRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MyScoreResponse:
    candidate = await CandidateService.get_by_id(db, candidate_id)
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"id": "Candidate not found"}},
        )
    scores = await CandidateService.add_scores(
        db, candidate_id, current_user.id,
        [c.model_dump() for c in body.categories],
    )
    return MyScoreResponse(
        candidate_id=candidate_id,
        reviewer_id=current_user.id,
        categories=[CategoryScore(category=s.category, score=s.score, note=s.note) for s in scores],
    )
