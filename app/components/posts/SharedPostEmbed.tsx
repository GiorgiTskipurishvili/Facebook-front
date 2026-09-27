/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { fileUrl } from "@/app/lib/api"
import type { SharedPost } from "@/app/lib/types"
import { fullName, timeAgo } from "@/app/lib/utils"
import Avatar from "@/app/components/ui/Avatar"

// გაზიარებული ორიგინალი პოსტი ჩარჩოში (როგორც Facebook-ზე)
export default function SharedPostEmbed({ post }: { post: SharedPost | null }) {
  if (!post) {
    return (
      <div className="mx-4 mb-3 rounded-lg border border-gray-300 bg-[#f0f2f5] p-4">
        <p className="font-semibold text-[15px] text-gray-900">ეს კონტენტი ახლა მიუწვდომელია</p>
        <p className="text-[13px] text-gray-500">შესაძლოა ავტორმა წაშალა.</p>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-3 rounded-lg border border-gray-300 overflow-hidden">
      {post.image && (
        <Link href={`/post/${post._id}`} className="block bg-black/5">
          <img src={fileUrl(post.image)} alt="" className="w-full max-h-[500px] object-contain" />
        </Link>
      )}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Avatar user={post.user} size={32} link />
          <div>
            <Link href={`/profile/${post.user?._id}`} className="font-semibold text-[15px] text-gray-900 hover:underline">
              {fullName(post.user)}
            </Link>
            <Link href={`/post/${post._id}`} className="block text-[13px] text-gray-500 hover:underline">
              {timeAgo(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.desc && <p className="mt-2 text-[15px] text-gray-900 whitespace-pre-wrap break-words">{post.desc}</p>}
      </div>
    </div>
  )
}
