import passport from 'passport'
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20'
import { createUserWithAccount, getAccountWithUser, getUserWithEmail } from '../repos/userRepository.js'
import { AccountProviderInput } from '../types/index.js'
import { Provider } from '../generated/prisma/enums.js'

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: 'http://localhost:3000/auth/google/callback',
},
    async (accessToken: string, refreshToken: string, profile: Profile, done) => {
        try {
            const accountInput: AccountProviderInput = {
                provider: profile.provider as Provider,
                providerId: profile.id
            }

            const account = await getAccountWithUser(accountInput)
            if (account) return done(null, account.user)

            const userEmail = profile.emails?.[0].value
            if (!userEmail) return done(null, false, { messsage: "Something went Wrong :(" })

            const existingUser = await getUserWithEmail(userEmail)
            if (existingUser) {
                return done(null, false, { message: "Email already linked to an account. Log in first to link." })
            }

            const user = await createUserWithAccount(accountInput, profile.emails?.[0].value)
            return done(null, user)
        } catch (err) {
            return done(err)
        }
    }))
