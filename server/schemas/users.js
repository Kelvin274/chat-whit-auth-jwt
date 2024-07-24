import { z } from 'zod'

const userSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
      invalid_type_error: 'Username must be a string'
    })
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string({
      required_error: 'Password is required'
    })
    .min(6, 'Password must be at least 6 characters'),
  email: z
    .string({
      required_error: 'Email is required'
    })
    .email({
      message: 'Invalid format of mail'
    })
})

export function validUser(user) {
  return userSchema.safeParse(user)
}

export function validPartialUser(user) {
  return userSchema.partial().safeParse(user)
}
