import { NextFunction, Request, Response } from "express";

export const validateId = (idName = "id") => (req: Request, res: Response, next: NextFunction) => {
    console.log(`Val id on ${idName}`)
    const id = Number(req.params[idName])
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" })
    next()
}
