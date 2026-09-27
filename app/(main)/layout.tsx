/* eslint-disable @next/next/no-img-element */
"use client"
import { useEffect } from "react"
import { AuthProvider, useAuth } from "@/app/context/AuthContext"
import { SocketProvider } from "@/app/context/SocketContext"
import Header from "@/app/components/header/Header"

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()

  // ტოკენი არის, მაგრამ არასწორია/მომხმარებელი წაიშალა -> login
  useEffect(() => {
    if (!loading && !user) logout()
  }, [loading, user, logout])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <img src="/assets/Facebook_f_logo.svg.webp" alt="Facebook" className="w-20 h-20 animate-pulse" />
      </div>
    )
  }

  return (
    <SocketProvider>
      <Header />
      {children}
    </SocketProvider>
  )
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Guard>{children}</Guard>
    </AuthProvider>
  )
}
