import passport from "passport"
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20"
import { oauthVerify } from "./oauthVerify.js"
import type { VerifyCallback } from "passport-oauth2"
import { Request } from "express"

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            passReqToCallback: true
        },
        (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) =>
            oauthVerify(req, profile, done)
    )
)
