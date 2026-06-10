import type { Candidate } from "@/interfaces/model/candidate"
import type { PaginatedResponse } from "@/interfaces/api/index"
import type { CategoryScore } from "@/interfaces/api/score"

export interface CandidateResponse extends Candidate {
  internal_notes?: string | null
}

export type CandidateListResponse = PaginatedResponse<CandidateResponse>

export interface CandidateFilters {
  offset?: number
  limit?: number
  status?: string
  role_applied?: string
  skill?: string
  keyword?: string
}

export interface SummaryResponse {
  candidate_id: number
  reviewer_id: number
  summary: string
  generated_at: string
}

export interface UpdateCandidateRequest {
  status?: string
  internal_notes?: string | null
}

export interface ReviewerInfo {
  id: number
  name: string
  email: string
}

export interface Review {
  reviewer: ReviewerInfo
  categories: CategoryScore[]
}

export interface CandidateReviewsResponse extends CandidateResponse {
  reviews: Review[]
}

export interface CandidateDetailResponse extends CandidateResponse {
  reviews: Review[]
}

export interface CreateCandidateRequest {
  name: string
  email: string
  role_applied: string
  skills?: string[]
  internal_notes?: string | null
}

export interface CandidateStatsResponse {
  total: number
  new: number
  reviewed: number
  hired: number
  rejected: number
}
