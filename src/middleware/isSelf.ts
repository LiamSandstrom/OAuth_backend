import { NextFunction, Request, Response } from "express";

export const isSelf = (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const userId = req.user!.id
    if (userId !== id) return res.status(403).json({ message: "Forbidden" })
    next()
}
