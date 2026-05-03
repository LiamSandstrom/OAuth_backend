import { NextFunction, Request, Response } from "express";
import { getCommentById } from "../repos/commentsRepository.js";

export const isCommentOwner = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const commentId = Number(req.params.commentId)

    try {
        const comment = await getCommentById(commentId)
        if (!comment) return res.status(404).json({ message: "Comment not found" })
        if (comment.userId !== userId) return res.status(403).json({ message: "Forbidden" })

        next()
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}
