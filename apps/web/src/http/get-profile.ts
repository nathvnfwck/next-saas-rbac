import { api } from './api-client'

interface GetProfileResponse {
  user: {
    id: string
    name?: string
    email: string
    avatarUrl: string
  }
}

export async function getProfile() {
  const response = await api.get('profile').json<GetProfileResponse>()

  return response
}
