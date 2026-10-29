import { Request, Response } from "express";
import { getLikesByPostId, likePostByIds, removeLikeByIds } from "../repos/likeRepository.js";

export const getAllLikesOnPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)

    const result = await getLikesByPostId(postId)
    return res.json(result)
}

export const likePost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)
    const userId = req.user!.id

    const result = await likePostByIds(postId, userId)
    return res.json(result)
}

export const removeLike = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)
    const userId = req.user!.id

    const result = await removeLikeByIds(postId, userId)
    return res.json(result)
}
