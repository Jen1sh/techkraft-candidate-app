from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class CandidateResponse(BaseModel):
    id: int
    name: str
    email: str
    role_applied: str
    status: str
    skills: list[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CandidateAdminResponse(CandidateResponse):
    internal_notes: str | None = None


class CategoryScore(BaseModel):
    category: str
    score: int
    note: str | None = None


class MyScoreResponse(BaseModel):
    candidate_id: int
    reviewer_id: int
    categories: list[CategoryScore]


class AddScoresRequest(BaseModel):
    categories: list[CategoryScore]


class SummaryResponse(BaseModel):
    candidate_id: int
    reviewer_id: int
    summary: str
    generated_at: datetime


class CreateCandidateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    role_applied: str = Field(..., min_length=1, max_length=100)
    skills: list[str] = Field(default_factory=list)
    internal_notes: str | None = None


class UpdateCandidateRequest(BaseModel):
    status: str | None = None
    internal_notes: str | None = None


class ReviewerInfo(BaseModel):
    id: int
    name: str
    email: str


class Review(BaseModel):
    reviewer: ReviewerInfo
    categories: list[CategoryScore]


class CandidateReviewsResponse(CandidateAdminResponse):
    reviews: list[Review]


class CandidateDetailResponse(CandidateResponse):
    reviews: list[Review]


class CandidateDetailAdminResponse(CandidateDetailResponse):
    internal_notes: str | None = None


class CandidatesSummaryResponse(BaseModel):
    total: int
    new: int
    reviewed: int
    hired: int
    rejected: int


class PaginationMeta(BaseModel):
    page: int
    total: int
    limit: int
    last_page: int


class PaginatedCandidatesResponse(BaseModel):
    data: list[CandidateResponse | CandidateAdminResponse]
    meta: PaginationMeta
