"use client"
import { useEffect, useRef } from "react"

// ელემენტის გარეთ დაკლიკებისას onOutside გამოიძახება (dropdown-ების დასახურად)
export function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null)
  const callbackRef = useRef(onOutside)

  useEffect(() => {
    callbackRef.current = onOutside
  })

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) callbackRef.current()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return ref
}
