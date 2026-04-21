import { AccountProviderInput } from "../types/index.js";
import { prisma } from "./client.js";

export const createUserWithAccount = async (account: AccountProviderInput, email?: string) => {
    return await prisma.user.create({
        data: {
            email,
            accounts: {
                create: account
            }
        }
    })
}

export const getAccountWithUser = async (account: AccountProviderInput) => {
    return await prisma.account.findFirst({
        where: {
            provider: account.provider,
            providerId: account.providerId
        },
        include: {
            user: true
        }
    })
}
