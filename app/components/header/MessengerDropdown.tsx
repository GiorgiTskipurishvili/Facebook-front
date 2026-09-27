"use client"
import { useState } from "react"
import Link from "next/link"
import api from "@/app/lib/api"
import type { Conversation } from "@/app/lib/types"
import { useSocket } from "@/app/context/SocketContext"
import ConversationItem from "@/app/components/messenger/ConversationItem"
import Spinner from "@/app/components/ui/Spinner"
import { MessengerIcon } from "@/app/icons/MessengerIcon"
import { useClickOutside } from "@/app/hooks/useClickOutside"
import HeaderIconButton from "./HeaderIconButton"

export default function MessengerDropdown() {
  const { unreadMessages } = useSocket()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  async function toggle() {
    const willOpen = !open
    setOpen(willOpen)
    if (!willOpen) return

    setLoading(true)
    try {
      const res = await api.get("/messages/conversations")
      setConversations(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <HeaderIconButton active={open} badge={unreadMessages} onClick={toggle} label="Messenger">
        <MessengerIcon className="w-5 h-5" />
      </HeaderIconButton>

      {open && (
        <div className="absolute right-0 top-12 w-[360px] max-h-[calc(100vh-80px)] overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-100 p-2 z-50">
          <h3 className="text-2xl font-bold text-gray-900 px-2 pt-1 pb-2">ჩატები</h3>

          {loading && conversations.length === 0 ? (
            <Spinner />
          ) : conversations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">მიმოწერა ჯერ არ გაქვთ</p>
          ) : (
            conversations.map((c) => (
              <ConversationItem key={c._id} conversation={c} onClick={() => setOpen(false)} />
            ))
          )}

          <Link
            href="/messages"
            onClick={() => setOpen(false)}
            className="block text-center text-[15px] text-[#1877f2] hover:underline pt-3 pb-1 border-t border-gray-200 mt-2"
          >
            Messenger-ში ყველას ნახვა
          </Link>
        </div>
      )}
    </div>
  )
}
