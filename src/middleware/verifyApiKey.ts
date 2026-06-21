import { NextFunction, Request, Response } from "express";

export const verifyApiKey = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]
    if (token !== process.env.ADMIN_API_KEY) return res.status(401).json({ message: "Unauthorized" })
    console.log("Passed API key check")
    next()
}
