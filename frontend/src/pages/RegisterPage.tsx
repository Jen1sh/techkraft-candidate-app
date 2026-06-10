import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { registerSchema, type RegisterFormData } from "@/schema/auth";
import { useRegister } from "@/hooks/useAuth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync(data);
    } catch (e) {
      const apiErr = e as { errors?: Record<string, string> };
      if (apiErr.errors) {
        let handled = false;
        for (const [field, msg] of Object.entries(apiErr.errors)) {
          if (field === "name" || field === "email" || field === "password") {
            setError(field, { message: msg });
            handled = true;
          }
        }
        if (!handled) {
          toast.error(apiErr.errors._form ?? "Something went wrong");
        }
      }
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content w-full max-w-sm">
        <div className="card card-border bg-base-100 w-full">
          <div className="card-body gap-4">
            <Link
              to="/"
              className="link link-neutral text-xl font-bold self-center no-underline"
            >
              TechKraft
            </Link>
            <h2 className="text-xl font-semibold text-center">
              Create an account
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              <label className="label" htmlFor="name">
                Name
              </label>
              <label className="input">
                <svg
                  className="h-4 w-4 opacity-50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <input
                  id="name"
                  type="text"
                  className="grow"
                  placeholder="Your full name"
                  {...register("name")}
                />
              </label>
              {errors.name && (
                <span className="text-error text-sm">
                  {errors.name.message}
                </span>
              )}

              <label className="label" htmlFor="reg-email">
                Email
              </label>
              <label className="input">
                <svg
                  className="h-4 w-4 opacity-50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  id="reg-email"
                  type="email"
                  className="grow"
                  placeholder="you@example.com"
                  {...register("email")}
                />
              </label>
              {errors.email && (
                <span className="text-error text-sm">
                  {errors.email.message}
                </span>
              )}

              <label className="label" htmlFor="reg-password">
                Password
              </label>
              <label className="input">
                <svg
                  className="h-4 w-4 opacity-50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="grow"
                  placeholder="Min. 8 characters"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </label>
              {errors.password && (
                <span className="text-error text-sm">
                  {errors.password.message}
                </span>
              )}

              <label className="label" htmlFor="confirmPassword">
                Confirm password
              </label>
              <label className="input">
                <svg
                  className="h-4 w-4 opacity-50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  className="grow"
                  placeholder="Repeat your password"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </label>
              {errors.confirmPassword && (
                <span className="text-error text-sm">
                  {errors.confirmPassword.message}
                </span>
              )}

              <button
                type="submit"
                className="btn btn-primary mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner" />
                ) : null}
                {isSubmitting ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
