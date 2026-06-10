import { useRef, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getCandidateReviews } from "@/api/candidate"

interface Props {
  candidateId: number
  isOpen: boolean
  onClose: () => void
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="rating rating-sm gap-0.5 pointer-events-none">
      {[1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          type="radio"
          className="mask mask-star-2 bg-orange-400"
          checked={i <= value}
          readOnly
        />
      ))}
    </span>
  )
}

export default function ReviewsModal({ candidateId, isOpen, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isOpen) el.showModal()
    else {
      el.close()
      queryClient.removeQueries({ queryKey: ["reviews", candidateId] })
    }
  }, [isOpen, candidateId, queryClient])

  const {
    data,
    isPending,
    isSuccess,
    isError,
    error,
  } = useQuery({
    queryKey: ["reviews", candidateId],
    queryFn: () => getCandidateReviews(candidateId),
    enabled: isOpen && !isNaN(candidateId),
    retry: false,
    gcTime: 0,
  })

  let errorMessage = ""
  if (isError) {
    const apiErr = error as { errors?: Record<string, string> }
    errorMessage = apiErr.errors ? Object.values(apiErr.errors)[0] : "Failed to load reviews"
  }

  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">All Reviews</h3>
            {data && <p className="text-sm opacity-70">{data.name}</p>}
          </div>
          <button className="btn btn-sm btn-ghost btn-square" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isPending && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-5 w-40" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-3/6" />
              </div>
            ))}
          </div>
        )}

        {isSuccess && data && data.reviews.length === 0 && (
          <div role="alert" className="alert alert-info">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <span>No reviews yet for this candidate.</span>
          </div>
        )}

        {isSuccess && data && data.reviews.length > 0 && (
          <div className="space-y-4">
            {data.reviews.map((review) => (
              <div key={review.reviewer.id} className="card card-border bg-base-200">
                <div className="card-body p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="avatar placeholder">
                      <div className="w-7 rounded-full bg-neutral text-neutral-content text-xs font-semibold flex items-center justify-center">
                        <span>{review.reviewer.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{review.reviewer.name}</p>
                      <p className="text-xs opacity-50">{review.reviewer.email}</p>
                    </div>
                  </div>
                  <table className="table table-xs">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Score</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {review.categories.map((cat) => (
                        <tr key={cat.category}>
                          <td className="text-sm">{cat.category}</td>
                          <td><StarRating value={cat.score} /></td>
                          <td className="text-sm opacity-70">{cat.note ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && !isPending && (
          <div role="alert" className="alert alert-error">
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
