"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon } from "@/app/icons/HomeIcon"
import { MessengerIcon } from "@/app/icons/MessengerIcon"
import { FriendsIcon, PhotoIcon } from "@/app/icons/UiIcons"
import SearchBox from "./SearchBox"
import MessengerDropdown from "./MessengerDropdown"
import NotificationsDropdown from "./NotificationsDropdown"
import ProfileMenu from "./ProfileMenu"

const NAV_ITEMS = [
  { href: "/", label: "მთავარი", Icon: HomeIcon },
  { href: "/friends", label: "მეგობრები", Icon: FriendsIcon },
  { href: "/photos", label: "ფოტოები", Icon: PhotoIcon },
  { href: "/messages", label: "Messenger", Icon: MessengerIcon }
]

export default function Header() {
  const pathname = usePathname()

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-40 bg-white h-14 shadow-[0_1px_2px_rgba(0,0,0,.1)] flex items-center px-4">
      <div className="flex flex-1 items-center">
        <SearchBox />
      </div>

      <nav className="hidden md:flex flex-1 justify-center h-full">
        <ul className="flex items-stretch h-full">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = isActive(href)
            return (
              <li key={href} className="relative flex items-center">
                <Link
                  href={href}
                  title={label}
                  aria-label={label}
                  className={`w-24 lg:w-28 h-12 flex items-center justify-center rounded-md transition ${active ? "text-[#1877f2]" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Icon className="w-6 h-6" />
                </Link>
                {active && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877f2] rounded-t" />}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="flex flex-1 justify-end items-center gap-2">
        <MessengerDropdown />
        <NotificationsDropdown />
        <ProfileMenu />
      </div>
    </header>
  )
}
