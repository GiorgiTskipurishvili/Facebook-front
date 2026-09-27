/* eslint-disable @next/next/no-img-element */
"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import api, { fileUrl, getErrorMessage } from "@/app/lib/api"
import type { Post } from "@/app/lib/types"
import { fullName, timeAgo } from "@/app/lib/utils"
import { useAuth, useCurrentUser } from "@/app/context/AuthContext"
import { usePostLike } from "@/app/hooks/usePostLike"
import Avatar from "@/app/components/ui/Avatar"
import UserListModal from "@/app/components/ui/UserListModal"
import CommentsSection from "@/app/components/posts/CommentsSection"
import ShareModal from "@/app/components/posts/ShareModal"
import { CloseIcon, CommentIcon, LikeFilledIcon, LikeIcon, ShareIcon } from "@/app/icons/UiIcons"

interface Props {
  photos: Post[]
  startIndex: number
  onClose: () => void
  onUpdated: (post: Post) => void
}

export default function PhotoViewer({ photos, startIndex, onClose, onUpdated }: Props) {
  const [index, setIndex] = useState(startIndex)
  const photo = photos[index]

  const hasPrev = index > 0
  const hasNext = index < photos.length - 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // კომენტარის წერისას ისრები ტექსტს ეკუთვნის
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && hasPrev) setIndex((i) => i - 1)
      if (e.key === "ArrowRight" && hasNext) setIndex((i) => i + 1)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose, hasPrev, hasNext])

  if (!photo) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col lg:flex-row bg-black">
      {/* ფოტო */}
      <div className="relative flex-1 min-h-[45vh] flex items-center justify-center bg-[#0c0c0c]">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer z-10"
          aria-label="დახურვა"
        >
          <CloseIcon className="w-6 h-6 text-white" />
        </button>

        {hasPrev && (
          <button
            onClick={() => setIndex((i) => i - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white text-3xl flex items-center justify-center cursor-pointer"
            aria-label="წინა ფოტო"
          >
            ‹
          </button>
        )}

        <img src={fileUrl(photo.image)} alt={photo.desc} className="max-w-full max-h-[45vh] lg:max-h-screen object-contain select-none" />

        {hasNext && (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white text-3xl flex items-center justify-center cursor-pointer"
            aria-label="შემდეგი ფოტო"
          >
            ›
          </button>
        )}

        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          {index + 1} / {photos.length}
        </span>
      </div>

      {/* key: ფოტოს შეცვლისას პანელის state (კომენტარები, modal-ები) თავიდან */}
      <PhotoDetails key={photo._id} photo={photo} onUpdated={onUpdated} onClose={onClose} />
    </div>
  )
}

function PhotoDetails({ photo, onUpdated, onClose }: { photo: Post; onUpdated: (post: Post) => void; onClose: () => void }) {
  const me = useCurrentUser()
  const { setUser } = useAuth()
  const toggleLike = usePostLike(photo, onUpdated)
  const [sharing, setSharing] = useState(false)
  const [userList, setUserList] = useState<null | "likes" | "shares">(null)
  const [status, setStatus] = useState("")
  const [busy, setBusy] = useState(false)

  const isMine = photo.user?._id === me._id
  const isAvatar = me.ProfilePicture === photo.image
  const isCover = me.CoverPicture === photo.image

  async function setAs(kind: "avatar" | "cover") {
    setBusy(true)
    setStatus("")
    try {
      const res = await api.put(`/users/me/${kind}/from-post/${photo._id}`)
      setUser(res.data.data)
      setStatus(kind === "avatar" ? "✓ დაყენდა პროფილის სურათად" : "✓ დაყენდა ქავერ ფოტოდ")
    } catch (err) {
      setStatus(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <aside className="w-full lg:w-[360px] xl:w-[400px] shrink-0 bg-white flex flex-col max-h-[55vh] lg:max-h-none lg:h-screen">
      <div className="overflow-y-auto flex-1">
        <div className="flex items-center gap-2 p-4 pb-2">
          <Avatar user={photo.user} size={40} link />
          <div className="min-w-0">
            <Link href={`/profile/${photo.user?._id}`} onClick={onClose} className="font-semibold text-[15px] text-gray-900 hover:underline">
              {fullName(photo.user)}
            </Link>
            <Link href={`/post/${photo._id}`} onClick={onClose} className="block text-[13px] text-gray-500 hover:underline">
              {timeAgo(photo.createdAt)}
            </Link>
          </div>
        </div>

        {photo.desc && <p className="px-4 pb-2 text-[15px] text-gray-900 whitespace-pre-wrap break-words">{photo.desc}</p>}

        {isMine && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            <button
              onClick={() => setAs("avatar")}
              disabled={busy || isAvatar}
              className="h-8 px-3 rounded-md bg-[#e4e6eb] hover:bg-[#d8dadf] text-[13px] font-semibold text-gray-900 cursor-pointer disabled:opacity-50 disabled:cursor-default"
            >
              {isAvatar ? "✓ პროფილის სურათია" : "👤 პროფილის სურათად დაყენება"}
            </button>
            <button
              onClick={() => setAs("cover")}
              disabled={busy || isCover}
              className="h-8 px-3 rounded-md bg-[#e4e6eb] hover:bg-[#d8dadf] text-[13px] font-semibold text-gray-900 cursor-pointer disabled:opacity-50 disabled:cursor-default"
            >
              {isCover ? "✓ ქავერ ფოტოა" : "🖼️ ქავერად დაყენება"}
            </button>
          </div>
        )}
        {status && <p className="px-4 pb-2 text-[13px] text-green-600">{status}</p>}

        <div className="flex items-center justify-between px-4 py-2 text-[15px] text-gray-500">
          {photo.likesCount > 0 ? (
            <button onClick={() => setUserList("likes")} className="flex items-center gap-1.5 hover:underline cursor-pointer">
              <span className="w-[18px] h-[18px] rounded-full bg-[#1877f2] flex items-center justify-center">
                <LikeFilledIcon className="w-3 h-3 text-white" />
              </span>
              {photo.likesCount}
            </button>
          ) : <span />}
          <span className="flex gap-3">
            {photo.commentsCount > 0 && <span>{photo.commentsCount} კომენტარი</span>}
            {photo.sharesCount > 0 && (
              <button onClick={() => setUserList("shares")} className="hover:underline cursor-pointer">
                {photo.sharesCount} გაზიარება
              </button>
            )}
          </span>
        </div>

        <div className="mx-4 border-y border-gray-200 flex py-1">
          <button
            onClick={toggleLike}
            className={`flex-1 h-9 flex items-center justify-center gap-2 rounded-md hover:bg-gray-100 text-[15px] font-semibold cursor-pointer ${photo.likedByMe ? "text-[#1877f2]" : "text-gray-600"}`}
          >
            {photo.likedByMe ? <LikeFilledIcon className="w-5 h-5" /> : <LikeIcon className="w-5 h-5" />}
            მოწონება
          </button>
          <button
            onClick={() => document.getElementById("photo-comments")?.querySelector<HTMLInputElement>("form input")?.focus()}
            className="flex-1 h-9 flex items-center justify-center gap-2 rounded-md hover:bg-gray-100 text-[15px] font-semibold text-gray-600 cursor-pointer"
          >
            <CommentIcon className="w-5 h-5" />
            კომენტარი
          </button>
          <button
            onClick={() => setSharing(true)}
            className="flex-1 h-9 flex items-center justify-center gap-2 rounded-md hover:bg-gray-100 text-[15px] font-semibold text-gray-600 cursor-pointer"
          >
            <ShareIcon className="w-5 h-5" />
            გაზიარება
          </button>
        </div>

        <div id="photo-comments">
          <CommentsSection
            postId={photo._id}
            postOwnerId={photo.user?._id}
            onCountChange={(delta) => onUpdated({ ...photo, commentsCount: Math.max(photo.commentsCount + delta, 0) })}
          />
        </div>
      </div>

      {sharing && (
        <ShareModal
          post={photo}
          onClose={() => setSharing(false)}
          onShared={({ sharesCount }) => onUpdated({ ...photo, sharesCount })}
        />
      )}
      {userList && (
        <UserListModal
          title={userList === "likes" ? "მოწონებები" : "გააზიარეს"}
          url={`/posts/${photo._id}/${userList}`}
          onClose={() => setUserList(null)}
        />
      )}
    </aside>
  )
}
