"use client"
import api from "@/app/lib/api"
import type { AppNotification } from "@/app/lib/types"
import { usePaginated } from "@/app/hooks/usePaginated"
import { useSocket, useSocketEvent } from "@/app/context/SocketContext"
import NotificationItem from "@/app/components/notifications/NotificationItem"
import LoadMoreTrigger from "@/app/components/ui/LoadMoreTrigger"
import { CloseIcon } from "@/app/icons/UiIcons"

export default function NotificationsPage() {
  const { unreadNotifications, setUnreadNotifications } = useSocket()
  const { items, setItems, hasMore, loading, loadMore } = usePaginated<AppNotification>("/notifications")

  useSocketEvent<AppNotification>("notification:new", (n) => setItems((prev) => [n, ...prev]))

  async function markRead(n: AppNotification) {
    if (n.isRead) return
    setUnreadNotifications((c) => Math.max(c - 1, 0))
    await api.put(`/notifications/${n._id}/read`).catch(() => {})
  }

  async function markAllRead() {
    await api.put("/notifications/read-all")
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadNotifications(0)
  }

  async function remove(n: AppNotification) {
    await api.delete(`/notifications/${n._id}`)
    setItems((prev) => prev.filter((x) => x._id !== n._id))
    if (!n.isRead) setUnreadNotifications((c) => Math.max(c - 1, 0))
  }

  return (
    <main className="max-w-[680px] mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)] p-2">
        <div className="flex items-center justify-between px-2 py-2">
          <h1 className="text-2xl font-bold text-gray-900">შეტყობინებები</h1>
          {unreadNotifications > 0 && (
            <button onClick={markAllRead} className="text-[15px] text-[#1877f2] hover:bg-gray-100 rounded-md px-2 py-1 cursor-pointer">
              ყველას წაკითხულად მონიშვნა
            </button>
          )}
        </div>

        {items.map((n) => (
          <div key={n._id} className="relative group">
            <NotificationItem notification={n} onClick={markRead} />
            <button
              onClick={() => remove(n)}
              className="absolute right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow border border-gray-200 hidden group-hover:flex items-center justify-center cursor-pointer"
              aria-label="წაშლა"
              title="წაშლა"
            >
              <CloseIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ))}

        {!loading && !hasMore && items.length === 0 && (
          <p className="text-center text-gray-500 py-10">შეტყობინებები ჯერ არ გაქვთ</p>
        )}

        <LoadMoreTrigger hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
      </div>
    </main>
  )
}
