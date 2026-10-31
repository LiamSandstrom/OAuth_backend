import { Post } from "../generated/prisma/client.js"
import { FeedbackType } from "../generated/prisma/enums.js"
import { getLikesByPostId } from "../repos/likeRepository.js"
import { countCommentsAfter, getAllCommentsOnPostDb } from "../repos/commentsRepository.js"
import { getCachedFeedback, saveFeedback } from "../repos/feedbackRepository.js"
import { feedbackInputHash, getDraftFeedback, getPublishedFeedback } from "./aiFeedback.js"

const NEW_COMMENTS_BEFORE_REFRESH = 3

export const getFeedbackForPost = async (post: Post) => {
    const type = post.published ? FeedbackType.published : FeedbackType.draft
    const inputHash = feedbackInputHash(type, post)

    const cached = await getCachedFeedback(post.id, type)
    if (cached && cached.inputHash === inputHash) {
        const newComments =
            type === FeedbackType.published ? await countCommentsAfter(post.id, cached.lastCommentId) : 0
        if (newComments < NEW_COMMENTS_BEFORE_REFRESH) {
            return { type, feedback: cached.feedback, cached: true, generatedAt: cached.generatedAt }
        }
    }

    let feedback: string
    let lastCommentId: number | null = null
    if (type === FeedbackType.draft) {
        feedback = await getDraftFeedback(post)
    } else {
        const likes = await getLikesByPostId(post.id)
        const comments = await getAllCommentsOnPostDb(post.id)
        if (comments.length > 0) lastCommentId = Math.max(...comments.map(c => c.id))
        feedback = await getPublishedFeedback(
            post,
            likes,
            comments.map(c => c.text)
        )
    }

    const saved = await saveFeedback(post.id, type, feedback, inputHash, lastCommentId)
    return { type, feedback, cached: false, generatedAt: saved.generatedAt }
}
