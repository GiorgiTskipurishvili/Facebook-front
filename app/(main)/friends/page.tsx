/* eslint-disable @next/next/no-img-element */
"use client"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import api, { fileUrl, getErrorMessage } from "@/app/lib/api"
import type { FriendRequest, Suggestion, UserPreview } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"
import { useSocketEvent } from "@/app/context/SocketContext"
import Avatar from "@/app/components/ui/Avatar"
import Spinner from "@/app/components/ui/Spinner"
import { FriendsIcon, UserAddIcon, UserCheckIcon } from "@/app/icons/UiIcons"

type Tab = "requests" | "suggestions" | "all" | "sent"

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "requests", label: "მეგობრობის მოთხოვნები", icon: <UserAddIcon className="w-5 h-5" /> },
  { key: "suggestions", label: "შეთავაზებები", icon: <UserCheckIcon className="w-5 h-5" /> },
  { key: "all", label: "ყველა მეგობარი", icon: <FriendsIcon className="w-5 h-5" /> },
  { key: "sent", label: "გაგზავნილი მოთხოვნები", icon: <UserAddIcon className="w-5 h-5" /> }
]

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("requests")
  const [requests, setRequests] = useState<FriendRequest[] | null>(null)
  const [sent, setSent] = useState<FriendRequest[] | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null)
  const [friends, setFriends] = useState<UserPreview[] | null>(null)
  // suggestion-ებისთვის: userId -> გაგზავნილი მოთხოვნის ID
  const [sentTo, setSentTo] = useState<Record<string, string>>({})

  const loadAll = useCallback(() => {
    api.get("/friends/requests").then((r) => setRequests(r.data.data)).catch(() => setRequests([]))
    api.get("/friends/requests/sent").then((r) => setSent(r.data.data)).catch(() => setSent([]))
    api.get("/friends/suggestions").then((r) => setSuggestions(r.data.data)).catch(() => setSuggestions([]))
    api.get("/friends").then((r) => setFriends(r.data.data)).catch(() => setFriends([]))
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useSocketEvent<{ type: string }>("notification:new", (n) => {
    if (n.type === "friend_request" || n.type === "friend_accept") loadAll()
  })

  async function act(action: () => Promise<unknown>, after: () => void) {
    try {
      await action()
      after()
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  function respond(request: FriendRequest, type: "accept" | "reject") {
    act(() => api.put(`/friends/${type}/${request._id}`), () => {
      setRequests((prev) => prev?.filter((r) => r._id !== request._id) || null)
      if (type === "accept") setFriends((prev) => [...(prev || []), request.sender])
    })
  }

  function sendRequest(user: UserPreview) {
    act(async () => {
      const res = await api.post(`/friends/request/${user._id}`)
      setSentTo((prev) => ({ ...prev, [user._id]: res.data.data._id }))
    }, () => {})
  }

  function cancelRequest(requestId: string, userId: string) {
    act(() => api.delete(`/friends/request/${requestId}`), () => {
      setSent((prev) => prev?.filter((r) => r._id !== requestId) || null)
      setSentTo((prev) => {
        const copy = { ...prev }
        delete copy[userId]
        return copy
      })
    })
  }

  function removeSuggestion(userId: string) {
    setSuggestions((prev) => prev?.filter((s) => s._id !== userId) || null)
  }

  function unfriend(user: UserPreview) {
    if (!confirm(`გსურთ ${fullName(user)}-ს მეგობრობიდან წაშლა?`)) return
    act(() => api.delete(`/friends/${user._id}`), () => setFriends((prev) => prev?.filter((f) => f._id !== user._id) || null))
  }

  return (
    <div className="flex">
      <aside className="hidden md:block w-[300px] lg:w-[360px] shrink-0 bg-white shadow-[1px_0_2px_rgba(0,0,0,.1)] sticky top-14 h-[calc(100vh-56px)] p-2">
        <h1 className="text-2xl font-bold text-gray-900 px-2 py-3">მეგობრები</h1>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left cursor-pointer ${tab === t.key ? "bg-[#f0f2f5]" : "hover:bg-[#f0f2f5]"}`}
          >
            <span className={`w-9 h-9 rounded-full flex items-center justify-center ${tab === t.key ? "bg-[#1877f2] text-white" : "bg-[#e4e6eb] text-gray-900"}`}>
              {t.icon}
            </span>
            <span className="flex-1 font-semibold text-[15px] text-gray-900">{t.label}</span>
            {t.key === "requests" && !!requests?.length && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#e41e3f] text-white text-xs font-bold flex items-center justify-center">{requests.length}</span>
            )}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-4 md:p-8 min-w-0">
        {/* მობილურზე tab-ები ზემოთ */}
        <div className="md:hidden flex gap-2 overflow-x-auto mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-3 py-2 rounded-full text-sm font-semibold ${tab === t.key ? "bg-[#ebf5ff] text-[#1877f2]" : "bg-[#e4e6eb] text-gray-900"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "requests" && (
          <Section title="მეგობრობის მოთხოვნები" items={requests} empty="ახალი მოთხოვნები არ გაქვთ">
            {requests?.map((r) => (
              <PersonCard key={r._id} user={r.sender}>
                <button onClick={() => respond(r, "accept")} className={btnPrimary}>დადასტურება</button>
                <button onClick={() => respond(r, "reject")} className={btnSecondary}>წაშლა</button>
              </PersonCard>
            ))}
          </Section>
        )}

        {tab === "suggestions" && (
          <Section title="ხალხი, ვისაც შეიძლება იცნობდეთ" items={suggestions} empty="შეთავაზებები ამჟამად არ არის">
            {suggestions?.map((s) => (
              <PersonCard key={s._id} user={s} subtitle={s.mutualFriends ? `${s.mutualFriends} საერთო მეგობარი` : undefined}>
                {sentTo[s._id] ? (
                  <button onClick={() => cancelRequest(sentTo[s._id], s._id)} className={btnSecondary}>გაუქმება</button>
                ) : (
                  <>
                    <button onClick={() => sendRequest(s)} className={btnPrimaryLight}>მეგობრად დამატება</button>
                    <button onClick={() => removeSuggestion(s._id)} className={btnSecondary}>დამალვა</button>
                  </>
                )}
              </PersonCard>
            ))}
          </Section>
        )}

        {tab === "all" && (
          <Section title="ყველა მეგობარი" items={friends} empty="მეგობრები ჯერ არ გყავთ">
            {friends?.map((f) => (
              <PersonCard key={f._id} user={f}>
                <Link href={`/profile/${f._id}`} className={`${btnPrimaryLight} flex items-center justify-center`}>პროფილი</Link>
                <button onClick={() => unfriend(f)} className={btnSecondary}>წაშლა</button>
              </PersonCard>
            ))}
          </Section>
        )}

        {tab === "sent" && (
          <Section title="გაგზავნილი მოთხოვნები" items={sent} empty="გაგზავნილი მოთხოვნები არ არის">
            {sent?.map((r) => (
              <PersonCard key={r._id} user={r.receiver}>
                <button onClick={() => cancelRequest(r._id, r.receiver._id)} className={btnSecondary}>მოთხოვნის გაუქმება</button>
              </PersonCard>
            ))}
          </Section>
        )}
      </main>
    </div>
  )
}

const btnPrimary = "w-full h-9 rounded-md bg-[#1877f2] hover:bg-[#166fe5] text-white text-[15px] font-semibold cursor-pointer"
const btnPrimaryLight = "w-full h-9 rounded-md bg-[#ebf5ff] hover:bg-[#dbe7f2] text-[#1877f2] text-[15px] font-semibold cursor-pointer"
const btnSecondary = "w-full h-9 rounded-md bg-[#e4e6eb] hover:bg-[#d8dadf] text-gray-900 text-[15px] font-semibold cursor-pointer"

function Section({ title, items, empty, children }: { title: string; items: unknown[] | null; empty: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      {items === null ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-[15px]">{empty}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">{children}</div>
      )}
    </section>
  )
}

function PersonCard({ user, subtitle, children }: { user: UserPreview; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)] overflow-hidden flex flex-col">
      <Link href={`/profile/${user._id}`} className="block aspect-square bg-gray-200">
        {user.ProfilePicture ? (
          <img src={fileUrl(user.ProfilePicture)} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Avatar user={user} size={96} /></div>
        )}
      </Link>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <Link href={`/profile/${user._id}`} className="font-semibold text-[17px] text-gray-900 leading-5 hover:underline">
          {fullName(user)}
        </Link>
        <p className="text-[13px] text-gray-500 min-h-4">{subtitle}</p>
        <div className="mt-auto flex flex-col gap-1.5">{children}</div>
      </div>
    </div>
  )
}
