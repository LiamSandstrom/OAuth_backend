import { NextFunction, Request, Response } from "express";
import { getAccountByIdAndUserId } from "../repos/userRepository.js";

export const isAccountOwner = async (req: Request, res: Response, next: NextFunction) => {
    console.log("isAccountOwner")
    const accountId = Number(req.params.id)
    const userId = req.user!.id

    try {
        const found = await getAccountByIdAndUserId(accountId, userId)
        if (!found) return res.status(401).json({ message: "Unauthorized" })

        next()
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}
