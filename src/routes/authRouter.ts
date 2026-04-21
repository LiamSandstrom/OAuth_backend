import { Router } from "express"
import passport from "passport"
import jwt from "jsonwebtoken"
import { User } from "../generated/prisma/client.js"

export const authRouter = Router()

authRouter.get("/google", passport.authenticate("google", { scope: ["email", "profile"] }))

authRouter.get("/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/auth/failure" }),
    (req, res) => {
        const token = jwt.sign(
            { id: (req.user as User).id },
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
    })

authRouter.get("/callback", (req, res) => {
})

authRouter.post("/logout", (req, res) => {
    res.clearCookie("jwt_token");
    res.json({ message: "Logout sucessful" })
})

authRouter.get("/failure", (req, res) => {
    res.json({
        message: "Something went wrong :("
    })
})
