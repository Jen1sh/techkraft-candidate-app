export const ENDPOINTS = {
  login: "auth/login",
  register: "auth/register",
  candidates: "candidates",
  candidate: (id: number) => `candidates/${id}`,
  myScores: (candidateId: number) => `candidates/${candidateId}/my-scores`,
}
