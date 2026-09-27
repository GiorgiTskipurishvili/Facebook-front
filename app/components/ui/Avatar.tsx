/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { fileUrl } from "@/app/lib/api"
import type { UserPreview } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"

interface AvatarProps {
  user?: Pick<UserPreview, "_id" | "FirstName" | "LastName" | "ProfilePicture"> | null
  size?: number
  online?: boolean
  link?: boolean
  className?: string
}

export default function Avatar({ user, size = 40, online = false, link = false, className = "" }: AvatarProps) {
  const src = fileUrl(user?.ProfilePicture)

  const content = (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={fullName(user)} className="w-full h-full rounded-full object-cover border border-black/5" />
      ) : (
        <span className="w-full h-full rounded-full bg-[#c9ccd1] flex items-end justify-center overflow-hidden">
          <svg viewBox="0 0 24 24" className="w-[85%] h-[85%] text-white" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="9" r="5" />
            <path d="M2 24a10 10 0 0 1 20 0z" />
          </svg>
        </span>
      )}
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-[#31a24c] border-2 border-white"
          style={{ width: Math.max(size / 4, 10), height: Math.max(size / 4, 10) }}
        />
      )}
    </span>
  )

  if (link && user) {
    return (
      <Link href={`/profile/${user._id}`} className="shrink-0">
        {content}
      </Link>
    )
  }
  return content
}
