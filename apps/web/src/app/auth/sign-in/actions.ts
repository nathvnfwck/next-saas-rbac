'use server'

import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { flattenError, z } from 'zod'

import { signInWithPassword } from '@/http/sign-in-with-password'

const signInSchema = z.object({
  email: z.email({ message: 'Please, provide a valid e-mail address.' }),
  password: z.string().min(1, { message: 'Please, provide your password.' }),
})

export async function signInWithEmailAndPassword(data: FormData) {
  const response = signInSchema.safeParse(Object.fromEntries(data))

  if (!response.success) {
    const errors = flattenError(response.error).fieldErrors

    return { success: false, message: null, errors }
  }

  const { email, password } = response.data

  try {
    const { token } = await signInWithPassword({
      email,
      password,
    })
    const cookie = await cookies()

    cookie.set('token', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()

      return { success: false, message, errors: null }
    }

    console.error(err)

    return {
      success: false,
      message: 'Unexpected error, try again in a few minutes.',
      errors: null,
    }
  }

  return { success: true, message: null, errors: null }
}
