import { z } from "zod"

export interface EditCandidateFormData {
  status: string
  internal_notes?: string
}

export const editCandidateSchema = z.object({
  status: z.string().min(1, "Status is required"),
  internal_notes: z.string().optional(),
})

export interface CreateCandidateFormData {
  name: string
  email: string
  role_applied: string
  skills?: string
  internal_notes?: string
}

export const createCandidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role_applied: z.string().min(1, "Role applied is required"),
  skills: z.string().optional(),
  internal_notes: z.string().optional(),
})

export type CreateCandidateApiData = z.input<typeof createCandidateSchema>
