import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateCandidate } from "@/hooks/useCandidates"
import { createCandidateSchema } from "@/schema/candidate"
import type { CreateCandidateFormData } from "@/schema/candidate"

export default function CreateCandidatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateCandidate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateCandidateFormData>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: { name: "", email: "", role_applied: "", skills: "", internal_notes: "" },
  })

  const onSubmit = async (formData: CreateCandidateFormData) => {
    try {
      const skills = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined
      const result = await createMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        role_applied: formData.role_applied,
        skills,
        internal_notes: formData.internal_notes || null,
      })
      navigate(`/candidates/${result.id}`)
    } catch (err: unknown) {
      const apiErr = err as { errors?: Record<string, string> }
      if (apiErr.errors) {
        for (const [field, msg] of Object.entries(apiErr.errors)) {
          if (field === "name" || field === "email" || field === "role_applied" || field === "skills") {
            setError(field as "name" | "email" | "role_applied" | "skills", { message: msg })
          }
        }
      }
    }
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
          <span className="font-semibold text-lg">New Candidate</span>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-2">Candidate Information</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="label" htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
                  placeholder="John Doe"
                  {...register("name")}
                />
                {errors.name && <span className="text-xs text-error mt-1">{errors.name.message}</span>}
              </div>

              <div>
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                  placeholder="john@example.com"
                  {...register("email")}
                />
                {errors.email && <span className="text-xs text-error mt-1">{errors.email.message}</span>}
              </div>

              <div>
                <label className="label" htmlFor="role_applied">Role Applied</label>
                <input
                  id="role_applied"
                  type="text"
                  className={`input input-bordered w-full ${errors.role_applied ? "input-error" : ""}`}
                  placeholder="Software Engineer"
                  {...register("role_applied")}
                />
                {errors.role_applied && <span className="text-xs text-error mt-1">{errors.role_applied.message}</span>}
              </div>

              <div>
                <label className="label" htmlFor="skills">
                  Skills <span className="text-xs opacity-50">(comma-separated, optional)</span>
                </label>
                <input
                  id="skills"
                  type="text"
                  className={`input input-bordered w-full ${errors.skills ? "input-error" : ""}`}
                  placeholder="React, TypeScript, Python"
                  {...register("skills")}
                />
                {errors.skills && <span className="text-xs text-error mt-1">{errors.skills.message}</span>}
              </div>

              <div>
                <label className="label" htmlFor="internal_notes">
                  Internal Notes <span className="text-xs opacity-50">(optional)</span>
                </label>
                <textarea
                  id="internal_notes"
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Any internal notes…"
                  {...register("internal_notes")}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Link to="/" className="btn">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading loading-spinner" /> : null}
                  {isSubmitting ? "Creating…" : "Create Candidate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
