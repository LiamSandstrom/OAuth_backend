import { AccountProviderInput } from "../types/index.js";
import { prisma } from "./client.js";

export const createUserWithAccount = (account: AccountProviderInput, email?: string) => {
    return prisma.user.create({
        data: {
            email,
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

export const getUser = (id: number) => {
    return prisma.user.findUnique({
        where: { id }
    })
}
