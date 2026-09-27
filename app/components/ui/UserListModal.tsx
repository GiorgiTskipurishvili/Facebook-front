"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/app/lib/api"
import type { UserPreview } from "@/app/lib/types"
import { fullName } from "@/app/lib/utils"
import Modal from "./Modal"
import Avatar from "./Avatar"
import Spinner from "./Spinner"

interface Props {
  title: string
  url: string // endpoint, რომელიც { data: UserPreview[] } აბრუნებს
  onClose: () => void
}

export default function UserListModal({ title, url, onClose }: Props) {
  const [users, setUsers] = useState<UserPreview[] | null>(null)

  useEffect(() => {
    api.get(url)
      .then((res) => setUsers(res.data.data))
      .catch(() => setUsers([]))
  }, [url])

  return (
    <Modal title={title} onClose={onClose} width="max-w-[550px]">
      <div className="p-2 min-h-[200px]">
        {users === null ? (
          <Spinner />
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 py-10">სია ცარიელია</p>
        ) : (
          users.map((u) => (
            <Link
              key={u._id}
              href={`/profile/${u._id}`}
              onClick={onClose}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <Avatar user={u} size={40} />
              <span className="font-semibold text-[15px] text-gray-900">{fullName(u)}</span>
            </Link>
          ))
        )}
      </div>
    </Modal>
  )
}
