"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
/* eslint-disable @next/next/no-img-element */
import api from "@/app/lib/api"
import type { UserPreview } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"
import Avatar from "@/app/components/ui/Avatar"
import { BackIcon, SearchIcon } from "@/app/icons/UiIcons"
import { useClickOutside } from "@/app/hooks/useClickOutside"

export default function SearchBox() {
  const router = useRouter()
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserPreview[]>([])
  const ref = useClickOutside<HTMLDivElement>(() => setFocused(false))

  // debounce: 300ms-ში ერთხელ ვეძებთ
  useEffect(() => {
    const q = query.trim()
    if (!q) return

    const timer = setTimeout(() => {
      api.get(`/users/search?q=${encodeURIComponent(q)}`)
        .then((res) => setResults(res.data.data))
        .catch(() => setResults([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setFocused(false)
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const visibleResults = query.trim() ? results : []

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {!focused ? (
        <Link href="/" className="shrink-0">
          <img className="w-10 h-10" src="/assets/Facebook_f_logo.svg.webp" alt="Facebook" />
        </Link>
      ) : (
        <button
          onClick={() => setFocused(false)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition cursor-pointer shrink-0"
          aria-label="უკან"
        >
          <BackIcon className="w-5 h-5 text-gray-600" />
        </button>
      )}

      <form onSubmit={submit} className="relative">
        <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Facebook-ზე ძებნა"
          className="w-60 xl:w-64 h-10 rounded-full bg-[#f0f2f5] pl-9 pr-4 outline-none text-[15px] placeholder:text-gray-500"
        />
      </form>

      {focused && (
        <div className="absolute -left-2 top-12 w-[320px] bg-white rounded-b-lg shadow-xl border border-gray-100 p-2 z-50">
          {visibleResults.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">
              {query.trim() ? "შედეგები ვერ მოიძებნა" : "ჩაწერეთ სახელი საძიებლად"}
            </p>
          ) : (
            visibleResults.slice(0, 8).map((user) => (
              <Link
                key={user._id}
                href={`/profile/${user._id}`}
                onClick={() => setFocused(false)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <Avatar user={user} size={36} />
                <span className="font-medium text-[15px] text-gray-900">{fullName(user)}</span>
              </Link>
            ))
          )}
          {query.trim() && (
            <button
              onClick={submit}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-[#1877f2] cursor-pointer"
            >
              <span className="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center">
                <SearchIcon className="w-4 h-4 text-white" />
              </span>
              <span className="text-[15px]">ყველა შედეგი: &quot;{query.trim()}&quot;</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
