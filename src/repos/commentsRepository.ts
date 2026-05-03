import { CommentUncheckedCreateInput } from "../generated/prisma/models.js"
import { CreateCommentDto } from "../validation/validateComment.js"
import { prisma } from "./client.js"


export const getAllCommentsOnPostDb = (postId: number) => {
    return prisma.comment.findMany({
        where: { postId }
    })
}

export const getCommentOnPostById = (postId: number, commentId: number) => {
    return prisma.comment.findUnique({
        where: {
            postId,
            id: commentId
        }
    })
}

export const createComment = (data: CommentUncheckedCreateInput) => {
    return prisma.comment.create({
        data
    })
}

export const deleteComment = (id: number) => {
    return prisma.comment.delete({
        where: { id }
    })
}

export const updateCommentFromId = (id: number, data: CreateCommentDto) => {
    return prisma.comment.update({
        where: { id },
        data
    })
}

export const getCommentByIdAndUserId = (commentId: number, userId: number) => {
    return prisma.comment.findUnique({
        where: { id: commentId, userId }
    })
}

export const getCommentById = (id: number) => {
    return prisma.comment.findUnique({
        where: { id }
    })
}
