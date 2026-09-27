"use client"
import { useEffect, useRef } from "react"
import Spinner from "./Spinner"

interface Props {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
}

// ხილვადობაში მოსვლისას შემდეგ გვერდს ტვირთავს (infinite scroll)
export default function LoadMoreTrigger({ hasMore, loading, onLoadMore }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore || loading || !ref.current) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onLoadMore()
    }, { rootMargin: "300px" })

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasMore, loading, onLoadMore])

  if (loading) return <Spinner />
  if (!hasMore) return null
  return <div ref={ref} className="h-4" />
}
