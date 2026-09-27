/* eslint-disable @next/next/no-img-element */
"use client"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import api, { fileUrl, getErrorMessage } from "@/app/lib/api"
import type { Conversation, Message, Paginated } from "@/app/lib/types"
import { formatTime, fullName, timeAgo } from "@/app/lib/utils"
import { useCurrentUser } from "@/app/context/AuthContext"
import { useSocket, useSocketEvent } from "@/app/context/SocketContext"
import Avatar from "@/app/components/ui/Avatar"
import Spinner from "@/app/components/ui/Spinner"
import { BackIcon, CloseIcon, PhotoIcon, SendIcon } from "@/app/icons/UiIcons"

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  // საუბრის შეცვლისას state-ის სრული reset
  return <Chat key={id} conversationId={id} />
}

function Chat({ conversationId }: { conversationId: string }) {
  const me = useCurrentUser()
  const { socket, isOnline, refreshUnreadMessages } = useSocket()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [error, setError] = useState("")
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [sending, setSending] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const lastTypingSent = useRef(0)
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const scrollMode = useRef<"bottom" | "keep" | null>("bottom")
  const prevScrollHeight = useRef(0)

  const other = conversation?.participants.find((p) => p._id !== me._id)

  const markSeen = useCallback(() => {
    api.put(`/messages/${conversationId}/seen`).then(refreshUnreadMessages).catch(() => {})
  }, [conversationId, refreshUnreadMessages])

  useEffect(() => {
    api.get(`/messages/conversation/${conversationId}`)
      .then((res) => setConversation(res.data.data))
      .catch((err) => setError(getErrorMessage(err, "საუბარი ვერ მოიძებნა")))

    api.get<Paginated<Message>>(`/messages/${conversationId}?page=1`)
      .then((res) => {
        scrollMode.current = "bottom"
        setMessages(res.data.data)
        setHasMore(res.data.hasMore)
      })
      .catch(() => {})

    markSeen()
  }, [conversationId, markSeen])

  // საუბრის ოთახში შესვლა ("წერს..." ინდიკატორისთვის); reconnect-ზე თავიდან
  useEffect(() => {
    if (!socket) return
    const join = () => socket.emit("conversation:join", conversationId)
    join()
    socket.on("connect", join)
    return () => {
      socket.off("connect", join)
      socket.emit("conversation:leave", conversationId)
    }
  }, [socket, conversationId])

  useSocketEvent<Message>("message:new", (message) => {
    if (message.conversation !== conversationId) return
    scrollMode.current = "bottom"
    setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]))
    if (message.sender._id !== me._id) {
      setOtherTyping(false)
      markSeen()
    }
  })

  useSocketEvent<{ conversationId: string; userId: string }>("message:seen", ({ conversationId: cid, userId }) => {
    if (cid !== conversationId || userId === me._id) return
    setMessages((prev) => prev.map((m) => (m.seenBy.includes(userId) ? m : { ...m, seenBy: [...m.seenBy, userId] })))
  })

  useSocketEvent<{ conversationId: string; userId: string }>("typing", ({ conversationId: cid, userId }) => {
    if (cid !== conversationId || userId === me._id) return
    setOtherTyping(true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => setOtherTyping(false), 3000)
  })

  useSocketEvent<{ conversationId: string }>("typing:stop", ({ conversationId: cid }) => {
    if (cid === conversationId) setOtherTyping(false)
  })

  // scroll: ახალ შეტყობინებაზე ქვემოთ, ძველების ჩატვირთვისას პოზიცია რჩება
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    if (scrollMode.current === "bottom") list.scrollTop = list.scrollHeight
    if (scrollMode.current === "keep") list.scrollTop = list.scrollHeight - prevScrollHeight.current
    scrollMode.current = null
  }, [messages, otherTyping])

  async function loadOlder() {
    if (loadingOlder) return
    setLoadingOlder(true)
    try {
      const res = await api.get<Paginated<Message>>(`/messages/${conversationId}?page=${page + 1}`)
      prevScrollHeight.current = listRef.current?.scrollHeight || 0
      scrollMode.current = "keep"
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m._id))
        return [...res.data.data.filter((m) => !ids.has(m._id)), ...prev]
      })
      setPage((p) => p + 1)
      setHasMore(res.data.hasMore)
    } finally {
      setLoadingOlder(false)
    }
  }

  function onTextChange(value: string) {
    setText(value)
    // "წერს..." მაქსიმუმ 2 წამში ერთხელ
    if (socket && value && Date.now() - lastTypingSent.current > 2000) {
      lastTypingSent.current = Date.now()
      socket.emit("typing", { conversationId })
    }
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    e.target.value = ""
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  function clearFile() {
    setFile(null)
    setPreview("")
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if ((!text.trim() && !file) || sending) return

    const form = new FormData()
    if (text.trim()) form.append("text", text.trim())
    if (file) form.append("image", file)

    setSending(true)
    try {
      const res = await api.post(`/messages/${conversationId}`, form)
      const message: Message = res.data.data
      scrollMode.current = "bottom"
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]))
      setText("")
      clearFile()
      lastTypingSent.current = 0
      socket?.emit("typing:stop", { conversationId })
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  if (error) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">{error}</div>
  }
  if (!conversation || !other) return <Spinner className="py-20" />

  const online = isOnline(other)
  // ბოლო ჩემი შეტყობინება, რომელიც მეორე მხარემ ნახა
  const lastSeenMine = [...messages].reverse().find((m) => m.sender._id === me._id && m.seenBy.includes(other._id))

  return (
    <>
      <header className="h-16 shrink-0 flex items-center gap-2 px-3 border-b border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,.05)]">
        <Link href="/messages" className="md:hidden w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center" aria-label="უკან">
          <BackIcon className="w-5 h-5 text-[#1877f2]" />
        </Link>
        <Link href={`/profile/${other._id}`} className="flex items-center gap-2 rounded-md hover:bg-gray-100 p-1 pr-2">
          <Avatar user={other} size={40} online={online} />
          <span>
            <span className="block font-semibold text-[15px] text-gray-900">{fullName(other)}</span>
            <span className="block text-[13px] text-gray-500">
              {online ? "აქტიურია ახლა" : other.lastSeen ? `აქტიური იყო ${timeAgo(other.lastSeen)} წინ` : ""}
            </span>
          </span>
        </Link>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-0.5">
        {hasMore && (
          <button onClick={loadOlder} disabled={loadingOlder} className="self-center text-[13px] text-[#1877f2] hover:underline my-2 cursor-pointer">
            {loadingOlder ? "იტვირთება..." : "ძველი შეტყობინებების ჩატვირთვა"}
          </button>
        )}

        {!hasMore && (
          <div className="flex flex-col items-center text-center py-6">
            <Avatar user={other} size={60} />
            <p className="font-semibold text-gray-900 mt-2">{fullName(other)}</p>
            <p className="text-[13px] text-gray-500">თქვენ ერთმანეთს Facebook-ზე უკავშირდებით</p>
          </div>
        )}

        {messages.map((m, i) => {
          const mine = m.sender._id === me._id
          const prevMsg = messages[i - 1]
          const nextMsg = messages[i + 1]
          const showTime = !prevMsg || new Date(m.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 10 * 60 * 1000
          const lastInGroup = !nextMsg || nextMsg.sender._id !== m.sender._id

          return (
            <div key={m._id}>
              {showTime && <p className="text-center text-xs text-gray-500 my-3">{timeAgo(m.createdAt)} · {formatTime(m.createdAt)}</p>}
              <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && <span className="w-7">{lastInGroup && <Avatar user={other} size={28} />}</span>}
                <div className={`max-w-[70%] flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`} title={formatTime(m.createdAt)}>
                  {m.image && (
                    <a href={fileUrl(m.image)} target="_blank" rel="noreferrer">
                      <img src={fileUrl(m.image)} alt="" className="max-h-[280px] rounded-2xl border border-gray-200" />
                    </a>
                  )}
                  {m.text && (
                    <p className={`px-3 py-2 rounded-[18px] text-[15px] whitespace-pre-wrap break-words ${mine ? "bg-[#0084ff] text-white" : "bg-[#f0f0f0] text-gray-900"}`}>
                      {m.text}
                    </p>
                  )}
                </div>
              </div>
              {lastSeenMine?._id === m._id && (
                <div className="flex justify-end mt-0.5" title="ნანახია">
                  <Avatar user={other} size={14} />
                </div>
              )}
            </div>
          )
        })}

        {otherTyping && (
          <div className="flex items-end gap-2 mt-1">
            <Avatar user={other} size={28} />
            <span className="bg-[#f0f0f0] rounded-[18px] px-3 py-2.5 flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </span>
          </div>
        )}
      </div>

      {preview && (
        <div className="px-4 pt-2">
          <div className="relative inline-block">
            <img src={preview} alt="" className="h-20 rounded-lg" />
            <button onClick={clearFile} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center cursor-pointer" aria-label="წაშლა">
              <CloseIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={send} className="shrink-0 flex items-center gap-2 p-3">
        <button type="button" onClick={() => fileInput.current?.click()} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer" aria-label="ფოტო">
          <PhotoIcon className="w-5 h-5 text-[#0084ff]" />
        </button>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickFile} />
        <input
          autoFocus
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={() => socket?.emit("typing:stop", { conversationId })}
          placeholder="Aa"
          className="flex-1 h-9 rounded-full bg-[#f0f2f5] px-4 outline-none text-[15px]"
        />
        <button
          type="submit"
          disabled={sending || (!text.trim() && !file)}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#0084ff] disabled:text-gray-300 cursor-pointer disabled:cursor-default"
          aria-label="გაგზავნა"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </>
  )
}
