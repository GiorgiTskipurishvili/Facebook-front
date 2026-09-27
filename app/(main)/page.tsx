"use client"
import LeftSidebar from "@/app/components/layout/LeftSidebar"
import RightSidebar from "@/app/components/layout/RightSidebar"
import StoriesBar from "@/app/components/stories/StoriesBar"
import PostList from "@/app/components/posts/PostList"

export default function HomePage() {
  return (
    <div className="flex justify-between">
      <LeftSidebar />

      <main className="flex-1 max-w-[680px] mx-auto py-6 px-4 flex flex-col gap-4 min-w-0">
        <StoriesBar />
        <PostList
          url="/posts"
          showComposer
          emptyText="Feed ცარიელია. დაამატეთ მეგობრები ან გამოაქვეყნეთ პირველი პოსტი!"
        />
      </main>

      <RightSidebar />
    </div>
  )
}
