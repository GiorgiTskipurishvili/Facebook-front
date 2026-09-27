/* eslint-disable @next/next/no-img-element */
"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import api, { fileUrl } from "@/app/lib/api"
import type { UserPreview } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"
import Avatar from "@/app/components/ui/Avatar"
import Spinner from "@/app/components/ui/Spinner"

interface Props {
  userId: string
  limit?: number
  onSeeAll?: () => void
}

// მომხმარებლის მეგობრების ბადე (პროფილის "მეგობრები" ბლოკი/tab)
export default function FriendsGrid({ userId, limit, onSeeAll }: Props) {
  const [friends, setFriends] = useState<UserPreview[] | null>(null)

  useEffect(() => {
    api.get(`/friends/user/${userId}`)
      .then((res) => setFriends(res.data.data))
      .catch(() => setFriends([]))
  }, [userId])

  const visible = limit ? friends?.slice(0, limit) : friends

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">მეგობრები</h2>
          {friends && <p className="text-[15px] text-gray-500">{friends.length} მეგობარი</p>}
        </div>
        {onSeeAll && friends && friends.length > 0 && (
          <button onClick={onSeeAll} className="text-[15px] text-[#1877f2] hover:bg-gray-100 rounded-md px-2 py-1 cursor-pointer">
            ყველას ნახვა
          </button>
        )}
      </div>

      {!friends ? (
        <Spinner />
      ) : friends.length === 0 ? (
        <p className="text-gray-500 text-[15px] mt-3">მეგობრები ჯერ არ არის</p>
      ) : (
        <div className={`grid gap-3 mt-3 ${limit ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
          {visible!.map((f) => (
            <Link key={f._id} href={`/profile/${f._id}`} className="group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                {f.ProfilePicture ? (
                  <img src={fileUrl(f.ProfilePicture)} alt="" className="w-full h-full object-cover group-hover:opacity-90" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Avatar user={f} size={64} /></div>
                )}
              </div>
              <p className="text-[13px] font-semibold text-gray-900 mt-1 leading-4 group-hover:underline">{fullName(f)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
