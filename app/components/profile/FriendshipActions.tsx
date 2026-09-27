"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import api, { getErrorMessage } from "@/app/lib/api"
import type { Relation } from "@/app/lib/types"
import { openConversation } from "@/app/lib/chat"
import { MessengerIcon } from "@/app/icons/MessengerIcon"
import { UserAddIcon, UserCheckIcon } from "@/app/icons/UiIcons"
import { useClickOutside } from "@/app/hooks/useClickOutside"

interface Props {
  userId: string
  relation: Relation
  onChange: () => void // relation-ის ხელახლა ჩატვირთვა
}

const primary = "h-9 px-3 rounded-md bg-[#1877f2] hover:bg-[#166fe5] text-white text-[15px] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
const secondary = "h-9 px-3 rounded-md bg-[#e4e6eb] hover:bg-[#d8dadf] text-gray-900 text-[15px] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"

export default function FriendshipActions({ userId, relation, onChange }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false))

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setMenuOpen(false)
    try {
      await action()
      onChange()
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function message() {
    const conversationId = await openConversation(userId)
    router.push(`/messages/${conversationId}`)
  }

  const { friendStatus, requestId, isFollowing } = relation

  return (
    <div className="flex flex-wrap gap-2">
      {friendStatus === "none" && (
        <button disabled={busy} onClick={() => run(() => api.post(`/friends/request/${userId}`))} className={primary}>
          <UserAddIcon className="w-4 h-4" /> მეგობრად დამატება
        </button>
      )}

      {friendStatus === "request_sent" && (
        <button disabled={busy} onClick={() => run(() => api.delete(`/friends/request/${requestId}`))} className={secondary}>
          <UserAddIcon className="w-4 h-4" /> მოთხოვნის გაუქმება
        </button>
      )}

      {friendStatus === "request_received" && (
        <>
          <button disabled={busy} onClick={() => run(() => api.put(`/friends/accept/${requestId}`))} className={primary}>
            <UserCheckIcon className="w-4 h-4" /> დადასტურება
          </button>
          <button disabled={busy} onClick={() => run(() => api.put(`/friends/reject/${requestId}`))} className={secondary}>
            მოთხოვნის წაშლა
          </button>
        </>
      )}

      {friendStatus === "friends" && (
        <div ref={menuRef} className="relative">
          <button disabled={busy} onClick={() => setMenuOpen((o) => !o)} className={secondary}>
            <UserCheckIcon className="w-4 h-4" /> მეგობრები
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-10 w-56 bg-white rounded-lg shadow-xl border border-gray-100 p-2 z-20">
              <button
                onClick={() => confirm("გსურთ მეგობრობის გაუქმება?") && run(() => api.delete(`/friends/${userId}`))}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-[15px] font-medium cursor-pointer"
              >
                ❌ მეგობრობის გაუქმება
              </button>
            </div>
          )}
        </div>
      )}

      <button
        disabled={busy}
        onClick={() => run(() => api.put(`/friends/follow/${userId}`))}
        className={secondary}
      >
        {isFollowing ? "გამოწერის გაუქმება" : "გამოწერა"}
      </button>

      <button onClick={message} className={friendStatus === "friends" ? primary : secondary}>
        <MessengerIcon className="w-4 h-4" /> შეტყობინება
      </button>
    </div>
  )
}
