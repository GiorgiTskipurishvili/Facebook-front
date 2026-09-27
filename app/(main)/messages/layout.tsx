"use client"
import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api from "@/app/lib/api"
import type { Conversation } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"
import { useCurrentUser } from "@/app/context/AuthContext"
import { useSocketEvent } from "@/app/context/SocketContext"
import ConversationItem from "@/app/components/messenger/ConversationItem"
import Spinner from "@/app/components/ui/Spinner"
import { SearchIcon } from "@/app/icons/UiIcons"

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { id: activeId } = useParams<{ id?: string }>()
  const me = useCurrentUser()
  const [conversations, setConversations] = useState<Conversation[] | null>(null)
  const [search, setSearch] = useState("")

  const load = useCallback(() => {
    api.get("/messages/conversations")
      .then((res) => setConversations(res.data.data))
      .catch(() => setConversations([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // ახალი შეტყობინება ან "ნანახია" -> სიის განახლება (რიგი, preview, unread)
  useSocketEvent("message:new", load)
  useSocketEvent("message:seen", load)

  const filtered = (conversations || []).filter((c) => {
    if (!search.trim()) return true
    const other = c.participants.find((p) => p._id !== me._id)
    return fullName(other).toLowerCase().includes(search.trim().toLowerCase())
  })

  return (
    <div className="flex h-[calc(100vh-56px)] bg-white">
      <aside className={`${activeId ? "hidden md:flex" : "flex"} w-full md:w-[320px] lg:w-[360px] shrink-0 flex-col border-r border-gray-200`}>
        <div className="p-4 pb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">ჩატები</h1>
          <div className="relative">
            <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Messenger-ში ძებნა"
              className="w-full h-9 rounded-full bg-[#f0f2f5] pl-9 pr-3 outline-none text-[15px]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto thin-scroll px-2">
          {conversations === null ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 text-[15px] py-10 px-4">
              {search ? "ვერაფერი მოიძებნა" : "მიმოწერა ჯერ არ გაქვთ. დაიწყეთ მეგობრის პროფილიდან ან კონტაქტებიდან."}
            </p>
          ) : (
            filtered.map((c) => <ConversationItem key={c._id} conversation={c} active={c._id === activeId} />)
          )}
        </div>
      </aside>

      <section className={`${activeId ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex-col`}>{children}</section>
    </div>
  )
}
