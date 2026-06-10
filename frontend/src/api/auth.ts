import { apiClient } from "@/api/client"
import { ENDPOINTS } from "@/constants/endpoints"
import type { LoginResponse } from "@/interfaces/api/auth"
import type { User } from "@/interfaces/model/user"

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post(ENDPOINTS.login, { email, password })
  return data
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const { data } = await apiClient.post(ENDPOINTS.register, { name, email, password })
  return data
}
