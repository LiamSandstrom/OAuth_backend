import { Router } from "express"
import passport from "passport"
import jwt from "jsonwebtoken"
import { User } from "../generated/prisma/client.js"

export const authRouter = Router()

authRouter.get("/google", passport.authenticate("google", { scope: ["email", "profile"] }))

authRouter.get("/google/callback",
    passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }),
    (req, res) => {
        const token = jwt.sign(
            { id: (req.user as User).id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        )
        res.json({ token })
    })

authRouter.get("/failure", (req, res) => {
    res.json({
        message: "Something went wrong :("
    })
})
