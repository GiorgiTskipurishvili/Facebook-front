interface Props {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  badge?: number
  label: string
}

// header-ის მრგვალი ღილაკი (Messenger, შეტყობინებები, მენიუ) badge-ით
export default function HeaderIconButton({ children, onClick, active = false, badge = 0, label }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative w-10 h-10 flex items-center justify-center cursor-pointer rounded-full transition ${active ? "bg-[#ebf5ff] text-[#1877f2]" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}`}
    >
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full bg-[#e41e3f] text-white text-[12px] font-bold flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  )
}
