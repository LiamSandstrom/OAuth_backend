import { PostCreateInput, PostUpdateInput } from "../generated/prisma/models.js";
import { prisma } from "./client.js";



export const createPost = (post: PostCreateInput) => {
    return prisma.post.create({
        data: post
    })
}

export const getPostFromId = (id: number) => {
    return prisma.post.findUnique({
        where: {
            id
        }
    })
}

export const getAllPostsDb = () => {
    return prisma.post.findMany()
}

export const updatePostFromId = (id: number, data: PostUpdateInput) => {
    return prisma.post.update({
        where: { id },
        data
    })
}

export const getPostByIdAndUserId = (postId: number, userId: number) => {
    return prisma.post.findFirst({
        where: { id: postId, userId }
    })
}

export const deletePostById = (id: number) => {
    return prisma.post.delete({
        where: { id }
    })
}
