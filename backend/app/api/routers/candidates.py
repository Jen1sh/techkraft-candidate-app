import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_role
from app.db.models.user import Role, User
from app.schemas.candidate import AddScoresRequest, CandidateAdminResponse, CandidateDetailAdminResponse, CandidateDetailResponse, CandidateResponse, CandidateReviewsResponse, CandidatesSummaryResponse, CategoryScore, MyScoreResponse, PaginatedCandidatesResponse, PaginationMeta, SummaryResponse, UpdateCandidateRequest
from app.services.candidate_service import CandidateService
from app.services.event_bus import event_bus

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


@router.get("/summary")
async def candidates_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CandidatesSummaryResponse:
    data = await CandidateService.get_summary(db)
    return CandidatesSummaryResponse(**data)


@router.get("/{id}")
async def get_candidate(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CandidateDetailResponse | CandidateDetailAdminResponse:
    candidate = await CandidateService.get_by_id(db, id)
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"id": "Candidate not found"}},
        )
    if current_user.role == Role.ADMIN:
        reviews = await CandidateService.get_reviews(db, id)
        return CandidateDetailAdminResponse(
            **CandidateAdminResponse.model_validate(candidate).model_dump(),
            reviews=reviews,
        )
    scores = await CandidateService.get_my_scores(db, id, current_user.id)
    my_reviews = [
        {
            "reviewer": {"id": current_user.id, "name": current_user.name, "email": current_user.email},
            "categories": [{"category": s.category, "score": s.score, "note": s.note} for s in scores],
        }
    ] if scores else []
    return CandidateDetailResponse(
        **CandidateResponse.model_validate(candidate).model_dump(),
        reviews=my_reviews,
    )


@router.get("/{id}/scores")
async def get_my_scores(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MyScoreResponse | None:
    scores = await CandidateService.get_my_scores(db, id, current_user.id)
    if not scores:
        return None
    return MyScoreResponse(
        candidate_id=id,
        reviewer_id=current_user.id,
        categories=[CategoryScore(category=s.category, score=s.score, note=s.note) for s in scores],
    )


@router.post("/{id}/scores", status_code=status.HTTP_201_CREATED)
async def add_my_scores(
    id: int,
    body: AddScoresRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MyScoreResponse:
    candidate = await CandidateService.get_by_id(db, id)
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"id": "Candidate not found"}},
        )
    scores = await CandidateService.add_scores(
        db, id, current_user.id,
        [c.model_dump() for c in body.categories],
    )
    await event_bus.publish("reviews_updated", {"candidate_id": id})
    await event_bus.publish("stats_updated", {})
    return MyScoreResponse(
        candidate_id=id,
        reviewer_id=current_user.id,
        categories=[CategoryScore(category=s.category, score=s.score, note=s.note) for s in scores],
    )


@router.get("/{id}/reviews")
async def get_candidate_reviews(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.ADMIN)),
) -> CandidateReviewsResponse:
    candidate = await CandidateService.get_by_id(db, id)
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"id": "Candidate not found"}},
        )
    reviews = await CandidateService.get_reviews(db, id)
    return CandidateReviewsResponse(
        **CandidateAdminResponse.model_validate(candidate).model_dump(),
        reviews=reviews,
    )


@router.patch("/{id}")
async def update_candidate(
    id: int,
    body: UpdateCandidateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.ADMIN)),
) -> CandidateAdminResponse:
    try:
        candidate = await CandidateService.update(
            db, id, status=body.status, internal_notes=body.internal_notes,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"id": str(e)}},
        )
    await event_bus.publish("candidate_updated", {"candidate_id": id})
    await event_bus.publish("stats_updated", {})
    return CandidateAdminResponse.model_validate(candidate)


@router.post("/{id}/summary")
async def generate_summary(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SummaryResponse:
    candidate = await CandidateService.get_by_id(db, id)
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"id": "Candidate not found"}},
        )
    try:
        result = await CandidateService.generate_summary(db, id, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"errors": {"scores": str(e)}},
        )
    return SummaryResponse(**result)
