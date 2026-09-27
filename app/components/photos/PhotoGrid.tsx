/* eslint-disable @next/next/no-img-element */
"use client"
import { useState } from "react"
import { fileUrl } from "@/app/lib/api"
import type { Post } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"
import { usePaginated } from "@/app/hooks/usePaginated"
import Avatar from "@/app/components/ui/Avatar"
import LoadMoreTrigger from "@/app/components/ui/LoadMoreTrigger"
import { CommentIcon, LikeFilledIcon } from "@/app/icons/UiIcons"
import PhotoViewer from "./PhotoViewer"

interface Props {
  url: string // /posts/photos ან /posts/photos/user/:id
  showOwner?: boolean
  emptyText?: string
}

// ფოტოების ბადე infinite scroll-ით; დაჭერისას სრულეკრანიანი viewer
export default function PhotoGrid({ url, showOwner = false, emptyText = "ფოტოები ჯერ არ არის" }: Props) {
  const { items: photos, setItems, hasMore, loading, loadMore } = usePaginated<Post>(url)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  function updated(post: Post) {
    setItems((prev) => prev.map((p) => (p._id === post._id ? post : p)))
  }

  return (
    <>
      {!loading && !hasMore && photos.length === 0 ? (
        <p className="text-gray-500 text-[15px] py-8 text-center">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
          {photos.map((photo, i) => (
            <button
              key={photo._id}
              onClick={() => setViewerIndex(i)}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 group cursor-pointer"
            >
              <img src={fileUrl(photo.image)} alt={photo.desc} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition" />

              {/* hover: ლაიქები / კომენტარები */}
              <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white font-semibold">
                <span className="flex items-center gap-1"><LikeFilledIcon className="w-5 h-5" /> {photo.likesCount}</span>
                <span className="flex items-center gap-1"><CommentIcon className="w-5 h-5" /> {photo.commentsCount}</span>
              </span>

              {showOwner && (
                <span className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-1.5">
                  <Avatar user={photo.user} size={24} />
                  <span className="text-white text-[13px] font-semibold truncate">{fullName(photo.user)}</span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <LoadMoreTrigger hasMore={hasMore} loading={loading} onLoadMore={loadMore} />

      {viewerIndex !== null && (
        <PhotoViewer photos={photos} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} onUpdated={updated} />
      )}
    </>
  )
}
