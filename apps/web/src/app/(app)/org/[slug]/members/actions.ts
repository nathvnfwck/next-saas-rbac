'use server'

import { Role, roleSchema } from '@saas/auth'
import { HTTPError } from 'ky'
import { revalidateTag } from 'next/cache'
import { flattenError, z } from 'zod'

import { getCurrentOrganization } from '@/auth/auth'
import { createInvite } from '@/http/create-invite'
import { removeMember } from '@/http/remove-member'
import { revokeInvite } from '@/http/revoke-invite'
import { updateMember } from '@/http/update-member'

const inviteSchema = z.object({
  email: z.email({ message: 'Invalid e-mail address.' }),
  role: roleSchema,
})

export async function createInviteAction(data: FormData) {
  const currentOrganization = await getCurrentOrganization()
  const response = inviteSchema.safeParse(Object.fromEntries(data))

  if (!response.success) {
    const errors = flattenError(response.error).fieldErrors

    return { success: false, message: null, errors }
  }

  const { email, role } = response.data

  try {
    await createInvite({
      org: currentOrganization!,
      email,
      role,
    })

    revalidateTag(`${currentOrganization}/invites`)
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

  return {
    success: true,
    message: 'Successfully created the invite.',
    errors: null,
  }
}

export async function removeMemberAction(memberId: string) {
  const currentOrganization = await getCurrentOrganization()

  await removeMember({
    org: currentOrganization!,
    memberId,
  })

  revalidateTag(`${currentOrganization}/members`)
}

export async function updateMemberAction(memberId: string, role: Role) {
  const currentOrganization = await getCurrentOrganization()

  await updateMember({
    org: currentOrganization!,
    memberId,
    role,
  })

  revalidateTag(`${currentOrganization}/members`)
}

export async function revokeInviteAction(inviteId: string) {
  const currentOrganization = await getCurrentOrganization()

  await revokeInvite({
    org: currentOrganization!,
    inviteId,
  })

  revalidateTag(`${currentOrganization}/invites`)
}
