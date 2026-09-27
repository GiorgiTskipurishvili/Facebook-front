"use client"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import api from "@/app/lib/api"
import type { FriendRequest, UserPreview } from "@/app/lib/types"
import { fullName, timeAgo } from "@/app/lib/utils"
import { openConversation } from "@/app/lib/chat"
import { useSocket, useSocketEvent } from "@/app/context/SocketContext"
import Avatar from "@/app/components/ui/Avatar"

export default function RightSidebar() {
  const router = useRouter()
  const { isOnline } = useSocket()
  const [friends, setFriends] = useState<UserPreview[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])

  const loadRequests = useCallback(() => {
    api.get("/friends/requests").then((res) => setRequests(res.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    api.get("/friends").then((res) => setFriends(res.data.data)).catch(() => {})
    loadRequests()
  }, [loadRequests])

  // ახალი მოთხოვნა real-time-ში
  useSocketEvent<{ type: string }>("notification:new", (n) => {
    if (n.type === "friend_request") loadRequests()
  })

  async function respond(request: FriendRequest, action: "accept" | "reject") {
    await api.put(`/friends/${action}/${request._id}`)
    setRequests((prev) => prev.filter((r) => r._id !== request._id))
    if (action === "accept") setFriends((prev) => [...prev, request.sender])
  }

  async function chat(userId: string) {
    const conversationId = await openConversation(userId)
    router.push(`/messages/${conversationId}`)
  }

  const sortedFriends = [...friends].sort((a, b) => Number(isOnline(b)) - Number(isOnline(a)))

  return (
    <aside className="hidden xl:block w-[280px] 2xl:w-[360px] shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto thin-scroll py-4 px-2">
      {requests.length > 0 && (
        <section className="border-b border-gray-300 pb-3 mb-3">
          <div className="flex justify-between items-center px-2 mb-1">
            <h3 className="text-[17px] font-semibold text-gray-600">მეგობრობის მოთხოვნები</h3>
            <Link href="/friends" className="text-[15px] text-[#1877f2] hover:underline">ყველა</Link>
          </div>
          {requests.slice(0, 2).map((r) => (
            <div key={r._id} className="flex gap-3 p-2 rounded-lg hover:bg-[#e4e6eb]">
              <Avatar user={r.sender} size={56} link />
              <div className="flex-1">
                <div className="flex justify-between">
                  <Link href={`/profile/${r.sender._id}`} className="font-semibold text-[15px] text-gray-900 hover:underline">
                    {fullName(r.sender)}
                  </Link>
                  <span className="text-xs text-gray-500">{timeAgo(r.createdAt)}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => respond(r, "accept")} className="flex-1 h-8 rounded-md bg-[#1877f2] hover:bg-[#166fe5] text-white text-[15px] font-semibold cursor-pointer">
                    დადასტურება
                  </button>
                  <button onClick={() => respond(r, "reject")} className="flex-1 h-8 rounded-md bg-[#e4e6eb] hover:bg-[#d8dadf] text-gray-900 text-[15px] font-semibold cursor-pointer">
                    წაშლა
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      <h3 className="text-[17px] font-semibold text-gray-600 px-2 mb-1">კონტაქტები</h3>
      {sortedFriends.length === 0 ? (
        <p className="px-2 text-sm text-gray-500">
          მეგობრები ჯერ არ გყავთ. <Link href="/friends" className="text-[#1877f2] hover:underline">იპოვეთ ხალხი</Link>
        </p>
      ) : (
        sortedFriends.map((f) => (
          <button
            key={f._id}
            onClick={() => chat(f._id)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb] text-left cursor-pointer"
          >
            <Avatar user={f} size={36} online={isOnline(f)} />
            <span className="font-medium text-[15px] text-gray-900">{fullName(f)}</span>
          </button>
        ))
      )}
    </aside>
  )
}
