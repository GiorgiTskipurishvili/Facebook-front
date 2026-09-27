import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_PAGES = ["/login", "/register"]

// ოპტიმისტური შემოწმება cookie-ით: ტოკენის სისწორეს server ამოწმებს (/auth/me)
export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has("accessToken")
  const isAuthPage = AUTH_PAGES.includes(request.nextUrl.pathname)

  if (!hasToken && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  return NextResponse.next()
}

export const config = {
  // სტატიკური ფაილები და Next-ის შიდა მისამართები არ გვაინტერესებს
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)"]
}
