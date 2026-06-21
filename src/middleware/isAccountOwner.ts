import { NextFunction, Request, Response } from "express";
import { getAccountByIdAndUserId } from "../repos/userRepository.js";
import { Role } from "../generated/prisma/enums.js";

export const isAccountOwnerOrAuthor = async (req: Request, res: Response, next: NextFunction) => {
    const accountId = Number(req.params.id)
    const userId = req.user!.id

    if (req.user!.role === Role.AUTHOR) next();

    try {
        const found = await getAccountByIdAndUserId(accountId, userId)
        if (!found) return res.status(401).json({ message: "Unauthorized" })

        next()
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}
