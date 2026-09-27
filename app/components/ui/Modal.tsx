"use client"
import { useEffect } from "react"
import { CloseIcon } from "@/app/icons/UiIcons"

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: string
}

export default function Modal({ title, onClose, children, width = "max-w-[500px]" }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] bg-white/70 flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${width} bg-white rounded-lg shadow-[0_12px_28px_rgba(0,0,0,.2),0_2px_4px_rgba(0,0,0,.1)] max-h-[90vh] flex flex-col`}>
        <div className="relative h-15 flex items-center justify-center border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="absolute right-4 w-9 h-9 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] flex items-center justify-center cursor-pointer"
            aria-label="დახურვა"
          >
            <CloseIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
