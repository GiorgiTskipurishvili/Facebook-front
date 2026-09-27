import axios from "axios"
import { deleteCookie, getCookie } from "cookies-next/client"

const PRODUCTION_API_URL = "https://facebook-1-3jla.onrender.com"
const DEVELOPMENT_API_URL = "http://localhost:3030"

// NEXT_PUBLIC_API_URL-ს აქვს უპირატესობა; თუ არ არის: build (Vercel) -> Render, npm run dev -> localhost
// ბოლო "/" იშლება, რომ "/uploads/..." და "/auth/..." არ გახდეს "//uploads/..."
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? PRODUCTION_API_URL : DEVELOPMENT_API_URL)
).replace(/\/+$/, "")
export const TOKEN_COOKIE = "accessToken"

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = getCookie(TOKEN_COOKIE)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ტოკენს ვადა გაუვიდა ან არასწორია -> თავიდან login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.startsWith("/auth/login")
    if (error.response?.status === 401 && !isAuthRequest && typeof window !== "undefined") {
      deleteCookie(TOKEN_COOKIE)
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// სერვერის შეცდომის ტექსტი (server ყოველთვის { message } აბრუნებს)
export function getErrorMessage(error: unknown, fallback = "რაღაც შეცდომა მოხდა") {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback
  }
  return fallback
}

// "/uploads/123.png" -> სრული მისამართი
export function fileUrl(path?: string | null) {
  if (!path) return ""
  if (path.startsWith("http")) return path
  return `${API_URL}${path}`
}

export default api
