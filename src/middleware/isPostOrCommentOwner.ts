
import { NextFunction, Request, Response } from "express";
import { getPostById } from "../repos/postRepository.js";
import { getCommentById } from "../repos/commentsRepository.js";

export const isPostOrCommentOwner = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const postId = Number(req.params.id)
    const commentId = Number(req.params.commentId)

    const post = await getPostById(postId)
    if (!post) return res.status(404).json({ message: "Not found" })

    const comment = await getCommentById(commentId)
    if (!comment || comment.postId !== postId) return res.status(404).json({ message: "Not found" })

    if (post.userId !== userId && comment.userId !== userId) return res.status(403).json({ message: "Forbidden" })

    next()
}
