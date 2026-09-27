"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import api from "@/app/lib/api"
import type { Post } from "@/app/lib/types"
import PostCard from "@/app/components/posts/PostCard"
import Spinner from "@/app/components/ui/Spinner"

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then((res) => setPost(res.data.data))
      .catch(() => setNotFound(true))
  }, [id])

  return (
    <main className="max-w-[680px] mx-auto py-6 px-4">
      {notFound ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-xl font-bold text-gray-700 mb-2">პოსტი მიუწვდომელია</h1>
          <p className="text-gray-500 mb-4">შესაძლოა წაიშალა.</p>
          <Link href="/" className="text-[#1877f2] font-semibold hover:underline">მთავარ გვერდზე დაბრუნება</Link>
        </div>
      ) : !post ? (
        <Spinner className="py-20" />
      ) : (
        <PostCard post={post} onUpdated={setPost} onDeleted={() => router.push("/")} defaultShowComments />
      )}
    </main>
  )
}
