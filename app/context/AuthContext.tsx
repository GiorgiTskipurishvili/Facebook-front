"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { deleteCookie } from "cookies-next/client"
import api, { TOKEN_COOKIE } from "@/app/lib/api"
import type { User } from "@/app/lib/types"

interface AuthContextValue {
  user: User | null
  loading: boolean
  setUser: (user: User) => void
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me")
      setUser(response.data.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser()
  }, [refreshUser])

  const logout = useCallback(() => {
    deleteCookie(TOKEN_COOKIE)
    // სრული reload: socket, context-ები და cache ერთიანად სუფთავდება
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login"
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}

// მხოლოდ დალოგინებულ გვერდებზე - user აქ ყოველთვის არსებობს
export function useCurrentUser() {
  const { user } = useAuth()
  if (!user) throw new Error("useCurrentUser called before user loaded")
  return user
}
