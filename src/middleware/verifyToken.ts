import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import z from "zod";
import { Role } from "../generated/prisma/enums.js";

const JwtPayloadSchema = z.object({
    id: z.number(),
    role: z.enum(Object.values(Role) as [string, ...string[]]).transform(r => r as Role)
})

export const VerifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt_token
    if (!token) return res.status(401).json({ authenticated: false })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)

        const result = JwtPayloadSchema.safeParse(decoded)
        if (!result.success) return res.status(401).json({ authenticated: false })

        req.user = result.data
        next();
    }
    catch {
        return res.status(401).json({ authenticated: false, error: "invalid token" })
    }
}
