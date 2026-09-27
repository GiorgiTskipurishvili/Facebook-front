"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '../validators/register';
import Link from 'next/link';
import { setCookie } from "cookies-next/client"

import { useRouter } from 'next/navigation';
import api, { getErrorMessage, TOKEN_COOKIE } from '@/app/lib/api';

const inputClass = `
  w-full
  h-12
  px-4
  border
  border-gray-300
  rounded-md
  text-base
  text-gray-900
  outline-none
  focus:border-[#1877f2]
  focus:ring-1
  focus:ring-[#1877f2]
`

export default function Register() {

  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm({
    resolver: yupResolver(registerSchema)
  });

  const router = useRouter();
  const [serverError, setServerError] = useState("");

  async function onSubmit(data: object){
    setServerError("");
    try{
      // რეგისტრაციის შემდეგ server ტოკენს აბრუნებს -> პირდაპირ შევდივართ
      const response = await api.post('/auth/register', data);
      setCookie(TOKEN_COOKIE, response.data.token, {maxAge: 60*60*24*7})
      router.push('/');
      router.refresh();
    } catch(error){
      setServerError(getErrorMessage(error, "რეგისტრაცია ვერ მოხერხდა"));
    }
  }


  return (
    <main className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[432px]">

        <div className="text-center mb-5">
          <h1 className="text-[#1877f2] text-5xl font-bold">
            Facebook
          </h1>
        </div>


        <div className="bg-white rounded-lg shadow-md p-5">

          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800">
              Create a new account
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              It&apos;s quick and easy.
            </p>
          </div>

          <div className="h-px bg-gray-200 mb-5" />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  {...register("FirstName")}
                  className={inputClass}
                />

                {errors.FirstName?.message && (
                  <p className="text-red-500 text-sm mt-1 px-1">
                    {String(errors.FirstName.message)}
                  </p>
                )}
              </div>


              <div>
                <input
                  type="text"
                  placeholder="Last Name"
                  {...register("LastName")}
                  className={inputClass}
                />

                {errors.LastName?.message && (
                  <p className="text-red-500 text-sm mt-1 px-1">
                    {String(errors.LastName.message)}
                  </p>
                )}
              </div>
            </div>


            <div>
              <label className="block text-xs text-gray-500 mb-1 px-1">
                Birth Date
              </label>

              <input
                type="date"
                {...register("BirthDate")}
                className={inputClass}
              />

              {errors.BirthDate?.message && (
                <p className="text-red-500 text-sm mt-1 px-1">
                  {String(errors.BirthDate.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 px-1">
                Gender
              </label>

              <select
                {...register("Gender")}
                className={`${inputClass} bg-white`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              {errors.Gender?.message && (
                <p className="text-red-500 text-sm mt-1 px-1">
                  {String(errors.Gender.message)}
                </p>
              )}
            </div>


            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("Email")}
                className={inputClass}
              />

              {errors.Email?.message && (
                <p className="text-red-500 text-sm mt-1 px-1">
                  {String(errors.Email.message)}
                </p>
              )}
            </div>


            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("Password")}
                className={inputClass}
              />

              {errors.Password?.message && (
                <p className="text-red-500 text-sm mt-1 px-1">
                  {String(errors.Password.message)}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-red-500 text-sm text-center">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full
                h-12
                bg-[#42b72a]
                hover:bg-[#36a420]
                text-white
                rounded-md
                text-lg
                font-bold
                cursor-pointer
                transition
                mt-1
                disabled:opacity-60
              "
            >
              {isSubmitting ? "Creating..." : "Register"}
            </button>
          </form>


          <div className="text-center mt-5">
            <span className="text-gray-600 text-sm">
              Already have an account?{" "}
            </span>

            <Link
              href="/login"
              className="text-[#1877f2] text-sm font-medium hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-5 px-4">
          By creating an account, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  )
}
