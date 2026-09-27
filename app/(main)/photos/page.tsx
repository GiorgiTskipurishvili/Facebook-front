/* eslint-disable @next/next/no-img-element */
"use client"
import { useState } from "react"
import Link from "next/link"
import { fileUrl } from "@/app/lib/api"
import type { UserPreview } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"
import { usePaginated } from "@/app/hooks/usePaginated"
import { useSocket } from "@/app/context/SocketContext"
import PhotoGrid from "@/app/components/photos/PhotoGrid"
import Avatar from "@/app/components/ui/Avatar"
import LoadMoreTrigger from "@/app/components/ui/LoadMoreTrigger"
import { FriendsIcon, PhotoIcon } from "@/app/icons/UiIcons"

type Tab = "photos" | "people"

export default function PhotosPage() {
  const [tab, setTab] = useState<Tab>("photos")

  const tabs = [
    { key: "photos" as const, label: "ფოტოები", icon: <PhotoIcon className="w-5 h-5" /> },
    { key: "people" as const, label: "ხალხი", icon: <FriendsIcon className="w-5 h-5" /> }
  ]

  return (
    <main className="max-w-[1100px] mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{tab === "photos" ? "ფოტოები" : "ხალხი"}</h1>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`h-9 px-3 rounded-full flex items-center gap-2 text-[15px] font-semibold cursor-pointer ${tab === t.key ? "bg-[#ebf5ff] text-[#1877f2]" : "bg-[#e4e6eb] text-gray-900 hover:bg-[#d8dadf]"}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "photos" ? (
          <PhotoGrid url="/posts/photos" showOwner emptyText="ფოტოები ჯერ არავის აუტვირთავს" />
        ) : (
          <PeopleGrid />
        )}
      </div>
    </main>
  )
}

function PeopleGrid() {
  const { items: people, hasMore, loading, loadMore } = usePaginated<UserPreview>("/users")
  const { isOnline } = useSocket()

  return (
    <>
      {!loading && !hasMore && people.length === 0 ? (
        <p className="text-gray-500 text-[15px] py-8 text-center">სხვა მომხმარებლები ჯერ არ არიან</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {people.map((person) => (
            <Link
              key={person._id}
              href={`/profile/${person._id}`}
              className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition group"
            >
              <div className="relative aspect-square bg-gray-200">
                {person.ProfilePicture ? (
                  <img src={fileUrl(person.ProfilePicture)} alt="" className="w-full h-full object-cover group-hover:opacity-90" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Avatar user={person} size={96} /></div>
                )}
                {isOnline(person) && <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-[#31a24c] border-2 border-white" />}
              </div>
              <p className="p-2 font-semibold text-[15px] text-gray-900 group-hover:underline">{fullName(person)}</p>
            </Link>
          ))}
        </div>
      )}
      <LoadMoreTrigger hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
    </>
  )
}
