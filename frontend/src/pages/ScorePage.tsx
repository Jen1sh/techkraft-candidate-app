import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getCandidate } from "@/api/candidate"
import { useMyScores, useAddScores } from "@/hooks/useScores"
import { scoreFormSchema, SCORE_CATEGORIES, type ScoreFormData } from "@/schema/score"

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

export default function ScorePage() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const id = Number(candidateId)

  const { data: candidate, isLoading: candidateLoading } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidate(id),
    enabled: !isNaN(id),
  })

  const { data: scoresData, isLoading: scoresLoading } = useMyScores(id)
  const addScoresMutation = useAddScores(id)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ScoreFormData>({
    resolver: zodResolver(scoreFormSchema),
    defaultValues: { category: "", score: 1, note: "" },
  })

  const scores = scoresData?.categories ?? []
  const usedCategories = new Set(scores.map((s) => s.category))

  const onSubmit = async (formData: ScoreFormData) => {
    try {
      await addScoresMutation.mutateAsync({
        categories: [{
          category: formData.category,
          score: formData.score,
          note: formData.note ?? null,
        }],
      })
      reset({ category: "", score: 1, note: "" })
    } catch (e) {
      const apiErr = e as { errors?: Record<string, string> }
      if (apiErr.errors) {
        for (const [field, msg] of Object.entries(apiErr.errors)) {
          if (field === "category" || field === "score") {
            setError(field as "category" | "score", { message: msg })
          }
        }
      }
    }
  }

  if (candidateLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div role="alert" className="alert alert-error">Candidate not found.</div>
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
          <span className="font-semibold text-lg">Score Card</span>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="card-title">{candidate.name}</h2>
                <p className="text-sm opacity-70">{candidate.email}</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="badge badge-outline">{candidate.role_applied}</span>
                <span className="badge badge-ghost">{candidate.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Your Scores</h3>
            {scoresLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-10 w-full" />
                ))}
              </div>
            ) : scores.length === 0 ? (
              <p className="text-sm opacity-60 py-4 text-center">No scores yet. Add your first score below.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Score</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((s) => (
                      <tr key={s.category}>
                        <td className="font-medium">{s.category}</td>
                        <td><StarRating value={s.score} /></td>
                        <td className="text-sm opacity-70">{s.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Add / Update Score</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
              <div>
                <label className="label" htmlFor="category">Category</label>
                <select
                  id="category"
                  className="select select-bordered w-full"
                  {...register("category")}
                >
                  <option value="">Select a category</option>
                  {SCORE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} disabled={usedCategories.has(cat)}>
                      {cat} {usedCategories.has(cat) ? "(already scored)" : ""}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="text-error text-sm">{errors.category.message}</span>}
              </div>

              <div>
                <label className="label" htmlFor="score">Score</label>
                <select id="score" className="select select-bordered w-full" {...register("score", { valueAsNumber: true })}>
                  <option value="">Select a score</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                {errors.score && <span className="text-error text-sm">{errors.score.message}</span>}
              </div>

              <div>
                <label className="label" htmlFor="note">Note <span className="text-xs opacity-50">(optional)</span></label>
                <textarea
                  id="note"
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Any additional notes…"
                  {...register("note")}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner" /> : null}
                {isSubmitting ? "Saving…" : "Save Score"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
