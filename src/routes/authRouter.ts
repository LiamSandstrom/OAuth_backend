import { Router } from "express"
import passport from "passport"
import { handleOAuthCallback } from "../middleware/handleOAuthCallback.js"

export const authRouter = Router()

authRouter.get("/google", passport.authenticate("google", { scope: ["email", "profile"] }))
authRouter.get("/github", passport.authenticate("github", { scope: ["user:email"] }))

authRouter.get("/google/callback", handleOAuthCallback("google"))
authRouter.get("/github/callback", handleOAuthCallback("github"))

authRouter.post("/logout", (req, res) => {
    res.clearCookie("jwt_token");
    res.json({ message: "Logout successful" })
})

//error msg in params as need redirect & send info
//i think session for just this is overkill so doing this
//cuz my errors are not sensitive i think its fine :O
authRouter.get("/failure", (req, res) => {
    const msg = req.query.message
    res.json({
        message: msg || "Something went wrong :("
    })
})
