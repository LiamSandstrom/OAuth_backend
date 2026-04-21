import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"

export const VerifyToken = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.cookies)
    const token = req.cookies.jwt_token
    if (!token) return res.status(401).json({ authenticated: false })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        req.user = decoded
        next();
    }
    catch {
        return res.status(401).json({ authenticated: false, error: "invalid token" })
    }
}
