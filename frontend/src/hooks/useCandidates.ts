import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchCandidates, updateCandidate, getCandidateReviews, fetchCandidateStats, createCandidate, deleteCandidate } from "@/api/candidate"
import type { CandidateFilters, UpdateCandidateRequest } from "@/interfaces/api/candidate"

interface UseCandidatesOptions extends Omit<CandidateFilters, "offset" | "limit"> {
  limit?: number
}

export function useCandidates(options: UseCandidatesOptions = {}) {
  const { limit = 20, ...filters } = options

  return useInfiniteQuery({
    queryKey: ["candidates", limit, filters],
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

export function useUpdateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: { id: number } & UpdateCandidateRequest) =>
      updateCandidate(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      toast.success("Candidate updated")
    },
  })
}

export function useCandidateReviews(candidateId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["reviews", candidateId],
    queryFn: () => getCandidateReviews(candidateId),
    enabled,
  })
}

export function useCandidateStats() {
  return useQuery({
    queryKey: ["candidates-stats"],
    queryFn: fetchCandidateStats,
  })
}

export function useCreateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: import("@/interfaces/api/candidate").CreateCandidateRequest) =>
      createCandidate(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      queryClient.invalidateQueries({ queryKey: ["candidates-stats"] })
      toast.success("Candidate created")
    },
  })
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      queryClient.invalidateQueries({ queryKey: ["candidates-stats"] })
      toast.success("Candidate deleted")
    },
  })
}
