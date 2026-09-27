"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import {setCookie} from "cookies-next/client"

import { useRouter } from 'next/navigation';
import { loginSchema } from '../validators/login';
import api, { getErrorMessage, TOKEN_COOKIE } from '@/app/lib/api';

export default function Login() {

  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm({
    resolver: yupResolver(loginSchema)
  });

  const router = useRouter();
  const [serverError, setServerError] = useState("");

  async function onSubmit(data: { Email: string; Password: string }){
    setServerError("");
    try{
      const response = await api.post('/auth/login', data);
      // server ტოკენს აბრუნებს "token" ველში; ვადა 7 დღე (server-ის JWT-ის ვადის ტოლი)
      setCookie(TOKEN_COOKIE, response.data.token, {maxAge: 60*60*24*7})
      router.push('/');
      router.refresh();
    } catch(error){
      setServerError(getErrorMessage(error, "მომხმარებელი ვერ მოიძებნა ან პაროლი არასწორია"));
    }
  }


  return (
    <>
      {/* <div className='flex justify-center items-center h-screen text-white'>
        <form onSubmit={handleSubmit(onSubmit)} className='bg-black w-100 h-auto rounded-2xl p-4 flex flex-col gap-4'>
          <input type="email" placeholder="Email" className='border rounded-xl pl-4 text-white outline-none' {...register("Email")} />
          <p className='text-red-500'>{errors.Email?.message}</p>
          <input type="password" placeholder="Password" className='border rounded-xl pl-4 text-white outline-none' {...register("Password")} />
          <p className='text-red-500'>{errors.Password?.message}</p>
          <button type="submit" className='bg-blue-500 rounded-xl p-2'>Login</button>
          <div>
            <span>Do not have an account?</span>
            <Link href="/register" className='text-blue-500'>Register</Link>
          </div>
        </form>
      </div> */}

          <main className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-4">
      <div className="w-full max-w-[396px]">

        {/* Logo */}
        <div className="text-center mb-5">
          <h1 className="text-[#1877f2] text-5xl font-bold">
            Facebook
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-md p-4">

          <h2 className="text-center text-xl text-gray-600 mb-5">
            Log in to Facebook
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("Email")}
                className="
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
                "
              />

              {errors.Email?.message && (
                <p className="text-red-500 text-sm mt-1 px-1">
                  {String(errors.Email.message)}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("Password")}
                className="
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
                "
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full
                h-12
                bg-[#1877f2]
                hover:bg-[#166fe5]
                text-white
                rounded-md
                text-xl
                font-bold
                cursor-pointer
                transition
              "
            >
              Log In
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <Link
              href="#"
              className="text-[#1877f2] text-sm hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-300" />

            <span className="text-sm text-gray-500">
              or
            </span>

            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Register */}
          <div className="text-center">
            <Link
              href="/register"
              className="
                inline-block
                bg-[#42b72a]
                hover:bg-[#36a420]
                text-white
                px-5
                py-3
                rounded-md
                font-bold
                cursor-pointer
                transition
              "
            >
              Create new account
            </Link>
          </div>

        </div>
      </div>
    </main>
    </>
  )
}
