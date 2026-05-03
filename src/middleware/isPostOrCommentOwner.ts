
import { NextFunction, Request, Response } from "express";
import { getPostById } from "../repos/postRepository.js";
import { getCommentById } from "../repos/commentsRepository.js";

export const isPostOrCommentOwner = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const postId = Number(req.params.id)
    const commentId = Number(req.params.commentId)

    try {
        const post = await getPostById(postId)
        if (!post) return res.status(404).json({ message: "Not Found" })

        const comment = await getCommentById(commentId)
        if (!comment) return res.status(404).json({ message: "Not Found" })

        if (post.userId !== userId && comment.userId !== userId) return res.status(403).json({ message: "Forbidden" })

        next()
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}
