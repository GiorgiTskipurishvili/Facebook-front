"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import api, { getErrorMessage } from "@/app/lib/api"
import { useAuth, useCurrentUser } from "@/app/context/AuthContext"
import { passwordSchema, profileSchema } from "@/app/(pages)/validators/settings"

const input = "w-full h-11 px-3 border border-gray-300 rounded-md text-[15px] text-gray-900 outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] bg-white"
const label = "block text-sm font-semibold text-gray-700 mb-1"
const errorText = "text-red-500 text-sm mt-1"

export default function SettingsPage() {
  return (
    <main className="max-w-[680px] mx-auto py-6 px-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-900">პარამეტრები</h1>
      <ProfileForm />
      <PasswordForm />
      <DeleteAccount />
    </main>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,.2)] p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Status({ message }: { message: { ok: boolean; text: string } | null }) {
  if (!message) return null
  return <p className={`text-sm ${message.ok ? "text-green-600" : "text-red-500"}`}>{message.text}</p>
}

function ProfileForm() {
  const user = useCurrentUser()
  const { setUser } = useAuth()
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      FirstName: user.FirstName,
      LastName: user.LastName,
      BirthDate: user.BirthDate ? user.BirthDate.slice(0, 10) : "",
      Gender: user.Gender as "Male" | "Female",
      Bio: user.Bio || ""
    }
  })

  async function onSubmit(data: object) {
    setStatus(null)
    try {
      const res = await api.put("/users/me", data)
      setUser(res.data.data)
      setStatus({ ok: true, text: "პროფილი განახლდა ✓" })
    } catch (err) {
      setStatus({ ok: false, text: getErrorMessage(err) })
    }
  }

  return (
    <Card title="პროფილის ინფორმაცია">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={label}>სახელი</label>
            <input {...register("FirstName")} className={input} />
            {errors.FirstName && <p className={errorText}>{errors.FirstName.message}</p>}
          </div>
          <div>
            <label className={label}>გვარი</label>
            <input {...register("LastName")} className={input} />
            {errors.LastName && <p className={errorText}>{errors.LastName.message}</p>}
          </div>
          <div>
            <label className={label}>დაბადების თარიღი</label>
            <input type="date" {...register("BirthDate")} className={input} />
            {errors.BirthDate && <p className={errorText}>{errors.BirthDate.message}</p>}
          </div>
          <div>
            <label className={label}>სქესი</label>
            <select {...register("Gender")} className={input}>
              <option value="Male">მამრობითი</option>
              <option value="Female">მდედრობითი</option>
            </select>
            {errors.Gender && <p className={errorText}>{errors.Gender.message}</p>}
          </div>
        </div>
        <div>
          <label className={label}>ბიო</label>
          <textarea {...register("Bio")} rows={3} placeholder="მოკლედ თქვენს შესახებ..." className={`${input} h-auto py-2 resize-none`} />
          {errors.Bio && <p className={errorText}>{errors.Bio.message}</p>}
        </div>
        <p className="text-sm text-gray-500">Email: <b>{user.Email}</b></p>
        <div className="flex items-center gap-3">
          <button disabled={isSubmitting} className="h-9 px-4 rounded-md bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-[15px] cursor-pointer disabled:opacity-60">
            {isSubmitting ? "ინახება..." : "შენახვა"}
          </button>
          <Status message={status} />
        </div>
      </form>
    </Card>
  )
}

function PasswordForm() {
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(passwordSchema)
  })

  async function onSubmit(data: { currentPassword: string; newPassword: string }) {
    setStatus(null)
    try {
      await api.put("/users/me/password", { currentPassword: data.currentPassword, newPassword: data.newPassword })
      reset()
      setStatus({ ok: true, text: "პაროლი შეიცვალა ✓" })
    } catch (err) {
      setStatus({ ok: false, text: getErrorMessage(err) })
    }
  }

  return (
    <Card title="პაროლის შეცვლა">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className={label}>მიმდინარე პაროლი</label>
          <input type="password" {...register("currentPassword")} className={input} />
          {errors.currentPassword && <p className={errorText}>{errors.currentPassword.message}</p>}
        </div>
        <div>
          <label className={label}>ახალი პაროლი</label>
          <input type="password" {...register("newPassword")} className={input} />
          {errors.newPassword && <p className={errorText}>{errors.newPassword.message}</p>}
        </div>
        <div>
          <label className={label}>გაიმეორეთ ახალი პაროლი</label>
          <input type="password" {...register("confirmPassword")} className={input} />
          {errors.confirmPassword && <p className={errorText}>{errors.confirmPassword.message}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button disabled={isSubmitting} className="h-9 px-4 rounded-md bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-[15px] cursor-pointer disabled:opacity-60">
            პაროლის შეცვლა
          </button>
          <Status message={status} />
        </div>
      </form>
    </Card>
  )
}

function DeleteAccount() {
  const { logout } = useAuth()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState(false)

  async function remove(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    if (!confirm("ანგარიში და ყველა თქვენი მონაცემი (პოსტები, კომენტარები, მიმოწერა) სამუდამოდ წაიშლება. გავაგრძელო?")) return

    setDeleting(true)
    setError("")
    try {
      await api.delete("/users/me", { data: { Password: password } })
      logout()
    } catch (err) {
      setError(getErrorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <Card title="ანგარიშის წაშლა">
      <p className="text-[15px] text-gray-600 mb-3">
        ანგარიშის წაშლა შეუქცევადია. წაიშლება თქვენი პოსტები, კომენტარები, სთორები, მიმოწერა და მეგობრობები.
      </p>
      <form onSubmit={remove} className="flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="დაადასტურეთ პაროლით"
          className={`${input} sm:flex-1`}
        />
        <button disabled={deleting || !password} className="h-11 px-4 rounded-md bg-[#e41e3f] hover:bg-[#c8102e] text-white font-semibold text-[15px] cursor-pointer disabled:opacity-60">
          {deleting ? "იშლება..." : "ანგარიშის წაშლა"}
        </button>
      </form>
      {error && <p className={errorText}>{error}</p>}
    </Card>
  )
}
