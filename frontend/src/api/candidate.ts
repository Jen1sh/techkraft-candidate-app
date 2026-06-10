import { apiClient } from "@/api/client"
import { ENDPOINTS } from "@/constants/endpoints"
import type { CandidateListResponse, CandidateFilters, CandidateResponse, SummaryResponse, UpdateCandidateRequest, CandidateReviewsResponse, CandidateStatsResponse, CreateCandidateRequest } from "@/interfaces/api/candidate"

export async function fetchCandidates(filters: CandidateFilters = {}): Promise<CandidateListResponse> {
  const params: Record<string, string | number> = {}
  if (filters.offset !== undefined) params.offset = filters.offset
  if (filters.limit !== undefined) params.limit = filters.limit
  if (filters.status) params.status = filters.status
  if (filters.role_applied) params.role_applied = filters.role_applied
  if (filters.skill) params.skill = filters.skill
  if (filters.keyword) params.keyword = filters.keyword

  const { data } = await apiClient.get<CandidateListResponse>(ENDPOINTS.candidates, { params })
  return data
}

export async function getCandidate(id: number): Promise<CandidateResponse> {
  const { data } = await apiClient.get<CandidateResponse>(ENDPOINTS.candidate(id))
  return data
}

export async function generateSummary(id: number): Promise<SummaryResponse> {
  const { data } = await apiClient.post<SummaryResponse>(ENDPOINTS.summary(id))
  return data
}

export async function updateCandidate(id: number, body: UpdateCandidateRequest): Promise<CandidateResponse> {
  const { data } = await apiClient.patch<CandidateResponse>(ENDPOINTS.candidate(id), body)
  return data
}

export async function getCandidateReviews(id: number): Promise<CandidateReviewsResponse> {
  const { data } = await apiClient.get<CandidateReviewsResponse>(ENDPOINTS.reviews(id))
  return data
}

export async function fetchCandidateStats(): Promise<CandidateStatsResponse> {
  const { data } = await apiClient.get<CandidateStatsResponse>(ENDPOINTS.candidatesSummary)
  return data
}

export async function createCandidate(body: CreateCandidateRequest): Promise<CandidateResponse> {
  const { data } = await apiClient.post<CandidateResponse>(ENDPOINTS.candidates, body)
  return data
}

export async function deleteCandidate(id: number): Promise<CandidateResponse> {
  const { data } = await apiClient.delete<CandidateResponse>(ENDPOINTS.candidate(id))
  return data
}
