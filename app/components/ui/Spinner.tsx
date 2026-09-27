export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-6 ${className}`}>
      <div className="w-8 h-8 border-4 border-[#1877f2]/20 border-t-[#1877f2] rounded-full animate-spin" />
    </div>
  )
}
