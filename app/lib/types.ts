export interface UserPreview {
  _id: string
  FirstName: string
  LastName: string
  ProfilePicture: string
  isOnline?: boolean
  lastSeen?: string
}

export interface User extends UserPreview {
  Email: string
  BirthDate: string
  Gender: string
  Bio: string
  CoverPicture: string
  friends: string[]
  followers: string[]
  following: string[]
  createdAt: string
}

export type FriendStatus = "self" | "friends" | "request_sent" | "request_received" | "none"

export interface Relation {
  friendStatus: FriendStatus
  requestId: string | null
  isFollowing: boolean
  friendsCount: number
  followersCount: number
  followingCount: number
}

export interface Post {
  _id: string
  desc: string
  image: string
  user: UserPreview
  likes: string[]
  likesCount: number
  likedByMe: boolean
  commentsCount: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  text: string
  user: UserPreview
  post: string
  replyTo: string | null
  likes: string[]
  createdAt: string
  updatedAt: string
}

export interface FriendRequest {
  _id: string
  sender: UserPreview
  receiver: UserPreview
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

export interface Suggestion extends UserPreview {
  mutualFriends: number
}

export interface Story {
  _id: string
  user: UserPreview
  image: string
  views: { user: string; viewedAt: string }[]
  expiresAt: string
  createdAt: string
}

export interface StoryView {
  user: UserPreview
  viewedAt: string
}

export interface Message {
  _id: string
  conversation: string
  sender: UserPreview
  text: string
  image: string
  seenBy: string[]
  createdAt: string
}

export interface Conversation {
  _id: string
  participants: UserPreview[]
  lastMessage: (Omit<Message, "sender"> & { sender: string }) | null
  unreadCount?: number
  updatedAt: string
}

export type NotificationType =
  | "post_like"
  | "post_comment"
  | "comment_reply"
  | "comment_like"
  | "friend_request"
  | "friend_accept"
  | "follow"

export interface AppNotification {
  _id: string
  sender: UserPreview
  type: NotificationType
  post: { _id: string; desc: string; image: string } | string | null
  comment: string | null
  isRead: boolean
  createdAt: string
}

export interface Paginated<T> {
  message: string
  data: T[]
  page: number
  hasMore: boolean
}
