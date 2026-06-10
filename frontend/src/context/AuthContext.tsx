import { createContext, useContext, useState, type ReactNode } from "react"
import type { User } from "@/interfaces/model/user"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  role: string | null
}

interface AuthContextValue extends AuthState {
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadAuth(): AuthState {
  try {
    const token = localStorage.getItem("auth_token")
    const userRaw = localStorage.getItem("auth_user")
    if (token && userRaw) {
      const user = JSON.parse(userRaw) as User
      return { user, token, isAuthenticated: true, role: user.role }
    }
  } catch {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }
  return { user: null, token: null, isAuthenticated: false, role: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadAuth)

  const setAuth = (user: User, token: string) => {
    setState({ user, token, isAuthenticated: true, role: user.role })
  }

  const clearAuth = () => {
    setState({ user: null, token: null, isAuthenticated: false, role: null })
  }

  return (
    <AuthContext.Provider value={{ ...state, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
  return ctx
}
