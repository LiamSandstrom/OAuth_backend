
import { Role } from "../generated/prisma/enums.js";
import { z } from 'zod'

export const UserSchema = z.object({
    username: z.string().min(3).max(25),
    email: z.email(),
    role: z.enum(Object.values(Role) as [string, ...string[]]).transform(r => r as Role)
})

export const UpdateUserSchema = UserSchema.pick({ username: true, email: true }).partial().refine(
    obj => Object.keys(obj).length > 0,
    { message: "At least one field required" }
)

export const AdminUpdateUserSchema = UserSchema.partial().refine(
    obj => Object.keys(obj).length > 0,
    { message: "At least one field required" }
)

export type UserDto = z.infer<typeof UserSchema>
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>
export type AdminUpdateUserDto = z.infer<typeof AdminUpdateUserSchema>
