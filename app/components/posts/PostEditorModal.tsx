/* eslint-disable @next/next/no-img-element */
"use client"
import { useRef, useState } from "react"
import api, { fileUrl, getErrorMessage } from "@/app/lib/api"
import type { Post } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"
import { useCurrentUser } from "@/app/context/AuthContext"
import Modal from "@/app/components/ui/Modal"
import Avatar from "@/app/components/ui/Avatar"
import { CloseIcon, PhotoIcon } from "@/app/icons/UiIcons"

interface Props {
  post?: Post // თუ გადმოეცა - რედაქტირების რეჟიმი
  openFilePicker?: boolean
  onClose: () => void
  onSaved: (post: Post) => void
}

export default function PostEditorModal({ post, openFilePicker = false, onClose, onSaved }: Props) {
  const user = useCurrentUser()
  const [desc, setDesc] = useState(post?.desc || "")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(post?.image ? fileUrl(post.image) : "")
  const [removeImage, setRemoveImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  const pickerOpened = useRef(false)
  // გაზიარებას ფოტო არ აქვს და ტექსტი არასავალდებულოა
  const isShare = post?.type === "share"
  const canSubmit = isShare || !!desc.trim() || !!preview

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (selected.size > 5 * 1024 * 1024) {
      setError("ფაილის ზომა არ უნდა აღემატებოდეს 5MB-ს")
      return
    }
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setRemoveImage(false)
    setError("")
  }

  function clearImage() {
    setFile(null)
    setPreview("")
    if (post?.image) setRemoveImage(true)
    if (fileInput.current) fileInput.current.value = ""
  }

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    setError("")

    const form = new FormData()
    form.append("desc", desc)
    if (file) form.append("image", file)
    if (removeImage) form.append("removeImage", "true")

    try {
      const res = post ? await api.put(`/posts/${post._id}`, form) : await api.post("/posts", form)
      onSaved(res.data.data)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={post ? "პოსტის რედაქტირება" : "პოსტის შექმნა"} onClose={onClose}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Avatar user={user} size={40} />
          <span className="font-semibold text-[15px] text-gray-900">{fullName(user)}</span>
        </div>

        <textarea
          autoFocus
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={`რას ფიქრობთ, ${user.FirstName}?`}
          rows={preview ? 2 : 5}
          className="w-full resize-none outline-none text-2xl placeholder:text-gray-500 text-gray-900"
        />

        {preview && (
          <div className="relative rounded-lg border border-gray-200 p-2 mb-3">
            <img src={preview} alt="" className="w-full max-h-[300px] object-contain rounded-md" />
            <button
              onClick={clearImage}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              aria-label="სურათის წაშლა"
            >
              <CloseIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}

        <div className={`flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 mb-3 ${isShare ? "hidden" : ""}`}>
          <span className="font-semibold text-[15px] text-gray-900">დაამატეთ პოსტს</span>
          <button
            onClick={() => fileInput.current?.click()}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
            aria-label="ფოტოს დამატება"
          >
            <PhotoIcon className="w-6 h-6 text-[#45bd62]" />
          </button>
          <input
            ref={(el) => {
              fileInput.current = el
              // "ფოტო" ღილაკიდან გახსნისას ფაილის ამორჩევა ავტომატურად იხსნება
              if (el && openFilePicker && !pickerOpened.current) {
                pickerOpened.current = true
                setTimeout(() => el.click(), 0)
              }
            }}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={pickFile}
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={submit}
          disabled={saving || !canSubmit}
          className="w-full h-9 rounded-md bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-[15px] disabled:bg-[#e4e6eb] disabled:text-[#bcc0c4] cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? "ინახება..." : post ? "შენახვა" : "გამოქვეყნება"}
        </button>
      </div>
    </Modal>
  )
}
