import { MessengerIcon } from "@/app/icons/MessengerIcon"

export default function MessagesIndexPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-8">
      <span className="w-20 h-20 rounded-full bg-[#f0f2f5] flex items-center justify-center mb-4">
        <MessengerIcon className="w-10 h-10 text-gray-400" />
      </span>
      <h2 className="text-xl font-bold text-gray-900">აირჩიეთ საუბარი</h2>
      <p className="text-[15px] mt-1">აირჩიეთ არსებული ჩატი ან დაიწყეთ ახალი მეგობრის პროფილიდან.</p>
    </div>
  )
}
