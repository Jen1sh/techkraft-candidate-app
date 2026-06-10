import { useCallback } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import * as authApi from "@/api/auth"
import { useAuthContext } from "@/context/AuthContext"
import type { LoginFormData, RegisterFormData } from "@/schema/auth"

export function useLogin() {
  const { setAuth } = useAuthContext()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }: LoginFormData) => authApi.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.access_token)
      localStorage.setItem("auth_user", JSON.stringify(data.user))
      setAuth(data.user, data.access_token)
      navigate("/")
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ name, email, password }: RegisterFormData) =>
      authApi.register(name, email, password),
    onSuccess: () => {
      navigate("/login?registered=true")
    },
    onError: (error) => {
      const apiErr = error as { errors?: Record<string, string> }
      if (apiErr.errors) {
        for (const [field, msg] of Object.entries(apiErr.errors)) {
          if (field !== "name" && field !== "email" && field !== "password") {
            toast.error(msg)
          }
        }
      }
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuthContext()
  const navigate = useNavigate()

  return useCallback(() => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    clearAuth()
    navigate("/login")
  }, [clearAuth, navigate])
}

const useAuth = { useLogin, useRegister, useLogout }
export default useAuth
