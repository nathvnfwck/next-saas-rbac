import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

import { signInWithGithub } from '@/http/sign-in-with-github'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { message: 'Github OAuth Code was not found.' },
      { status: 400 },
    )
  }

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.search = ''

  try {
    const { token } = await signInWithGithub({ code })
    const cookie = await cookies()

    cookie.set('token', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    redirectUrl.pathname = '/'
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()

      redirectUrl.pathname = '/auth/sign-in'
      redirectUrl.searchParams.set('error', message)
    }

    console.error(error)
  }

  return NextResponse.redirect(redirectUrl)
}
