"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth, useCurrentUser } from "@/app/context/AuthContext"
import Avatar from "@/app/components/ui/Avatar"
import { fullName } from "@/app/lib/utils"
import { LogoutIcon, SettingsIcon } from "@/app/icons/UiIcons"
import { useClickOutside } from "@/app/hooks/useClickOutside"

export default function ProfileMenu() {
  const user = useCurrentUser()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((prev) => !prev)} className="relative flex items-center justify-center cursor-pointer" aria-label="ანგარიში">
        <Avatar user={user} size={40} />
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 border border-white">
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-gray-700" fill="currentColor" aria-hidden="true">
            <path d="M4.707 5.293a1 1 0 0 0-1.414 1.414l4 4a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L8 8.586 4.707 5.293z" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[360px] bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50">
          <div className="rounded-lg shadow-[0_2px_12px_rgba(0,0,0,.1)] p-1 mb-2">
            <Link
              href={`/profile/${user._id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <Avatar user={user} size={40} />
              <div>
                <p className="font-semibold text-[17px] text-gray-900">{fullName(user)}</p>
                <p className="text-sm text-gray-500">იხილეთ თქვენი პროფილი</p>
              </div>
            </Link>
          </div>

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-left"
          >
            <span className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-gray-800" />
            </span>
            <span className="flex-1 font-medium text-[15px] text-gray-900">პარამეტრები და კონფიდენციალურობა</span>
            <span className="text-gray-500 text-xl">›</span>
          </Link>

          <button onClick={logout} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-left cursor-pointer">
            <span className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <LogoutIcon className="w-5 h-5 text-gray-800" />
            </span>
            <span className="font-medium text-[15px] text-gray-900">სისტემიდან გამოსვლა</span>
          </button>

          <div className="px-2 pt-3 text-xs text-gray-500">
            კონფიდენციალურობა · პირობები · რეკლამა · Cookies · Meta © {new Date().getFullYear()}
          </div>
        </div>
      )}
    </div>
  )
}
