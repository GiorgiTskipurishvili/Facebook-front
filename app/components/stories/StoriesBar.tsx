/* eslint-disable @next/next/no-img-element */
"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import api, { fileUrl, getErrorMessage } from "@/app/lib/api"
import type { Story } from "@/app/lib/types"
import { useCurrentUser } from "@/app/context/AuthContext"
import Avatar from "@/app/components/ui/Avatar"
import { PlusIcon } from "@/app/icons/UiIcons"
import StoryViewer, { type StoryGroup } from "./StoryViewer"

export default function StoriesBar() {
  const me = useCurrentUser()
  const [stories, setStories] = useState<Story[]>([])
  const [uploading, setUploading] = useState(false)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    api.get("/stories/feed").then((res) => setStories(res.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // სთორები ავტორების მიხედვით: ჯერ ჩემი, მერე დანარჩენები (უახლესი პირველი)
  const groups = useMemo<StoryGroup[]>(() => {
    const map = new Map<string, StoryGroup>()
    stories.forEach((story) => {
      const id = story.user._id
      if (!map.has(id)) map.set(id, { user: story.user, stories: [] })
      map.get(id)!.stories.push(story)
    })
    const list = [...map.values()].map((g) => ({
      ...g,
      stories: [...g.stories].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    }))
    return list.sort((a, b) => (a.user._id === me._id ? -1 : b.user._id === me._id ? 1 : 0))
  }, [stories, me._id])

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    const form = new FormData()
    form.append("image", file)
    setUploading(true)
    try {
      await api.post("/stories", form)
      load()
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  function removed(storyId: string) {
    setStories((prev) => prev.filter((s) => s._id !== storyId))
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      <button
        onClick={() => fileInput.current?.click()}
        disabled={uploading}
        className="relative w-[112px] h-[200px] shrink-0 rounded-lg overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)] group cursor-pointer"
      >
        <div className="h-[150px] overflow-hidden bg-gray-200">
          {me.ProfilePicture ? (
            <img src={fileUrl(me.ProfilePicture)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Avatar user={me} size={80} /></div>
          )}
        </div>
        <span className="absolute top-[132px] left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#1877f2] border-4 border-white flex items-center justify-center">
          <PlusIcon className="w-4 h-4 text-white" />
        </span>
        <span className="absolute bottom-2 left-0 right-0 text-center text-[13px] font-semibold text-gray-900">
          {uploading ? "იტვირთება..." : "სთორის შექმნა"}
        </span>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} />
      </button>

      {groups.map((group, index) => {
        const latest = group.stories[group.stories.length - 1]
        const allSeen = group.user._id !== me._id && group.stories.every((s) => s.views.some((v) => v.user === me._id))
        return (
          <button
            key={group.user._id}
            onClick={() => setViewerIndex(index)}
            className="relative w-[112px] h-[200px] shrink-0 rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,.2)] group cursor-pointer"
          >
            <img src={fileUrl(latest.image)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
            <span className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
            <span className={`absolute top-3 left-3 rounded-full p-[3px] ${allSeen ? "bg-gray-300" : "bg-[#1877f2]"}`}>
              <span className="block rounded-full border-2 border-white">
                <Avatar user={group.user} size={32} />
              </span>
            </span>
            <span className="absolute bottom-2 left-2 right-2 text-left text-[13px] font-semibold text-white leading-4">
              {group.user._id === me._id ? "თქვენი სთორი" : `${group.user.FirstName} ${group.user.LastName}`}
            </span>
          </button>
        )
      })}

      {viewerIndex !== null && groups[viewerIndex] && (
        <StoryViewer groups={groups} startIndex={viewerIndex} onClose={() => { setViewerIndex(null); load() }} onDeleted={removed} />
      )}
    </div>
  )
}
