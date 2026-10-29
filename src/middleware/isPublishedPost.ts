import { NextFunction, Request, Response } from "express";
import { getPostById } from "../repos/postRepository.js";

export const isPublishedPost = async (req: Request, res: Response, next: NextFunction) => {
    const postId = Number(req.params.id)

    const post = await getPostById(postId)
    if (!post) return res.status(404).json({ message: "Post not found" })

    next()
}
