import { rateLimit } from "express-rate-limit"

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests, try again later" }
})

export const feedbackLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    keyGenerator: req => (req.user ? String(req.user.id) : "admin"),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many feedback requests, try again later" }
})
