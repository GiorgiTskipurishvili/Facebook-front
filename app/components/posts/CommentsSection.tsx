"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import api, { getErrorMessage } from "@/app/lib/api"
import type { Comment } from "@/app/lib/types"
import { fullName, timeAgo } from "@/app/lib/utils"
import { useCurrentUser } from "@/app/context/AuthContext"
import Avatar from "@/app/components/ui/Avatar"
import Spinner from "@/app/components/ui/Spinner"
import { DotsIcon, LikeFilledIcon, SendIcon } from "@/app/icons/UiIcons"
import { useClickOutside } from "@/app/hooks/useClickOutside"

interface Props {
  postId: string
  postOwnerId: string
  onCountChange: (delta: number) => void
}

export default function CommentsSection({ postId, postOwnerId, onCountChange }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/comments/post/${postId}`)
      .then((res) => setComments(res.data.data))
      .finally(() => setLoading(false))
  }, [postId])

  // replyTo -> პასუხების სია
  const childrenMap = useMemo(() => {
    const map = new Map<string | null, Comment[]>()
    comments.forEach((c) => {
      const key = c.replyTo || null
      map.set(key, [...(map.get(key) || []), c])
    })
    return map
  }, [comments])

  function added(comment: Comment) {
    setComments((prev) => [...prev, comment])
    onCountChange(1)
  }

  function updated(comment: Comment) {
    setComments((prev) => prev.map((c) => (c._id === comment._id ? comment : c)))
  }

  function removed(ids: string[]) {
    setComments((prev) => prev.filter((c) => !ids.includes(c._id)))
    onCountChange(-ids.length)
  }

  const shared = { postId, postOwnerId, childrenMap, onAdded: added, onUpdated: updated, onRemoved: removed }

  return (
    <div className="px-4 pb-3 pt-1">
      {loading ? (
        <Spinner />
      ) : (
        (childrenMap.get(null) || []).map((c) => <CommentItem key={c._id} comment={c} depth={0} {...shared} />)
      )}
      <CommentInput postId={postId} onAdded={added} />
    </div>
  )
}

interface ItemProps {
  comment: Comment
  depth: number
  indent?: boolean
  postId: string
  postOwnerId: string
  childrenMap: Map<string | null, Comment[]>
  onAdded: (c: Comment) => void
  onUpdated: (c: Comment) => void
  onRemoved: (ids: string[]) => void
}

function CommentItem({ comment, depth, indent = false, postId, postOwnerId, childrenMap, onAdded, onUpdated, onRemoved }: ItemProps) {
  const me = useCurrentUser()
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false))

  const liked = comment.likes.includes(me._id)
  const isOwner = comment.user?._id === me._id
  const canDelete = isOwner || postOwnerId === me._id
  const replies = childrenMap.get(comment._id) || []

  async function toggleLike() {
    const res = await api.put(`/comments/${comment._id}/like`)
    const likes = res.data.liked ? [...comment.likes, me._id] : comment.likes.filter((id) => id !== me._id)
    onUpdated({ ...comment, likes })
  }

  async function saveEdit() {
    if (!editText.trim()) return
    const res = await api.put(`/comments/${comment._id}`, { text: editText })
    onUpdated(res.data.data)
    setEditing(false)
  }

  async function remove() {
    setMenuOpen(false)
    if (!confirm("წავშალო კომენტარი?")) return
    const res = await api.delete(`/comments/${comment._id}`)
    onRemoved(res.data.deletedIds)
  }

  return (
    <div className={indent ? "ml-10" : ""}>
      <div className="flex gap-2 mt-2 group">
        <Avatar user={comment.user} size={depth > 0 ? 24 : 32} link />
        <div className="min-w-0 flex-1">
          {editing ? (
            <div>
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit()
                  if (e.key === "Escape") setEditing(false)
                }}
                className="w-full h-9 rounded-full bg-[#f0f2f5] px-3 outline-none text-[15px]"
              />
              <p className="text-xs text-gray-500 mt-1 px-3">
                Esc - <button onClick={() => setEditing(false)} className="text-[#1877f2] hover:underline cursor-pointer">გაუქმება</button>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="relative bg-[#f0f2f5] rounded-2xl px-3 py-2 max-w-full">
                <Link href={`/profile/${comment.user?._id}`} className="font-semibold text-[13px] text-gray-900 hover:underline">
                  {fullName(comment.user)}
                </Link>
                <p className="text-[15px] text-gray-900 break-words whitespace-pre-wrap">{comment.text}</p>
                {comment.likes.length > 0 && (
                  <span className="absolute -bottom-2 -right-3 bg-white rounded-full shadow px-1 flex items-center gap-0.5 text-[13px] text-gray-500">
                    <span className="w-4 h-4 rounded-full bg-[#1877f2] flex items-center justify-center">
                      <LikeFilledIcon className="w-2.5 h-2.5 text-white" />
                    </span>
                    {comment.likes.length}
                  </span>
                )}
              </div>

              {(isOwner || canDelete) && (
                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    aria-label="მოქმედებები"
                  >
                    <DotsIcon className="w-4 h-4 text-gray-500" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-xl border border-gray-100 p-1 z-10">
                      {isOwner && (
                        <button
                          onClick={() => { setEditing(true); setMenuOpen(false) }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-[15px] cursor-pointer"
                        >
                          რედაქტირება
                        </button>
                      )}
                      <button onClick={remove} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-[15px] cursor-pointer">
                        წაშლა
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!editing && (
            <div className="flex gap-3 px-3 mt-0.5 text-xs text-gray-500">
              <span>{timeAgo(comment.createdAt)}</span>
              <button onClick={toggleLike} className={`font-bold hover:underline cursor-pointer ${liked ? "text-[#1877f2]" : ""}`}>
                მოწონება
              </button>
              <button onClick={() => setReplying(true)} className="font-bold hover:underline cursor-pointer">
                პასუხი
              </button>            </div>
          )}
        </div>
      </div>

      {replies.map((r) => (
        <CommentItem
          key={r._id}
          comment={r}
          // 2 დონეზე ღრმად აღარ ვაშორებთ (როგორც Facebook-ზე)
          depth={Math.min(depth + 1, 2)}
          indent={depth < 2}
          postId={postId}
          postOwnerId={postOwnerId}
          childrenMap={childrenMap}
          onAdded={onAdded}
          onUpdated={onUpdated}
          onRemoved={onRemoved}
        />
      ))}

      {replying && (
        <div className={depth < 2 ? "ml-10" : ""}>
          <CommentInput
            postId={postId}
            replyTo={comment}
            autoFocus
            onAdded={(c) => {
              onAdded(c)
              setReplying(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

interface InputProps {
  postId: string
  replyTo?: Comment
  autoFocus?: boolean
  onAdded: (c: Comment) => void
}

function CommentInput({ postId, replyTo, autoFocus = false, onAdded }: InputProps) {
  const me = useCurrentUser()
  const [text, setText] = useState(replyTo ? `${replyTo.user?.FirstName} ` : "")
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const res = await api.post("/comments", { text, postId, replyTo: replyTo?._id })
      onAdded(res.data.data)
      setText("")
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 mt-2">
      <Avatar user={me} size={replyTo ? 24 : 32} />
      <div className="flex-1 flex items-center bg-[#f0f2f5] rounded-full pr-2">
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={replyTo ? `უპასუხეთ ${fullName(replyTo.user)}-ს...` : "დაწერეთ კომენტარი..."}
          className="flex-1 h-9 bg-transparent px-3 outline-none text-[15px]"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="text-[#1877f2] disabled:text-gray-400 cursor-pointer disabled:cursor-default"
          aria-label="გაგზავნა"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
