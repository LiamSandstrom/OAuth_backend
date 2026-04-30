import { Request } from "express"
import type { VerifyCallback } from "passport-oauth2"
import { AccountProviderInput } from "../types/index.js"
import { createUserWithAccount, getAccountWithUser, getUserWithEmail, linkAccountToUser } from "../repos/userRepository.js"
import { Provider } from "../generated/prisma/enums.js"

export const oauthVerify = async (
    req: Request,
    profile: { id: string; provider: string; emails?: { value: string }[] },
    done: VerifyCallback) => {
    try {
        const accountInput: AccountProviderInput = {
            provider: profile.provider as Provider,
            providerId: profile.id
        }

        if (req.user) {
            const existing = await getAccountWithUser(accountInput)
            if (existing && existing.user.id === req.user.id) return done(null, false, { message: `${profile.provider} already linked to your account.` })
            if (existing) return done(null, false, { message: `${profile.provider} account already linked to another user.` })

            // link account to existing account
            await linkAccountToUser(accountInput, req.user.id)
            return done(null, req.user)
        }

        // account exists? login
        const account = await getAccountWithUser(accountInput)
        if (account) return done(null, account.user)

        //oauth email found?
        const userEmail = profile.emails?.[0]?.value
        if (!userEmail) return done(null, false, { message: `No email on ${profile.provider} account. Make email public or use different provider.` })


        // account dosint exist but oauth email is the same as alrdy existing account?
        const existingUser = await getUserWithEmail(userEmail)
        if (existingUser) return done(null, false, { message: "Email already linked to an account. Log in first to link." })

        const user = await createUserWithAccount(accountInput, userEmail)
        return done(null, user)
    } catch (err) {
        return done(err)
    }

}
