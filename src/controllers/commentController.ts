import { Request, Response } from "express";
import { createComment, deleteComment, getAllCommentsDb, getAllCommentsOnPostDb, getCommentOnPostById, updateCommentFromId } from "../repos/commentsRepository.js";
import { CommentUncheckedCreateInput } from "../generated/prisma/models.js";
import { CreateCommentDto } from "../validation/validateComment.js";
import { toNum } from "../helpers/toNum.js";

export const getAllComments = async (req: Request, res: Response) => {
    const id = toNum(req.query.id)
    const text = typeof req.query.text === "string" ? req.query.text : undefined

    const result = await getAllCommentsDb(id, text)
    return res.json(result)
}

export const getAllCommentsOnPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)

    const result = await getAllCommentsOnPostDb(postId)
    return res.json(result)
}

export const getCommentOnPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)
    const commentId = Number(req.params.commentId)

    const result = await getCommentOnPostById(postId, commentId)
    if (!result) return res.status(404).json({ message: "Not found" })
    return res.json(result)
}

export const createCommentOnPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id)
    const user = req.user!
    const body = req.body as CreateCommentDto

    const comment: CommentUncheckedCreateInput = {
        text: body.text,
        postId,
        userId: user.id
    }

    const result = await createComment(comment)
    return res.json(result)
}

export const deleteCommentOnPost = async (req: Request, res: Response) => {
    const commentId = Number(req.params.commentId)

    await deleteComment(commentId)
    return res.json({ message: "Deleted Comment" })
}

export const editCommentOnPost = async (req: Request, res: Response) => {
    const commentId = Number(req.params.commentId)
    const comment = req.body as CreateCommentDto

    const result = await updateCommentFromId(commentId, comment)
    return res.json(result)
}
