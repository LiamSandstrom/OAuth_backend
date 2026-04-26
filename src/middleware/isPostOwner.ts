
import { NextFunction, Request, Response } from "express";
import { getPostByIdAndUserId } from "../repos/postRepository.js";

export const isPostOwner = async (req: Request, res: Response, next: NextFunction) => {
    console.log("isPostOwner")
    const postId = Number(req.params.id)
    const userId = req.user!.id

    try {
        const found = await getPostByIdAndUserId(postId, userId)
        if (!found) return res.status(401).json({ message: "Unauthorized" })

        next()
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}
