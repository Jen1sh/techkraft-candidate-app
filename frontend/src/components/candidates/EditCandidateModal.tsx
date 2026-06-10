import { useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { getCandidate } from "@/api/candidate"
import { useUpdateCandidate } from "@/hooks/useCandidates"
import { editCandidateSchema } from "@/schema/candidate"
import type { EditCandidateFormData } from "@/schema/candidate"

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
]

interface Props {
  candidateId: number
  isOpen: boolean
  onClose: () => void
}

export default function EditCandidateModal({ candidateId, isOpen, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isOpen) el.showModal()
    else el.close()
  }, [isOpen])

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditCandidateFormData>({
    resolver: zodResolver(editCandidateSchema),
  })

  const { data: candidate, isLoading, isSuccess } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => getCandidate(candidateId),
    enabled: isOpen && !isNaN(candidateId),
  })

  useEffect(() => {
    if (isSuccess && candidate) {
      reset({
        status: candidate.status,
        internal_notes: candidate.internal_notes ?? "",
      })
    }
  }, [isSuccess, candidate, reset])

  const updateMutation = useUpdateCandidate()

  const onSubmit = async (formData: EditCandidateFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: candidateId,
        status: formData.status,
        internal_notes: formData.internal_notes || null,
      })
      onClose()
    } catch (err: unknown) {
      const apiErr = err as { errors?: Record<string, string> }
      if (apiErr.errors) {
        for (const [field, msg] of Object.entries(apiErr.errors)) {
          if (field === "internal_notes" || field === "status") {
            setError(field, { message: msg })
          }
        }
      }
    }
  }

  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">Edit Candidate</h3>
            {candidate && (
              <p className="text-sm opacity-70">{candidate.name} &middot; {candidate.role_applied}</p>
            )}
          </div>
          <button className="btn btn-sm btn-ghost btn-square" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <div className="skeleton h-6 w-48" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-24 w-full" />
          </div>
        )}

        {!isLoading && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                className={`select select-bordered w-full ${errors.status ? "select-error" : ""}`}
                {...register("status")}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.status && (
                <span className="text-xs text-error mt-1">{errors.status.message}</span>
              )}
            </div>

            <div>
              <label className="label" htmlFor="edit-notes">
                Internal Notes <span className="text-xs opacity-50">(optional)</span>
              </label>
              <textarea
                id="edit-notes"
                className={`textarea textarea-bordered w-full ${errors.internal_notes ? "textarea-error" : ""}`}
                rows={3}
                placeholder="Add internal notes..."
                {...register("internal_notes")}
              />
              {errors.internal_notes && (
                <span className="text-xs text-error mt-1">{errors.internal_notes.message}</span>
              )}
            </div>

            <div className="modal-action">
              <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner" /> : null}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  )
}
