"use client"
import Link from "next/link"
import Avatar from "@/app/components/ui/Avatar"
import type { AppNotification, NotificationType } from "@/app/lib/types"
import { fullName, timeAgo } from "@/app/lib/utils"

const TEXTS: Record<NotificationType, string> = {
  post_like: "მოიწონა თქვენი პოსტი",
  post_comment: "დააკომენტარა თქვენს პოსტზე",
  comment_reply: "გიპასუხათ კომენტარზე",
  comment_like: "მოიწონა თქვენი კომენტარი",
  friend_request: "გამოგიგზავნათ მეგობრობის მოთხოვნა",
  friend_accept: "დაეთანხმა თქვენს მეგობრობის მოთხოვნას",
  follow: "გამოგიწერათ",
  post_share: "გააზიარა თქვენი პოსტი"
}

const BADGES: Record<NotificationType, { bg: string; icon: string }> = {
  post_like: { bg: "bg-[#1877f2]", icon: "👍" },
  comment_like: { bg: "bg-[#1877f2]", icon: "👍" },
  post_comment: { bg: "bg-[#42b72a]", icon: "💬" },
  comment_reply: { bg: "bg-[#42b72a]", icon: "💬" },
  friend_request: { bg: "bg-[#1877f2]", icon: "👤" },
  friend_accept: { bg: "bg-[#1877f2]", icon: "🤝" },
  follow: { bg: "bg-[#1877f2]", icon: "➕" },
  post_share: { bg: "bg-[#f7b928]", icon: "↗️" }
}

export function notificationLink(notification: AppNotification) {
  const postId = typeof notification.post === "string" ? notification.post : notification.post?._id
  if (postId) return `/post/${postId}`
  if (notification.type === "friend_request") return "/friends"
  return `/profile/${notification.sender?._id}`
}

interface Props {
  notification: AppNotification
  onClick?: (notification: AppNotification) => void
}

export default function NotificationItem({ notification, onClick }: Props) {
  const badge = BADGES[notification.type]
  const postText = typeof notification.post === "object" && notification.post?.desc

  return (
    <Link
      href={notificationLink(notification)}
      onClick={() => onClick?.(notification)}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition"
    >
      <span className="relative shrink-0">
        <Avatar user={notification.sender} size={56} />
        <span className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full ${badge.bg} flex items-center justify-center text-xs border-2 border-white`}>
          {badge.icon}
        </span>
      </span>

      <span className="flex-1 min-w-0">
        <span className={`block text-[15px] leading-5 ${notification.isRead ? "text-gray-600" : "text-gray-900"}`}>
          <b>{fullName(notification.sender)}</b> {TEXTS[notification.type]}
          {postText && <>: &quot;{postText.slice(0, 40)}{postText.length > 40 ? "…" : ""}&quot;</>}
        </span>
        <span className={`block text-[13px] mt-0.5 ${notification.isRead ? "text-gray-500" : "text-[#1877f2] font-semibold"}`}>
          {timeAgo(notification.createdAt)}
        </span>
      </span>

      {!notification.isRead && <span className="w-3 h-3 rounded-full bg-[#1877f2] shrink-0" />}
    </Link>
  )
}
