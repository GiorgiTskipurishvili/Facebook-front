"use client"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { getCookie } from "cookies-next/client"
import api, { API_URL, TOKEN_COOKIE } from "@/app/lib/api"
import type { Message, UserPreview } from "@/app/lib/types"
import { useAuth } from "./AuthContext"

interface SocketContextValue {
  socket: Socket | null
  isOnline: (user?: Pick<UserPreview, "_id" | "isOnline"> | null) => boolean
  unreadNotifications: number
  setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>
  unreadMessages: number
  refreshUnreadMessages: () => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  // server-იდან მოსული ცვლილებები (userId -> online?) - ფარავს API-ს isOnline მნიშვნელობას
  const [onlineOverrides, setOnlineOverrides] = useState<Record<string, boolean>>({})
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const userId = user?._id

  const refreshUnreadMessages = useCallback(() => {
    api.get("/messages/unread/count")
      .then((res) => setUnreadMessages(res.data.count))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!userId) return

    const newSocket = io(API_URL, { auth: { token: getCookie(TOKEN_COOKIE) } })

    newSocket.on("user:online", ({ userId }: { userId: string }) => {
      setOnlineOverrides((prev) => ({ ...prev, [userId]: true }))
    })
    newSocket.on("user:offline", ({ userId }: { userId: string }) => {
      setOnlineOverrides((prev) => ({ ...prev, [userId]: false }))
    })
    newSocket.on("notification:new", () => {
      setUnreadNotifications((count) => count + 1)
    })
    newSocket.on("message:new", (message: Message) => {
      if (message.sender._id !== userId) refreshUnreadMessages()
    })
    newSocket.on("message:seen", () => refreshUnreadMessages())

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket)

    api.get("/notifications/unread/count")
      .then((res) => setUnreadNotifications(res.data.count))
      .catch(() => {})
    refreshUnreadMessages()

    return () => {
      newSocket.disconnect()
      setSocket(null)
    }
  }, [userId, refreshUnreadMessages])

  const isOnline = useCallback(
    (target?: Pick<UserPreview, "_id" | "isOnline"> | null) => {
      if (!target) return false
      if (target._id in onlineOverrides) return onlineOverrides[target._id]
      return !!target.isOnline
    },
    [onlineOverrides]
  )

  return (
    <SocketContext.Provider
      value={{ socket, isOnline, unreadNotifications, setUnreadNotifications, unreadMessages, refreshUnreadMessages }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error("useSocket must be used inside SocketProvider")
  return context
}

// socket-ის event-ზე გამოწერა; handler-ის ცვლილება ხელახლა გამოწერას არ იწვევს
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSocketEvent<T = any>(event: string, handler: (data: T) => void) {
  const { socket } = useSocket()
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!socket) return
    const listener = (data: T) => handlerRef.current(data)
    socket.on(event, listener)
    return () => {
      socket.off(event, listener)
    }
  }, [socket, event])
}
