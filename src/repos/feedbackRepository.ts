import { FeedbackType } from "../generated/prisma/enums.js"
import { prisma } from "./client.js"

export const getCachedFeedback = (postId: number, type: FeedbackType) => {
    return prisma.postFeedback.findUnique({
        where: { postId_type: { postId, type } }
    })
}

export const saveFeedback = (
    postId: number,
    type: FeedbackType,
    feedback: string,
    inputHash: string,
    lastCommentId: number | null
) => {
    return prisma.postFeedback.upsert({
        where: { postId_type: { postId, type } },
        create: { postId, type, feedback, inputHash, lastCommentId },
        update: { feedback, inputHash, lastCommentId, generatedAt: new Date() }
    })
}
