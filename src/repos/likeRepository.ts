import { prisma } from "./client.js"


export const getLikesByPostId = (postId: number) => {
    return prisma.userLikedPost.count({
        where: { postId }
    })
}

export const likePostByIds = (postId: number, userId: number) => {
    return prisma.userLikedPost.create({
        data: {
            postId,
            userId
        }
    })
}

export const removeLikeByIds = (postId: number, userId: number) => {
    return prisma.userLikedPost.delete({
        where: {
            userId_postId: {
                userId,
                postId
            }
        }
    })
}
