import { apiClient } from "@/api/client"
import { ENDPOINTS } from "@/constants/endpoints"
import type { CandidateListResponse, CandidateFilters, CandidateResponse } from "@/interfaces/api/candidate"

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
