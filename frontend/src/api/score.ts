import { apiClient } from "@/api/client"
import { ENDPOINTS } from "@/constants/endpoints"
import type { MyScoreResponse, AddScoresRequest } from "@/interfaces/api/score"

export async function fetchMyScores(id: number): Promise<MyScoreResponse | null> {
  const { data } = await apiClient.get<MyScoreResponse | null>(ENDPOINTS.myScores(id))
  return data
}

export async function addMyScores(id: number, body: AddScoresRequest): Promise<MyScoreResponse> {
  const { data } = await apiClient.post<MyScoreResponse>(ENDPOINTS.myScores(id), body)
  return data
}
