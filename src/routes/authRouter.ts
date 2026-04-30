import { Router } from "express"
import passport from "passport"
import jwt from "jsonwebtoken"
import { User } from "../generated/prisma/client.js"

export const authRouter = Router()

authRouter.get("/google", passport.authenticate("google", { scope: ["email", "profile"] }))

authRouter.get("/google/callback", (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user: User | false, info) => {
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
})

authRouter.post("/logout", (req, res) => {
    res.clearCookie("jwt_token");
    res.json({ message: "Logout sucessful" })
})

authRouter.get("/failure", (req, res) => {
    const msg = req.query.message
    res.json({
        message: msg || "Something went wrong :("
    })
})
