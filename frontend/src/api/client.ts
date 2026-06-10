import axios from "axios";
import type { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ""}/api`,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ errors?: Record<string, string> }>) => {
    if (error.response?.data?.errors) {
      return Promise.reject({ errors: error.response.data.errors });
    }
    return Promise.reject({
      errors: { _form: "An unexpected error occurred" },
    });
  }
);
