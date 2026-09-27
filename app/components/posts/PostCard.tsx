/* eslint-disable @next/next/no-img-element */
"use client"
import { useState } from "react"
import Link from "next/link"
import api, { fileUrl, getErrorMessage } from "@/app/lib/api"
import type { Post } from "@/app/lib/types"
import { fullName, timeAgo } from "@/app/lib/utils"
import { useCurrentUser } from "@/app/context/AuthContext"
import Avatar from "@/app/components/ui/Avatar"
import UserListModal from "@/app/components/ui/UserListModal"
import { CommentIcon, DotsIcon, LikeFilledIcon, LikeIcon } from "@/app/icons/UiIcons"
import { useClickOutside } from "@/app/hooks/useClickOutside"
import CommentsSection from "./CommentsSection"
import PostEditorModal from "./PostEditorModal"

interface Props {
  post: Post
  onUpdated: (post: Post) => void
  onDeleted: (postId: string) => void
  defaultShowComments?: boolean
}

export default function PostCard({ post, onUpdated, onDeleted, defaultShowComments = false }: Props) {
  const me = useCurrentUser()
  const [showComments, setShowComments] = useState(defaultShowComments)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showLikes, setShowLikes] = useState(false)
  const [liking, setLiking] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false))

  const isOwner = post.user?._id === me._id

  async function toggleLike() {
    if (liking) return
    setLiking(true)
    // optimistic update - ღილაკი მაშინვე რეაგირებს
    const liked = !post.likedByMe
    onUpdated({ ...post, likedByMe: liked, likesCount: post.likesCount + (liked ? 1 : -1) })
    try {
      const res = await api.put(`/posts/${post._id}/like`)
      onUpdated({ ...post, likedByMe: res.data.liked, likesCount: res.data.likesCount })
    } catch {
      onUpdated(post)
    } finally {
      setLiking(false)
    }
  }

  async function remove() {
    setMenuOpen(false)
    if (!confirm("ნამდვილად გსურთ პოსტის წაშლა?")) return
    try {
      await api.delete(`/posts/${post._id}`)
      onDeleted(post._id)
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  return (
    <article className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)]">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <Avatar user={post.user} size={40} link />
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${post.user?._id}`} className="font-semibold text-[15px] text-gray-900 hover:underline">
            {fullName(post.user)}
          </Link>
          <Link href={`/post/${post._id}`} className="block text-[13px] text-gray-500 hover:underline">
            {timeAgo(post.createdAt)}
          </Link>
        </div>

        {isOwner && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              aria-label="პოსტის მოქმედებები"
            >
              <DotsIcon className="w-5 h-5 text-gray-600" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white rounded-lg shadow-xl border border-gray-100 p-2 z-20">
                <button
                  onClick={() => { setEditing(true); setMenuOpen(false) }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-[15px] font-medium cursor-pointer"
                >
                  ✏️ პოსტის რედაქტირება
                </button>
                <button onClick={remove} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-[15px] font-medium cursor-pointer">
                  🗑️ წაშლა
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {post.desc && (
        <p className={`px-4 pb-3 text-gray-900 whitespace-pre-wrap break-words ${!post.image && post.desc.length < 80 ? "text-2xl" : "text-[15px]"}`}>
          {post.desc}
        </p>
      )}

      {post.image && (
        <Link href={`/post/${post._id}`} className="block bg-black/5">
          <img src={fileUrl(post.image)} alt="" className="w-full max-h-[600px] object-contain" />
        </Link>
      )}

      {(post.likesCount > 0 || post.commentsCount > 0) && (
        <div className="flex items-center justify-between px-4 py-2.5 text-[15px] text-gray-500">
          {post.likesCount > 0 ? (
            <button onClick={() => setShowLikes(true)} className="flex items-center gap-1.5 hover:underline cursor-pointer">
              <span className="w-[18px] h-[18px] rounded-full bg-[#1877f2] flex items-center justify-center">
                <LikeFilledIcon className="w-3 h-3 text-white" />
              </span>
              {post.likesCount}
            </button>
          ) : <span />}
          {post.commentsCount > 0 && (
            <button onClick={() => setShowComments(true)} className="hover:underline cursor-pointer">
              {post.commentsCount} კომენტარი
            </button>
          )}
        </div>
      )}

      <div className="mx-4 border-t border-gray-200 flex py-1">
        <button
          onClick={toggleLike}
          className={`flex-1 h-9 flex items-center justify-center gap-2 rounded-md hover:bg-gray-100 text-[15px] font-semibold cursor-pointer ${post.likedByMe ? "text-[#1877f2]" : "text-gray-600"}`}
        >
          {post.likedByMe ? <LikeFilledIcon className="w-5 h-5" /> : <LikeIcon className="w-5 h-5" />}
          მოწონება
        </button>
        <button
          onClick={() => setShowComments(true)}
          className="flex-1 h-9 flex items-center justify-center gap-2 rounded-md hover:bg-gray-100 text-[15px] font-semibold text-gray-600 cursor-pointer"
        >
          <CommentIcon className="w-5 h-5" />
          კომენტარი
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-200">
          <CommentsSection
            postId={post._id}
            postOwnerId={post.user?._id}
            onCountChange={(delta) => onUpdated({ ...post, commentsCount: Math.max(post.commentsCount + delta, 0) })}
          />
        </div>
      )}

      {editing && <PostEditorModal post={post} onClose={() => setEditing(false)} onSaved={onUpdated} />}
      {showLikes && <UserListModal title="მოწონებები" url={`/posts/${post._id}/likes`} onClose={() => setShowLikes(false)} />}
    </article>
  )
}
