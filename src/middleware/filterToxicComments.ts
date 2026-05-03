import { NextFunction, Request, Response } from "express";
import { profanity } from "@2toad/profanity";
import { CreateCommentDto } from "../validation/validateComment.js";

export const filterToxicComments = (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as CreateCommentDto
    if (profanity.exists(body.text)) return res.status(400).json({ message: "Inappropriate content" })

    next()
}
