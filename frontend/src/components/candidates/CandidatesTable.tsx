import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { CandidateResponse } from "@/interfaces/api/candidate"
import SummaryModal from "./SummaryModal"
import EditCandidateModal from "./EditCandidateModal"
import ReviewsModal from "./ReviewsModal"
import DeleteConfirmModal from "./DeleteConfirmModal"

const statusColor: Record<string, string> = {
  new: "badge-ghost",
  reviewed: "badge-info",
  hired: "badge-success",
  rejected: "badge-error",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

interface Props {
  candidates: CandidateResponse[]
  isLoading: boolean
  isError: boolean
  role: string | null
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

export default function CandidatesTable({
  candidates,
  isLoading,
  isError,
  role,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: Props) {
  const navigate = useNavigate()
  const [summaryCandidateId, setSummaryCandidateId] = useState<number | null>(null)
  const [editCandidateId, setEditCandidateId] = useState<number | null>(null)
  const [reviewsCandidateId, setReviewsCandidateId] = useState<number | null>(null)
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(null)
  const isAdmin = role === "admin"
  const isReviewer = role === "reviewer"

  if (isLoading) {
    return (
      <div className="overflow-x-auto mt-8">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th className="hidden md:table-cell">Email</th>
              <th>Role</th>
              <th>Status</th>
              <th className="hidden lg:table-cell">Skills</th>
              <th className="hidden lg:table-cell">Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j}><div className="skeleton h-4 w-full" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (isError) {
    return (
      <div role="alert" className="alert alert-error mt-8">
        <span>Failed to load candidates. Please try again.</span>
      </div>
    )
  }

  if (!candidates.length) {
    return (
      <div className="flex flex-col items-center gap-2 mt-12 opacity-60">
        <span className="text-lg font-medium">No candidates found</span>
        <span className="text-sm">Try adjusting your filters.</span>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto mt-8">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Name</th>
            <th className="hidden md:table-cell">Email</th>
            <th>Role</th>
            <th>Status</th>
            <th className="hidden lg:table-cell">Skills</th>
            <th className="hidden lg:table-cell">Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id}>
              <td className="font-medium">{c.name}</td>
              <td className="hidden md:table-cell">{c.email}</td>
              <td>{c.role_applied}</td>
              <td>
                <span className={`badge ${statusColor[c.status] ?? "badge-ghost"}`}>
                  {c.status}
                </span>
              </td>
              <td className="hidden lg:table-cell max-w-48 truncate">
                {c.skills.join(", ")}
              </td>
              <td className="hidden lg:table-cell">{formatDate(c.created_at)}</td>
              <td>
                <div className="flex items-center gap-1">
                  <div className="tooltip tooltip-top" data-tip="View details">
                    <button className="btn btn-ghost btn-xs btn-square" onClick={() => navigate(`/candidates/${c.id}`)}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  {isReviewer && (
                    <div className="tooltip tooltip-top" data-tip="Add score">
                      <button className="btn btn-ghost btn-xs btn-square" onClick={() => navigate(`/candidates/${c.id}/scores`)}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="tooltip tooltip-top" data-tip="Edit candidate">
                      <button className="btn btn-ghost btn-xs btn-square" onClick={() => setEditCandidateId(c.id)}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="tooltip tooltip-top" data-tip="See all scores">
                      <button className="btn btn-ghost btn-xs btn-square" onClick={() => setReviewsCandidateId(c.id)}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="tooltip tooltip-top" data-tip="Delete candidate">
                      <button className="btn btn-ghost btn-xs btn-square" onClick={() => setDeleteCandidateId(c.id)}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="tooltip tooltip-top" data-tip="View AI summary">
                    <button className="btn btn-ghost btn-xs btn-square" onClick={() => setSummaryCandidateId(c.id)}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <button
            className="btn btn-outline btn-wide"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <span className="loading loading-spinner" />
            ) : null}
            {isFetchingNextPage ? "Loading more…" : "Load more"}
          </button>
        </div>
      )}

      {summaryCandidateId !== null && (
        <SummaryModal
          candidateId={summaryCandidateId}
          isOpen={summaryCandidateId !== null}
          onClose={() => setSummaryCandidateId(null)}
        />
      )}
      {editCandidateId !== null && (
        <EditCandidateModal
          candidateId={editCandidateId}
          isOpen={editCandidateId !== null}
          onClose={() => setEditCandidateId(null)}
        />
      )}
      {reviewsCandidateId !== null && (
        <ReviewsModal
          candidateId={reviewsCandidateId}
          isOpen={reviewsCandidateId !== null}
          onClose={() => setReviewsCandidateId(null)}
        />
      )}
      {deleteCandidateId !== null && (
        <DeleteConfirmModal
          candidateId={deleteCandidateId}
          candidateName={candidates.find((c) => c.id === deleteCandidateId)?.name ?? ""}
          isOpen={deleteCandidateId !== null}
          onClose={() => setDeleteCandidateId(null)}
        />
      )}
    </div>
  )
}
