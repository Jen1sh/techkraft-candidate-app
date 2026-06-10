import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchCandidates } from "@/api/candidate"
import type { CandidateFilters } from "@/interfaces/api/candidate"

interface UseCandidatesOptions extends Omit<CandidateFilters, "offset" | "limit"> {
  limit?: number
}

export function useCandidates(options: UseCandidatesOptions = {}) {
  const { limit = 20, ...filters } = options

  return useInfiniteQuery({
    queryKey: ["candidates", filters],
    initialPageParam: 0,
    queryFn: ({ pageParam: offset }) =>
      fetchCandidates({ ...filters, offset, limit }),
    getNextPageParam: (lastPage) => {
      const { page, last_page, limit: pageLimit } = lastPage.meta
      if (page >= last_page) return undefined
      return page * pageLimit
    },
  })
}
