import { defineAbilityFor } from '@saas/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getMembership } from '@/http/get-membership'
import { getProfile } from '@/http/get-profile'

export async function isAuthenticated() {
  const cookie = await cookies()

  return !!cookie.get('token')?.value
}

export async function getCurrentOrganization() {
  const cookie = await cookies()

  return cookie.get('org')?.value
}

export async function getCurrentMembership() {
  const org = await getCurrentOrganization()
  if (!org) {
    return null
  }

  const { membership } = await getMembership(org)
  return membership
}

export async function ability() {
  const membership = await getCurrentMembership()
  if (!membership) {
    return null
  }

  const ability = defineAbilityFor({
    id: membership.userId,
    role: membership.role,
  })

  return ability
}

export async function auth() {
  const cookie = await cookies()
  const token = cookie.get('token')?.value

  if (!token) {
    redirect('/auth/sign-in')
  }

  try {
    const { user } = await getProfile()

    return { user }
  } catch {}

  redirect('/api/auth/sign-out')
}
