import { Role } from "../generated/prisma/enums.js"

export const isAdminEmail = (email: string | null) =>
    !!email && email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()

export const roleForEmail = (email: string | null) => (isAdminEmail(email) ? Role.AUTHOR : Role.USER)
