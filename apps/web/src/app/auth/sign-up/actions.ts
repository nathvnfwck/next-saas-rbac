'use server'

import { HTTPError } from 'ky'
import { flattenError, z } from 'zod'

import { signUp } from '@/http/sign-up'

const signUpSchema = z
  .object({
    name: z.string().refine((value) => value.split(' ').length > 1, {
      error: 'Please, provide your full name.',
    }),
    email: z.email({ error: 'Please, provide a valid e-mail address.' }),
    password: z
      .string()
      .min(1, { error: 'Password should have at least 6 characters.' }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    error: 'Password confirmation does not match.',
    path: ['password_confirmation'],
  })

export async function signUpAction(data: FormData) {
  const response = signUpSchema.safeParse(Object.fromEntries(data))

  if (!response.success) {
    const errors = flattenError(response.error).fieldErrors

    return { success: false, message: null, errors }
  }

  const { name, email, password } = response.data

  try {
    await signUp({
      name,
      email,
      password,
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
