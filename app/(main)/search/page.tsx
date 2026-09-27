"use client"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import api from "@/app/lib/api"
import type { UserPreview } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"
import Avatar from "@/app/components/ui/Avatar"
import Spinner from "@/app/components/ui/Spinner"

export default function SearchPage() {
  return (
    <Suspense fallback={<Spinner className="py-20" />}>
      <SearchResults />
    </Suspense>
  )
}

function SearchResults() {
  const q = useSearchParams().get("q") || ""
  const [results, setResults] = useState<{ q: string; users: UserPreview[] } | null>(null)

  useEffect(() => {
    api.get(`/users/search?q=${encodeURIComponent(q)}`)
      .then((res) => setResults({ q, users: res.data.data }))
      .catch(() => setResults({ q, users: [] }))
  }, [q])

  const loading = !results || results.q !== q

  return (
    <main className="max-w-[680px] mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)] p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-3">ძებნის შედეგები: &quot;{q}&quot;</h1>

        {loading ? (
          <Spinner />
        ) : results.users.length === 0 ? (
          <p className="text-gray-500 py-6 text-center">შედეგები ვერ მოიძებნა</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {results.users.map((u) => (
              <Link key={u._id} href={`/profile/${u._id}`} className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-50">
                <Avatar user={u} size={60} />
                <span className="font-semibold text-[17px] text-gray-900">{fullName(u)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
