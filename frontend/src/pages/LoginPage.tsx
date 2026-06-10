import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { loginSchema, type LoginFormData } from "@/schema/auth"
import { useLogin } from "@/hooks/useAuth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registered = searchParams.get("registered") === "true"

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data)
    } catch (e) {
      const apiErr = e as { errors?: Record<string, string> }
      if (apiErr.errors) {
        let handled = false
        for (const [field, msg] of Object.entries(apiErr.errors)) {
          if (field === "email" || field === "password") {
            setError(field, { message: msg })
            handled = true
          }
        }
        if (!handled) {
          toast.error(apiErr.errors._form ?? "Something went wrong")
        }
      }
    }
  }

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content w-full max-w-sm">
        <div className="card card-border bg-base-100 w-full">
          <div className="card-body gap-4">
            <Link to="/" className="link link-neutral text-xl font-bold self-center no-underline">
              TechCraft
            </Link>
            <h2 className="text-xl font-semibold text-center">Sign in</h2>

            {registered && (
              <div role="alert" className="alert alert-success">
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span>Account created! Sign in below.</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
              <label className="label" htmlFor="email">Email</label>
              <label className="input">
                <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input id="email" type="email" className="grow" placeholder="you@example.com" {...register("email")} />
              </label>
              {errors.email && <span className="text-error text-sm">{errors.email.message}</span>}

              <label className="label" htmlFor="password">Password</label>
              <label className="input">
                <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="grow"
                  placeholder="Enter your password"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </label>
              {errors.password && <span className="text-error text-sm">{errors.password.message}</span>}

              <button type="submit" className="btn btn-primary mt-2" disabled={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner" /> : null}
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="link link-primary">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
