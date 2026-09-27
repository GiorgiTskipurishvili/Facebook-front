"use client"
import { useState } from "react"
import type { Post } from "@/app/lib/types"
import { useCurrentUser } from "@/app/context/AuthContext"
import Avatar from "@/app/components/ui/Avatar"
import { PhotoIcon } from "@/app/icons/UiIcons"
import PostEditorModal from "./PostEditorModal"

export default function CreatePost({ onCreated }: { onCreated: (post: Post) => void }) {
  const user = useCurrentUser()
  const [open, setOpen] = useState<null | "text" | "photo">(null)

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)] px-4 pt-3 pb-2">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <Avatar user={user} size={40} link />
        <button
          onClick={() => setOpen("text")}
          className="flex-1 h-10 rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] text-left px-3 text-[17px] text-gray-500 cursor-pointer"
        >
          რას ფიქრობთ, {user.FirstName}?
        </button>
      </div>
      <div className="flex pt-2">
        <button
          onClick={() => setOpen("photo")}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg hover:bg-gray-100 text-[15px] font-semibold text-gray-600 cursor-pointer"
        >
          <PhotoIcon className="w-6 h-6 text-[#45bd62]" />
          ფოტო
        </button>
      </div>

      {open && (
        <PostEditorModal openFilePicker={open === "photo"} onClose={() => setOpen(null)} onSaved={onCreated} />
      )}
    </div>
  )
}
