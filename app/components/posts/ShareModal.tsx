"use client"
import { useState } from "react"
import api, { getErrorMessage } from "@/app/lib/api"
import type { Post, SharedPost } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"
import { useCurrentUser } from "@/app/context/AuthContext"
import Modal from "@/app/components/ui/Modal"
import Avatar from "@/app/components/ui/Avatar"
import SharedPostEmbed from "./SharedPostEmbed"

export interface ShareResult {
  post: Post // ახალი (გაზიარების) პოსტი
  originalId: string
  sharesCount: number
}

interface Props {
  post: Post
  onClose: () => void
  onShared: (result: ShareResult) => void
}

export default function ShareModal({ post, onClose, onShared }: Props) {
  const me = useCurrentUser()
  const [desc, setDesc] = useState("")
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState("")

  // გაზიარების გაზიარებისას ორიგინალს ვაჩვენებთ (server-იც ორიგინალს აზიარებს)
  const preview: SharedPost | null = post.type === "share" ? post.sharedPost ?? null : post

  async function share() {
    setSharing(true)
    setError("")
    try {
      const res = await api.post(`/posts/${post._id}/share`, { desc })
      onShared({ post: res.data.data, originalId: res.data.originalId, sharesCount: res.data.sharesCount })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
      setSharing(false)
    }
  }

  return (
    <Modal title="გაზიარება" onClose={onClose}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Avatar user={me} size={40} />
          <span className="font-semibold text-[15px] text-gray-900">{fullName(me)}</span>
        </div>
        <textarea
          autoFocus
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="დაწერეთ რამე ამის შესახებ..."
          rows={3}
          className="w-full resize-none outline-none text-[17px] placeholder:text-gray-500 text-gray-900"
        />
      </div>

      <div className="-mx-0 pointer-events-none">
        <SharedPostEmbed post={preview} />
      </div>

      <div className="p-4 pt-1">
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={share}
          disabled={sharing || !preview}
          className="w-full h-9 rounded-md bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-[15px] disabled:opacity-60 cursor-pointer"
        >
          {sharing ? "ზიარდება..." : "ახლავე გაზიარება"}
        </button>
      </div>
    </Modal>
  )
}
