import type { User } from "@/interfaces/model/user"

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface ApiError {
  errors: Record<string, string>
}
