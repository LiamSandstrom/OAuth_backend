import { AccountProviderInput } from "../types/index.js"
import { UpdateUserDto } from "../validation/validateUser.js"
import { Role } from "../generated/prisma/enums.js"
import { prisma } from "./client.js"

export const createUserWithAccount = (account: AccountProviderInput, email: string, role: Role) => {
    return prisma.user.create({
        data: {
            email,
            role,
            accounts: {
                create: account
            }
        }
    })
}

export const getAccountWithUser = (account: AccountProviderInput) => {
    return prisma.account.findFirst({
        where: {
            provider: account.provider,
            providerId: account.providerId
        },
        include: {
            user: true
        }
    })
}

export const getUserWithEmail = (email: string) => {
    return prisma.user.findUnique({
        where: { email }
    })
}

export const getUserFromId = (id: number) => {
    return prisma.user.findUnique({
        where: { id }
    })
}

export const getAllUsersDb = () => {
    return prisma.user.findMany()
}

export const deleteUserFromId = (id: number) => {
    return prisma.user.delete({
        where: { id }
    })
}

export const deleteProviderFromId = (id: number) => {
    return prisma.account.delete({
        where: { id }
    })
}

export const getAccountByIdAndUserId = (accountId: number, userId: number) => {
    return prisma.account.findFirst({
        where: { id: accountId, userId }
    })
}

export const getUserWithAccounts = (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        include: {
            accounts: true
        }
    })
}

export const linkAccountToUser = (account: AccountProviderInput, userId: number) => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            accounts: {
                create: account
            }
        }
    })
}

export const getAllAccountsDb = () => {
    return prisma.account.findMany()
}

export const getAccountById = (id: number) => {
    return prisma.account.findUnique({
        where: { id }
    })
}

export const updateUserFromId = (id: number, data: UpdateUserDto) => {
    return prisma.user.update({
        where: { id },
        data
    })
}

export const updateUserRole = (id: number, role: Role) => {
    return prisma.user.update({
        where: { id },
        data: { role }
    })
}
