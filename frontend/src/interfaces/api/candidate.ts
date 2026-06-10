import type { Candidate } from "@/interfaces/model/candidate"
import type { PaginatedResponse } from "@/interfaces/api/index"

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
