export const ENDPOINTS = {
  login: "auth/login",
  register: "auth/register",
  candidates: "candidates",
  candidate: (id: number) => `candidates/${id}`,
  myScores: (id: number) => `candidates/${id}/scores`,
  summary: (id: number) => `candidates/${id}/summary`,
};
