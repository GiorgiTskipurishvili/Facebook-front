import type { UserPreview } from "./types"

export function fullName(user?: Pick<UserPreview, "FirstName" | "LastName"> | null) {
  if (!user) return "Facebook მომხმარებელი"
  return `${user.FirstName} ${user.LastName}`
}

// "5 წთ", "3 სთ", "2 დღე" ...
export function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return "ახლახანს"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} წთ`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} სთ`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} დღე`
  if (days < 30) return `${Math.floor(days / 7)} კვ`

  return new Date(date).toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" })
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" })
}

export function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" })
}
