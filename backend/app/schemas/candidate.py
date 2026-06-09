from datetime import datetime

from pydantic import BaseModel


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


class PaginationMeta(BaseModel):
    page: int
    total: int
    limit: int
    last_page: int


class PaginatedCandidatesResponse(BaseModel):
    data: list[CandidateResponse | CandidateAdminResponse]
    meta: PaginationMeta
