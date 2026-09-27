"use client"
import Link from "next/link"
import { useCurrentUser } from "@/app/context/AuthContext"
import { useSocket } from "@/app/context/SocketContext"
import Avatar from "@/app/components/ui/Avatar"
import { fullName } from "@/app/lib/utils"
import { FriendsIcon, SettingsIcon } from "@/app/icons/UiIcons"
import { MessengerIcon } from "@/app/icons/MessengerIcon"
import { NotificationIcon } from "@/app/icons/NotificationIcon"

export default function LeftSidebar() {
  const user = useCurrentUser()
  const { unreadMessages, unreadNotifications } = useSocket()

  const items = [
    { href: "/friends", label: "მეგობრები", icon: <FriendsIcon className="w-6 h-6 text-[#1877f2]" /> },
    { href: "/messages", label: "Messenger", icon: <MessengerIcon className="w-6 h-6 text-[#a033ff]" />, badge: unreadMessages },
    { href: "/notifications", label: "შეტყობინებები", icon: <NotificationIcon className="w-6 h-6 text-[#e41e3f]" />, badge: unreadNotifications },
    { href: "/settings", label: "პარამეტრები", icon: <SettingsIcon className="w-6 h-6 text-gray-700" /> }
  ]

  return (
    <aside className="hidden lg:block w-[280px] xl:w-[360px] shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto thin-scroll py-4 px-2">
      <Link href={`/profile/${user._id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb]">
        <Avatar user={user} size={36} />
        <span className="font-medium text-[15px] text-gray-900">{fullName(user)}</span>
      </Link>

      {items.map((item) => (
        <Link key={item.href} href={item.href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb]">
          <span className="w-9 h-9 flex items-center justify-center">{item.icon}</span>
          <span className="flex-1 font-medium text-[15px] text-gray-900">{item.label}</span>
          {!!item.badge && (
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#e41e3f] text-white text-xs font-bold flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </Link>
      ))}

      <div className="border-t border-gray-300 mt-3 pt-3 px-2 text-xs text-gray-500">
        კონფიდენციალურობა · პირობები · რეკლამა · Cookies · Meta © {new Date().getFullYear()}
      </div>
    </aside>
  )
}
