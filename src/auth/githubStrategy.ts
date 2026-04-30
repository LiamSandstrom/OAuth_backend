import passport from "passport"
import { Strategy as GitHubStrategy, Profile } from "passport-github2"
import { oauthVerify } from "./oauthVerify.js"
import type { VerifyCallback } from "passport-oauth2"
import { Request } from "express"

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: process.env.GITHUB_CALLBACK_URL!,
    passReqToCallback: true
}, (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) =>
    oauthVerify(req, profile, done)
))
