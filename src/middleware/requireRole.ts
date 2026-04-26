import { NextFunction, Request, Response } from "express";
import { Role } from "../generated/prisma/enums.js";

export const requireRole = (role: Role) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" })
    if (req.user.role !== role) return res.status(403).json({ message: "Forbidden" })
    next()
}
