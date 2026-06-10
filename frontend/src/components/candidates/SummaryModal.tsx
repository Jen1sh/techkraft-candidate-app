import { useRef, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { generateSummary, getCandidate } from "@/api/candidate"

interface Props {
  candidateId: number
  isOpen: boolean
  onClose: () => void
}

export default function SummaryModal({ candidateId, isOpen, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isOpen) {
      el.showModal()
    } else {
      el.close()
      queryClient.removeQueries({ queryKey: ["summary", candidateId] })
    }
  }, [isOpen, candidateId, queryClient])

  const { data: candidate } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => getCandidate(candidateId),
    enabled: isOpen && !isNaN(candidateId),
  })

  const {
    data: summaryData,
    isPending,
    isSuccess,
    isError,
    error,
  } = useQuery({
    queryKey: ["summary", candidateId],
    queryFn: () => generateSummary(candidateId),
    enabled: isOpen && !isNaN(candidateId),
    retry: false,
    gcTime: 0,
  })

  let errorMessage = ""
  if (isError) {
    const apiErr = error as { errors?: Record<string, string> }
    if (apiErr.errors) {
      errorMessage = Object.values(apiErr.errors)[0] ?? "Something went wrong"
    } else {
      errorMessage = "Failed to generate summary"
    }
  }

  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">AI Summary</h3>
          <button className="btn btn-sm btn-ghost btn-square" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {candidate && (
          <p className="text-sm opacity-70 mb-4">{candidate.name} &middot; {candidate.role_applied}</p>
        )}

        {isPending && (
          <div className="space-y-3">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-4/6" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/6" />
          </div>
        )}

        {isSuccess && summaryData && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{summaryData.summary}</p>
            <p className="text-xs opacity-50">
              Generated {new Date(summaryData.generated_at).toLocaleString()}
            </p>
          </div>
        )}

        {isError && !isPending && (
          <div role="alert" className="alert alert-error">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </dialog>
  )
}
