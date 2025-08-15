'use server'

import { HTTPError } from 'ky'
import { flattenError, z } from 'zod'

import { getCurrentOrganization } from '@/auth/auth'
import { createProject } from '@/http/create-project'

const projectSchema = z.object({
  name: z.string().min(4, 'Please, include at least 4 characters.'),
  description: z.string(),
})

export async function createProjectAction(data: FormData) {
  const response = projectSchema.safeParse(Object.fromEntries(data))

  if (!response.success) {
    const errors = flattenError(response.error).fieldErrors

    return { success: false, message: null, errors }
  }

  const { name, description } = response.data
  const organization = await getCurrentOrganization()

  try {
    await createProject({
      name,
      description,
      org: organization!,
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

  return {
    success: true,
    message: 'Successfully saved the project.',
    errors: null,
  }
}
