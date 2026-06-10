export interface CategoryScore {
  category: string
  score: number
  note: string | null
}

export interface MyScoreResponse {
  candidate_id: number
  reviewer_id: number
  categories: CategoryScore[]
}

export interface AddScoresRequest {
  categories: CategoryScore[]
}
