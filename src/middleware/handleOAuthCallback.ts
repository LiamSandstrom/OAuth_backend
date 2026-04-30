import { NextFunction, Request, Response } from "express"
import passport from "passport"
import jwt from "jsonwebtoken"
import { User } from "../generated/prisma/client.js"

export const handleOAuthCallback = (provider: string) => (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(provider, { session: false }, (err: Error | null, user: User | false, info: { message: string } | undefined) => {
        if (err) return next(err)
        if (!user) {
            const msg = encodeURIComponent(info?.message || "Something went wrong")
            return res.redirect(`/auth/failure?message=${msg}`)
        }
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        )
        res.cookie("jwt_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax"
        })
        res.redirect("/users/protected")
    })(req, res, next)
}
