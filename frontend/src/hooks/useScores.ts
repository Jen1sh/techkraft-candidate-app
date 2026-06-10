import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchMyScores, addMyScores } from "@/api/score"
import { toast } from "sonner"

export function useMyScores(candidateId: number) {
  return useQuery({
    queryKey: ["my-scores", candidateId],
    queryFn: () => fetchMyScores(candidateId),
  })
}

export function useAddScores(candidateId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: Parameters<typeof addMyScores>[1]) => addMyScores(candidateId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-scores", candidateId] })
      toast.success("Score saved")
    },
  })
}
