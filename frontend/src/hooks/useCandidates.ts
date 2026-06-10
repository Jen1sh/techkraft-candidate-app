import { useQuery } from "@tanstack/react-query"
import { fetchCandidates } from "@/api/candidate"
import type { CandidateFilters } from "@/interfaces/api/candidate"

export function useCandidates(filters: CandidateFilters = {}) {
  return useQuery({
    queryKey: ["candidates", filters],
    queryFn: () => fetchCandidates(filters),
  })
}
