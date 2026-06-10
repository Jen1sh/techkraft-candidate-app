import { apiClient } from "@/api/client"
import { ENDPOINTS } from "@/constants/endpoints"
import type { MyScoreResponse, AddScoresRequest } from "@/interfaces/api/score"

export async function fetchMyScores(candidateId: number): Promise<MyScoreResponse | null> {
  const { data } = await apiClient.get<MyScoreResponse | null>(ENDPOINTS.myScores(candidateId))
  return data
}

export async function addMyScores(candidateId: number, body: AddScoresRequest): Promise<MyScoreResponse> {
  const { data } = await apiClient.post<MyScoreResponse>(ENDPOINTS.myScores(candidateId), body)
  return data
}
