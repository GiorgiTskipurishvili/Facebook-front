/* eslint-disable @next/next/no-img-element */
"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import api, { fileUrl, getErrorMessage } from "@/app/lib/api"
import type { Relation, User } from "@/app/lib/types"
import { formatDate, fullName } from "@/app/lib/utils"
import { useAuth } from "@/app/context/AuthContext"
import { useSocket } from "@/app/context/SocketContext"
import Avatar from "@/app/components/ui/Avatar"
import Spinner from "@/app/components/ui/Spinner"
import UserListModal from "@/app/components/ui/UserListModal"
import PostList from "@/app/components/posts/PostList"
import FriendshipActions from "@/app/components/profile/FriendshipActions"
import FriendsGrid from "@/app/components/profile/FriendsGrid"
import PhotoGrid from "@/app/components/photos/PhotoGrid"
import { CameraIcon } from "@/app/icons/UiIcons"

type Tab = "posts" | "photos" | "about" | "friends"

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user: me, setUser: setMe } = useAuth()
  const { isOnline } = useSocket()
  const [profile, setProfile] = useState<User | null>(null)
  const [relation, setRelation] = useState<Relation | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState<Tab>("posts")
  const [listModal, setListModal] = useState<null | "followers" | "following">(null)
  const [uploading, setUploading] = useState<null | "avatar" | "cover">(null)
  // ახალი ავატარი/ქავერი პოსტსაც ქმნის -> სიების თავიდან ჩატვირთვა
  const [contentVersion, setContentVersion] = useState(0)
  const avatarInput = useRef<HTMLInputElement>(null)
  const coverInput = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    api.get(`/users/${id}`)
      .then((res) => {
        setProfile(res.data.data)
        setRelation(res.data.relation)
      })
      .catch(() => setNotFound(true))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const isMe = me?._id === id

  async function uploadImage(kind: "avatar" | "cover", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    const form = new FormData()
    form.append("image", file)
    setUploading(kind)
    try {
      const res = await api.put(`/users/me/${kind}`, form)
      setProfile(res.data.data)
      setMe(res.data.data)
      setContentVersion((v) => v + 1)
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setUploading(null)
    }
  }

  if (notFound) {
    return (
      <div className="max-w-[500px] mx-auto text-center py-20">
        <h1 className="text-xl font-bold text-gray-700 mb-2">ეს გვერდი მიუწვდომელია</h1>
        <p className="text-gray-500 mb-4">შესაძლოა ბმული არასწორია ან პროფილი წაიშალა.</p>
        <Link href="/" className="text-[#1877f2] font-semibold hover:underline">მთავარ გვერდზე დაბრუნება</Link>
      </div>
    )
  }

  if (!profile || !relation) return <Spinner className="py-20" />

  const tabs: { key: Tab; label: string }[] = [
    { key: "posts", label: "პოსტები" },
    { key: "photos", label: "ფოტოები" },
    { key: "about", label: "შესახებ" },
    { key: "friends", label: "მეგობრები" }
  ]

  return (
    <div>
      {/* ზედა ნაწილი: cover + ავატარი + სახელი */}
      <div className="bg-white shadow-[0_1px_2px_rgba(0,0,0,.1)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="relative h-[200px] sm:h-[350px] md:h-[400px] rounded-b-lg overflow-hidden bg-gradient-to-b from-gray-300 to-gray-400">
            {profile.CoverPicture && <img src={fileUrl(profile.CoverPicture)} alt="" className="w-full h-full object-cover" />}
            {isMe && (
              <>
                <button
                  onClick={() => coverInput.current?.click()}
                  disabled={!!uploading}
                  className="absolute bottom-4 right-4 h-9 px-3 rounded-md bg-white hover:bg-gray-100 text-[15px] font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <CameraIcon className="w-4 h-4" />
                  {uploading === "cover" ? "იტვირთება..." : "ქავერ ფოტოს შეცვლა"}
                </button>
                <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => uploadImage("cover", e)} />
              </>
            )}
          </div>

          <div className="px-4 md:px-8 pb-4 flex flex-col md:flex-row md:items-end gap-4 border-b border-gray-300">
            <div className="relative -mt-20 md:-mt-8 self-center md:self-auto">
              <span className="block rounded-full border-4 border-white bg-white">
                <Avatar user={profile} size={168} online={!isMe && isOnline(profile)} />
              </span>
              {isMe && (
                <>
                  <button
                    onClick={() => avatarInput.current?.click()}
                    disabled={!!uploading}
                    className="absolute bottom-3 right-2 w-9 h-9 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] flex items-center justify-center cursor-pointer"
                    aria-label="პროფილის სურათის შეცვლა"
                  >
                    <CameraIcon className="w-5 h-5" />
                  </button>
                  <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => uploadImage("avatar", e)} />
                </>
              )}
            </div>

            <div className="flex-1 text-center md:text-left md:pb-2">
              <h1 className="text-[32px] font-bold text-gray-900 leading-tight">{fullName(profile)}</h1>
              <p className="text-[15px] text-gray-500 font-semibold">
                {relation.friendsCount} მეგობარი
                {" · "}
                <button onClick={() => setListModal("followers")} className="hover:underline cursor-pointer">{relation.followersCount} გამომწერი</button>
                {" · "}
                <button onClick={() => setListModal("following")} className="hover:underline cursor-pointer">{relation.followingCount} გამოწერილი</button>
              </p>
              {profile.Bio && <p className="text-[15px] text-gray-700 mt-1">{profile.Bio}</p>}
            </div>

            <div className="flex justify-center md:pb-2">
              {isMe ? (
                <Link href="/settings" className="h-9 px-3 rounded-md bg-[#e4e6eb] hover:bg-[#d8dadf] text-gray-900 text-[15px] font-semibold flex items-center">
                  ✏️ პროფილის რედაქტირება
                </Link>
              ) : (
                <FriendshipActions userId={profile._id} relation={relation} onChange={load} />
              )}
            </div>
          </div>

          <nav className="px-4 md:px-8 flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative h-[60px] px-4 text-[15px] font-semibold cursor-pointer ${tab === t.key ? "text-[#1877f2]" : "text-gray-600 hover:bg-gray-100 rounded-md my-1 h-[52px]"}`}
              >
                {t.label}
                {tab === t.key && <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#1877f2] rounded-t" />}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* კონტენტი */}
      <div className="max-w-[1100px] mx-auto px-4 py-4">
        {tab === "posts" && (
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-[42%] md:sticky md:top-[72px] flex flex-col gap-4">
              <AboutCard profile={profile} />
              <FriendsGrid userId={profile._id} limit={9} onSeeAll={() => setTab("friends")} />
            </div>
            <div className="w-full md:flex-1 min-w-0">
              <PostList key={`${profile._id}-${contentVersion}`} url={`/posts/user/${profile._id}`} showComposer={isMe} />
            </div>
          </div>
        )}

        {tab === "photos" && (
          <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)] p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">ფოტოები</h2>
            <PhotoGrid
              key={`${profile._id}-${contentVersion}`}
              url={`/posts/photos/user/${profile._id}`}
              emptyText={isMe ? "ფოტოები ჯერ არ აგიტვირთავთ" : "ფოტოები ჯერ არ არის"}
            />
          </div>
        )}

        {tab === "about" && (
          <div className="max-w-[700px] mx-auto">
            <AboutCard profile={profile} detailed />
          </div>
        )}

        {tab === "friends" && <FriendsGrid userId={profile._id} />}
      </div>

      {listModal && (
        <UserListModal
          title={listModal === "followers" ? "გამომწერები" : "გამოწერილი"}
          url={`/friends/${listModal}/${profile._id}`}
          onClose={() => setListModal(null)}
        />
      )}
    </div>
  )
}

function AboutCard({ profile, detailed = false }: { profile: User; detailed?: boolean }) {
  const genderText = profile.Gender?.toLowerCase() === "female" ? "მდედრობითი" : profile.Gender?.toLowerCase() === "male" ? "მამრობითი" : profile.Gender

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)] p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-3">{detailed ? "შესახებ" : "შესავალი"}</h2>
      {profile.Bio && <p className="text-center text-[15px] text-gray-900 pb-3 mb-3 border-b border-gray-200">{profile.Bio}</p>}
      <ul className="flex flex-col gap-3 text-[15px] text-gray-900">
        {profile.BirthDate && <li>🎂 დაბადების თარიღი: <b>{formatDate(profile.BirthDate)}</b></li>}
        {genderText && <li>👤 სქესი: <b>{genderText}</b></li>}
        {detailed && profile.Email && <li>✉️ Email: <b>{profile.Email}</b></li>}
        <li>🕒 Facebook-ზეა <b>{formatDate(profile.createdAt)}</b>-დან</li>
      </ul>
    </div>
  )
}
