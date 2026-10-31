import { z } from "zod"

export const UserSchema = z.object({
    username: z.string().min(3).max(25),
    email: z.email()
})

export const UpdateUserSchema = UserSchema.pick({ username: true, email: true })
    .partial()
    .refine(obj => Object.keys(obj).length > 0, { message: "At least one field required" })

export type UserDto = z.infer<typeof UserSchema>
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>
