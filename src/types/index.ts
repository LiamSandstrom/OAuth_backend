import { Account, Prisma, User } from "../generated/prisma/client.js";

export type AccountProviderInput = Pick<Prisma.AccountUncheckedCreateInput, 'provider' | 'providerId'>
export type AccountWithUser = Account & { user: User }
