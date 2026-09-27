"use client"
import Link from "next/link"
import Avatar from "@/app/components/ui/Avatar"
import { useCurrentUser } from "@/app/context/AuthContext"
import { useSocket } from "@/app/context/SocketContext"
import type { Conversation } from "@/app/lib/types"
import { fullName, timeAgo } from "@/app/lib/utils"

interface Props {
  conversation: Conversation
  active?: boolean
  onClick?: () => void
}

export default function ConversationItem({ conversation, active = false, onClick }: Props) {
  const me = useCurrentUser()
  const { isOnline } = useSocket()
  const other = conversation.participants.find((p) => p._id !== me._id) || conversation.participants[0]
  const last = conversation.lastMessage
  const unread = (conversation.unreadCount || 0) > 0

  let preview = ""
  if (last) {
    const prefix = last.sender === me._id ? "თქვენ: " : ""
    preview = prefix + (last.text || "📷 ფოტო")
  }

  return (
    <Link
      href={`/messages/${conversation._id}`}
      onClick={onClick}
      className={`flex items-center gap-3 p-2 rounded-lg transition ${active ? "bg-[#ebf5ff]" : "hover:bg-gray-100"}`}
    >
      <Avatar user={other} size={56} online={isOnline(other)} />
      <span className="flex-1 min-w-0">
        <span className={`block text-[15px] truncate ${unread ? "font-bold text-gray-900" : "font-medium text-gray-900"}`}>
          {fullName(other)}
        </span>
        {last && (
          <span className={`flex text-[13px] gap-1 ${unread ? "font-bold text-gray-900" : "text-gray-500"}`}>
            <span className="truncate">{preview}</span>
            <span className="shrink-0">· {timeAgo(last.createdAt)}</span>
          </span>
        )}
      </span>
      {unread && <span className="w-3 h-3 rounded-full bg-[#1877f2] shrink-0" />}
    </Link>
  )
}
