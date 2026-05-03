import { Request, Response } from "express";
import { createComment, deleteComment, getAllCommentsOnPostDb, getCommentOnPostById, updateCommentFromId } from "../repos/commentsRepository.js";
import { CommentCreateInput, CommentUncheckedCreateInput } from "../generated/prisma/models.js";
import { CreateCommentDto } from "../validation/validateComment.js";

export const getAllCommentsOnPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)
    try {
        const result = await getAllCommentsOnPostDb(postId)
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        console.log(ex)
        return res.status(500).json({ message: "Internal server error" })
    }

}

export const getCommentOnPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)
    const commentId = Number(req.params.commentId)

    try {
        const result = await getCommentOnPostById(postId, commentId)
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }

}

export const createCommentOnPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)
    const user = req.user!
    const body = req.body as CreateCommentDto

    try {
        const comment: CommentUncheckedCreateInput = {
            text: body.text,
            postId,
            userId: user.id
        }

        const result = await createComment(comment)
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }

}

export const deleteCommentOnPost = async (req: Request, res: Response) => {
    const commentId = Number(req.params.commentId)

    try {
        const result = await deleteComment(commentId)
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json({ message: "Deleted Comment" })
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }

}


export const editCommentOnPost = async (req: Request, res: Response) => {
    const commentId = Number(req.params.commentId)
    const comment = req.body as CreateCommentDto

    try {
        const result = await updateCommentFromId(commentId, comment)
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }

}
