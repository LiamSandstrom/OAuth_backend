import { Provider, User } from "../generated/prisma/client.js";
import { AccountProviderInput } from "../types/index.js";
import { prisma } from "./client.js";

export const createUserWithAccount = async (account: AccountProviderInput, email?: string): Promise<User | undefined> => {
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
