"use client"
import { useState } from "react"
import Link from "next/link"
import api from "@/app/lib/api"
import type { AppNotification } from "@/app/lib/types"
import { useSocket, useSocketEvent } from "@/app/context/SocketContext"
import NotificationItem from "@/app/components/notifications/NotificationItem"
import Spinner from "@/app/components/ui/Spinner"
import { NotificationIcon } from "@/app/icons/NotificationIcon"
import { useClickOutside } from "@/app/hooks/useClickOutside"
import HeaderIconButton from "./HeaderIconButton"

export default function NotificationsDropdown() {
  const { unreadNotifications, setUnreadNotifications } = useSocket()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  async function load() {
    setLoading(true)
    try {
      const res = await api.get("/notifications?limit=15")
      setNotifications(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  function toggle() {
    if (!open) load()
    setOpen(!open)
  }

  useSocketEvent<AppNotification>("notification:new", (notification) => {
    if (open) setNotifications((prev) => [notification, ...prev])
  })

  async function markRead(notification: AppNotification) {
    setOpen(false)
    if (notification.isRead) return
    setUnreadNotifications((c) => Math.max(c - 1, 0))
    await api.put(`/notifications/${notification._id}/read`).catch(() => {})
  }

  async function markAllRead() {
    await api.put("/notifications/read-all")
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadNotifications(0)
  }

  const visible = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications

  return (
    <div ref={ref} className="relative">
      <HeaderIconButton active={open} badge={unreadNotifications} onClick={toggle} label="შეტყობინებები">
        <NotificationIcon className="w-5 h-5" />
      </HeaderIconButton>

      {open && (
        <div className="absolute right-0 top-12 w-[360px] max-h-[calc(100vh-80px)] overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-100 p-2 z-50">
          <div className="flex items-center justify-between px-2 pt-1">
            <h3 className="text-2xl font-bold text-gray-900">შეტყობინებები</h3>
            {unreadNotifications > 0 && (
              <button onClick={markAllRead} className="text-sm text-[#1877f2] hover:underline cursor-pointer">
                ყველას წაკითხვა
              </button>
            )}
          </div>

          <div className="flex gap-2 px-2 py-2">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-[15px] font-semibold cursor-pointer ${filter === f ? "bg-[#ebf5ff] text-[#1877f2]" : "hover:bg-gray-100 text-gray-900"}`}
              >
                {f === "all" ? "ყველა" : "წაუკითხავი"}
              </button>
            ))}
          </div>

          {loading && notifications.length === 0 ? (
            <Spinner />
          ) : visible.length === 0 ? (
            <p className="text-center text-gray-500 py-8">შეტყობინებები არ არის</p>
          ) : (
            visible.map((n) => <NotificationItem key={n._id} notification={n} onClick={markRead} />)
          )}

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-[15px] font-semibold text-gray-700 bg-[#e4e6eb] hover:bg-[#d8dadf] rounded-md py-2 mt-2"
          >
            ყველას ნახვა
          </Link>
        </div>
      )}
    </div>
  )
}
