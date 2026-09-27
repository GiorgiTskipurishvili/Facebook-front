"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import api from "@/app/lib/api"
import type { Paginated } from "@/app/lib/types"

// server-ის ?page= pagination-ისთვის. url-ის შეცვლისას კომპონენტს key უნდა შეეცვალოს.
export function usePaginated<T extends { _id: string }>(url: string) {
  const [items, setItems] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const pageRef = useRef(0)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)

    try {
      const nextPage = pageRef.current + 1
      const separator = url.includes("?") ? "&" : "?"
      const response = await api.get<Paginated<T>>(`${url}${separator}page=${nextPage}`)
      pageRef.current = nextPage

      setItems((prev) => {
        const ids = new Set(prev.map((item) => item._id))
        return [...prev, ...response.data.data.filter((item) => !ids.has(item._id))]
      })
      setHasMore(response.data.hasMore)
    } catch {
      setHasMore(false)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  return { items, setItems, hasMore, loading, loadMore }
}
