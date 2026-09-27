"use client"
import type { Post } from "@/app/lib/types"
import { usePaginated } from "@/app/hooks/usePaginated"
import LoadMoreTrigger from "@/app/components/ui/LoadMoreTrigger"
import CreatePost from "./CreatePost"
import PostCard from "./PostCard"

interface Props {
  url: string
  showComposer?: boolean
  emptyText?: string
}

// პოსტების სია infinite scroll-ით (feed და პროფილი)
export default function PostList({ url, showComposer = false, emptyText = "პოსტები ჯერ არ არის" }: Props) {
  const { items: posts, setItems: setPosts, hasMore, loading, loadMore } = usePaginated<Post>(url)

  function updated(post: Post) {
    setPosts((prev) => prev.map((p) => (p._id === post._id ? post : p)))
  }

  function deleted(postId: string) {
    setPosts((prev) => prev.filter((p) => p._id !== postId))
  }

  return (
    <div className="flex flex-col gap-4">
      {showComposer && <CreatePost onCreated={(post) => setPosts((prev) => [post, ...prev])} />}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} onUpdated={updated} onDeleted={deleted} />
      ))}

      {!loading && !hasMore && posts.length === 0 && (
        <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)] p-8 text-center text-gray-500">{emptyText}</div>
      )}

      <LoadMoreTrigger hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
    </div>
  )
}
