import { z } from "zod"

export interface ScoreFormData {
  category: string
  score: number
  note?: string
}

export const scoreFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  score: z.number({ message: "Score is required" }).int("Must be a whole number").min(1, "Minimum is 1").max(5, "Maximum is 5"),
  note: z.string().optional(),
})

export const SCORE_CATEGORIES = [
  "Technical Skills",
  "Communication",
  "Problem Solving",
  "Culture Fit",
  "Experience",
] as const
