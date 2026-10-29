import { NextFunction, Request, Response } from "express"

export const verifyApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = process.env.ADMIN_API_KEY
    const token = req.headers.authorization?.split(" ")[1]
    if (!apiKey || token !== apiKey) return res.status(401).json({ message: "Unauthorized" })
    next()
}
