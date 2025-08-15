import { api } from './api-client'

interface SignUpWithPasswordRequest {
  name: string
  email: string
  password: string
}

type SignUpWithPasswordResponse = void

export async function signUp({
  name,
  email,
  password,
}: SignUpWithPasswordRequest): Promise<SignUpWithPasswordResponse> {
  await api.post('users', {
    json: {
      name,
      email,
      password,
    },
  })
}
