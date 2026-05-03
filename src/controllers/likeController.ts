import { Request, Response } from "express";
import { getLikesByPostId, likePostByIds, removeLikeByIds } from "../repos/likeRepository.js";

export const getAllLikesOnPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)

    try {
        const result = await getLikesByPostId(postId)
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        console.log(ex)
        return res.status(500).json({ message: "Internal server error" })
    }

}

export const LikePost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)
    const userId = req.user!.id

    try {
        const result = await likePostByIds(postId, userId)
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        console.log(ex)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const removeLike = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)
    const userId = req.user!.id

    try {
        const result = await removeLikeByIds(postId, userId)
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        console.log(ex)
        return res.status(500).json({ message: "Internal server error" })
    }
}

