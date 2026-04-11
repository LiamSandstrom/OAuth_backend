import { Prisma } from "../generated/prisma/client.js";

export type AccountProviderInput = Pick<Prisma.AccountUncheckedCreateInput, 'provider' | 'providerId'>
