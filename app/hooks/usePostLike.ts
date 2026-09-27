"use client"
import { useRef } from "react"
import api from "@/app/lib/api"
import type { Post } from "@/app/lib/types"

// პოსტის ლაიქი optimistic update-ით (PostCard და PhotoViewer)
export function usePostLike(post: Post, onUpdated: (post: Post) => void) {
  const liking = useRef(false)

  return async function toggleLike() {
    if (liking.current) return
    liking.current = true

    const liked = !post.likedByMe
    onUpdated({ ...post, likedByMe: liked, likesCount: post.likesCount + (liked ? 1 : -1) })
    try {
      const res = await api.put(`/posts/${post._id}/like`)
      onUpdated({ ...post, likedByMe: res.data.liked, likesCount: res.data.likesCount })
    } catch {
      onUpdated(post)
    } finally {
      liking.current = false
    }
  }
}
