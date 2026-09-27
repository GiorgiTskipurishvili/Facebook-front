/* eslint-disable @next/next/no-img-element */
"use client"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import api, { fileUrl } from "@/app/lib/api"
import type { Story, StoryView, UserPreview } from "@/app/lib/types"
import { fullName, timeAgo } from "@/app/lib/utils"
import { useCurrentUser } from "@/app/context/AuthContext"
import Avatar from "@/app/components/ui/Avatar"
import { CloseIcon, EyeIcon } from "@/app/icons/UiIcons"

export interface StoryGroup {
  user: UserPreview
  stories: Story[]
}

interface Props {
  groups: StoryGroup[]
  startIndex: number
  onClose: () => void
  onDeleted: (storyId: string) => void
}

const DURATION = 5000

export default function StoryViewer({ groups: initialGroups, startIndex, onClose, onDeleted }: Props) {
  const me = useCurrentUser()
  const [groups, setGroups] = useState(initialGroups)
  const [groupIndex, setGroupIndex] = useState(startIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [views, setViews] = useState<StoryView[] | null>(null)

  const group = groups[groupIndex]
  const story = group?.stories[storyIndex]
  const isMine = group?.user._id === me._id

  const next = useCallback(() => {
    if (!group) return
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1)
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1)
      setStoryIndex(0)
    } else {
      onClose()
    }
  }, [group, storyIndex, groupIndex, groups.length, onClose])

  function prev() {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1)
    } else if (groupIndex > 0) {
      setGroupIndex((i) => i - 1)
      setStoryIndex(0)
    }
  }

  // ნახვის დაფიქსირება server-ზე
  useEffect(() => {
    if (story && !isMine) api.get(`/stories/${story._id}`).catch(() => {})
  }, [story, isMine])

  // ავტომატური გადასვლა შემდეგზე
  useEffect(() => {
    if (!story || paused || views) return
    const timer = setTimeout(next, DURATION)
    return () => clearTimeout(timer)
  }, [story, paused, views, next])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  })

  async function showViews() {
    if (!story) return
    setPaused(true)
    const res = await api.get(`/stories/${story._id}/views`)
    setViews(res.data.data)
  }

  async function remove() {
    if (!story || !confirm("წავშალო სთორი?")) return
    await api.delete(`/stories/${story._id}`)
    onDeleted(story._id)

    const remaining = group.stories.filter((s) => s._id !== story._id)
    if (remaining.length === 0) {
      onClose()
      return
    }
    setGroups((prev) => prev.map((g, i) => (i === groupIndex ? { ...g, stories: remaining } : g)))
    setStoryIndex((i) => Math.min(i, remaining.length - 1))
  }

  if (!group || !story) return null

  return (
    <div className="fixed inset-0 z-[100] bg-[#18191a] flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
        aria-label="დახურვა"
      >
        <CloseIcon className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={prev}
        disabled={groupIndex === 0 && storyIndex === 0}
        className="hidden sm:flex w-12 h-12 mr-4 rounded-full bg-white/80 hover:bg-white items-center justify-center text-2xl disabled:opacity-0 cursor-pointer"
        aria-label="წინა"
      >
        ‹
      </button>

      <div
        className="relative h-[90vh] aspect-[9/16] max-w-full bg-black rounded-lg overflow-hidden"
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* progress bars */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
          {group.stories.map((s, i) => (
            <div key={s._id} className="flex-1 h-[3px] rounded-full bg-white/40 overflow-hidden">
              <div
                key={`${s._id}-${storyIndex}`}
                className="h-full bg-white"
                style={{
                  width: i < storyIndex ? "100%" : i === storyIndex ? undefined : "0%",
                  animation: i === storyIndex ? `story-progress ${DURATION}ms linear forwards` : undefined,
                  animationPlayState: paused || views ? "paused" : "running"
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-5 left-3 right-3 flex items-center gap-2 z-10">
          <Link href={`/profile/${group.user._id}`} onClick={onClose} className="flex items-center gap-2">
            <Avatar user={group.user} size={40} />
            <span className="text-white font-semibold text-[15px]">{fullName(group.user)}</span>
          </Link>
          <span className="text-white/80 text-[13px]">{timeAgo(story.createdAt)}</span>
          {isMine && (
            <button onClick={remove} className="ml-auto text-white/90 hover:text-white text-sm bg-black/30 rounded-md px-2 py-1 cursor-pointer">
              წაშლა
            </button>
          )}
        </div>

        <img src={fileUrl(story.image)} alt="" className="w-full h-full object-contain select-none" draggable={false} />

        {/* მარცხენა/მარჯვენა ნახევარზე დაჭერა */}
        <button className="absolute left-0 top-16 bottom-16 w-1/3" onClick={prev} aria-label="წინა" />
        <button className="absolute right-0 top-16 bottom-16 w-1/3" onClick={next} aria-label="შემდეგი" />

        {isMine && (
          <button
            onClick={showViews}
            className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm font-semibold bg-black/40 rounded-full px-3 py-1.5 cursor-pointer"
          >
            <EyeIcon className="w-4 h-4" />
            {story.views.length} ნახვა
          </button>
        )}

        {views && (
          <div className="absolute inset-x-0 bottom-0 max-h-[60%] bg-white rounded-t-xl p-3 overflow-y-auto z-20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">ნახვები ({views.length})</h3>
              <button
                onClick={() => { setViews(null); setPaused(false) }}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                aria-label="დახურვა"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            {views.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">ჯერ არავის უნახავს</p>
            ) : (
              views.map((v) => (
                <div key={v.user._id} className="flex items-center gap-2 py-1.5">
                  <Avatar user={v.user} size={36} />
                  <span className="flex-1 text-[15px] font-medium">{fullName(v.user)}</span>
                  <span className="text-xs text-gray-500">{timeAgo(v.viewedAt)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <button
        onClick={next}
        className="hidden sm:flex w-12 h-12 ml-4 rounded-full bg-white/80 hover:bg-white items-center justify-center text-2xl cursor-pointer"
        aria-label="შემდეგი"
      >
        ›
      </button>
    </div>
  )
}
