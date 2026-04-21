import { PostCreateInput } from "../generated/prisma/models.js";
import { prisma } from "./client.js";



export const createPost = async (post: PostCreateInput) => {
    return await prisma.post.create({
        data: post
    })
}

export const getPostFromId = async (id: number) => {
    return await prisma.post.findUnique({
        where: {
            id
        }
    })
}

export const getAllPosts = async () => {
    return await prisma.post.findMany()
}

