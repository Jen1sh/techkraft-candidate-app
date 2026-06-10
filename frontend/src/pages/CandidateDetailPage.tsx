import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuthContext } from "@/context/AuthContext"
import { getCandidate } from "@/api/candidate"
import type { CandidateDetailResponse } from "@/interfaces/api/candidate"

const statusColor: Record<string, string> = {
  new: "badge-ghost",
  reviewed: "badge-info",
  hired: "badge-success",
  rejected: "badge-error",
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function CandidateDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const id = Number(candidateId)
  const { user } = useAuthContext()
  const isAdmin = user?.role === "admin"

  const { data: candidate, isLoading, isError, error } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidate(id) as Promise<CandidateDetailResponse>,
    enabled: !isNaN(id),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="navbar bg-base-100 shadow-sm">
          <div className="navbar-start">
            <Link to="/" className="btn btn-ghost">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Candidates
            </Link>
          </div>
        </div>
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-48 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !candidate) {
    const apiErr = error as { errors?: Record<string, string> } | undefined
    const message = apiErr?.errors ? Object.values(apiErr.errors)[0] : "Candidate not found."
    return (
      <div className="min-h-screen bg-base-200">
        <div className="navbar bg-base-100 shadow-sm">
          <div className="navbar-start">
            <Link to="/" className="btn btn-ghost">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Candidates
            </Link>
          </div>
        </div>
        <div className="p-6 max-w-4xl mx-auto">
          <div role="alert" className="alert alert-error">{message}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Candidates
          </Link>
        </div>
        <div className="navbar-center">
          <span className="font-semibold text-lg">Candidate Profile</span>
        </div>
        <div className="navbar-end">
          <Link to={`/candidates/${id}/scores`} className="btn btn-primary btn-sm mr-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Add Score
          </Link>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Candidate Info Card */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="card-title text-2xl">{candidate.name}</h2>
                <p className="text-sm opacity-70">{candidate.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-outline">{candidate.role_applied}</span>
                <span className={`badge ${statusColor[candidate.status] ?? "badge-ghost"}`}>{candidate.status}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {candidate.skills.map((skill) => (
                <span key={skill} className="badge badge-soft badge-primary">{skill}</span>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs opacity-50">
              <span>Created: {formatDate(candidate.created_at)}</span>
              <span>Updated: {formatDate(candidate.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Internal Notes (admin only) */}
        {isAdmin && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-base">Internal Notes</h3>
              <p className="text-sm opacity-70">{candidate.internal_notes ?? "No internal notes."}</p>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Reviews ({candidate.reviews.length})</h3>
            {candidate.reviews.length === 0 ? (
              <p className="text-sm opacity-60 py-4 text-center">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {candidate.reviews.map((review) => (
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
                      <table className="table table-sm">
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
          </div>
        </div>
      </div>
    </div>
  )
}
