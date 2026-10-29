import { NextFunction, Request, Response } from "express"

export const validateId =
    (idName = "id") =>
    (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params[idName])
        if (isNaN(id)) return res.status(400).json({ message: "Invalid id" })
        next()
    }
