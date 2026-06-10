import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

export function useEventStream() {
  const queryClient = useQueryClient()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    const baseUrl = import.meta.env.VITE_API_URL ?? ""
    const url = `${baseUrl}/api/events?token=${token}`
    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener("candidate_updated", () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
    })

    es.addEventListener("stats_updated", () => {
      queryClient.invalidateQueries({ queryKey: ["candidates-stats"] })
    })

    es.addEventListener("reviews_updated", () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
      queryClient.invalidateQueries({ queryKey: ["my-scores"] })
    })

    es.onerror = () => {}

    return () => {
      es.close()
    }
  }, [queryClient])
}
