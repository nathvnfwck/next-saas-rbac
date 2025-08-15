import { z } from 'zod'

export const roleSchema = z.union([
  z.literal('MEMBER'),
  z.literal('ADMIN'),
  z.literal('BILLING'),
])

export type Role = z.infer<typeof roleSchema>
