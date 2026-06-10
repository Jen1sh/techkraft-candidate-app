import { useRef, useEffect } from "react"
import { useDeleteCandidate } from "@/hooks/useCandidates"

interface Props {
  candidateId: number
  candidateName: string
  isOpen: boolean
  onClose: () => void
}

export default function DeleteConfirmModal({ candidateId, candidateName, isOpen, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const deleteMutation = useDeleteCandidate()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isOpen) el.showModal()
    else el.close()
  }, [isOpen])

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(candidateId)
    onClose()
  }

  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <div className="modal-box max-w-sm">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-12 h-12 rounded-full bg-error/15 flex items-center justify-center">
            <svg className="h-6 w-6 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg">Delete Candidate</h3>
          <p className="text-sm text-center opacity-70">
            Are you sure you want to delete <span className="font-semibold">{candidateName}</span>?
          </p>
          <p className="text-xs text-center opacity-50">This action cannot be undone.</p>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </button>
          <button
            className="btn btn-error"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <span className="loading loading-spinner" /> : null}
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </dialog>
  )
}
