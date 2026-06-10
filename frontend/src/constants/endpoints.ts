export const ENDPOINTS = {
  login: "auth/login",
  register: "auth/register",
  events: "events",
  candidates: "candidates",
  candidate: (id: number) => `candidates/${id}`,
  myScores: (id: number) => `candidates/${id}/scores`,
  summary: (id: number) => `candidates/${id}/summary`,
  reviews: (id: number) => `candidates/${id}/reviews`,
  candidatesSummary: "candidates/summary",
}
