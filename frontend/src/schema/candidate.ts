import { z } from "zod"

export interface EditCandidateFormData {
  status: string
  internal_notes?: string
}

export const editCandidateSchema = z.object({
  status: z.string().min(1, "Status is required"),
  internal_notes: z.string().optional(),
})
