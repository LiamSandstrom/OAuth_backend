import { PostCreateInput } from "../generated/prisma/models.js"
import { UpdatePostDto } from "../validation/validateCreatePost.js"
import { prisma } from "./client.js"

export const createPost = (post: PostCreateInput) => {
    return prisma.post.create({ data: post })
}

export const getPostById = (id: number, admin = false) => {
    return prisma.post.findFirst({
        where: { id, ...(!admin && { published: true }) }
    })
}

export const getAllPostsDb = (
    id: number | undefined,
    title: string | undefined,
    page: number | undefined,
    limit: number | undefined,
    comments: boolean | undefined,
    admin = false
) => {
    return prisma.post.findMany({
        where: {
            id,
            ...(!admin && { published: true }),
            title: title ? { contains: title, mode: "insensitive" } : undefined
        },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { comments }
    })
}

export const updatePostFromId = (id: number, data: UpdatePostDto) => {
    return prisma.post.update({ where: { id }, data })
}

export const deletePostById = (id: number) => {
    return prisma.post.delete({ where: { id } })
}
