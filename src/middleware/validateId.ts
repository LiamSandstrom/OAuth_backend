import { NextFunction, Request, Response } from "express";

export const validateId = (req: Request, res: Response, next: NextFunction) => {
    console.log("valId")
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" })
    next()
}
