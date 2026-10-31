import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"
import { adminHeader, authCookie, createComment, createPost, createUser, prisma } from "./helpers.js"
import { feedbackLimiter } from "../../src/middleware/rateLimit.js"
import { FeedbackUnavailableError, getDraftFeedback, getPublishedFeedback } from "../../src/services/aiFeedback.js"

vi.mock("../../src/services/aiFeedback.js", async importOriginal => ({
    ...(await importOriginal<typeof import("../../src/services/aiFeedback.js")>()),
    getDraftFeedback: vi.fn(),
    getPublishedFeedback: vi.fn()
}))

type User = Awaited<ReturnType<typeof createUser>>
let author: User, reader: User

beforeEach(async () => {
    vi.resetAllMocks()
    author = await createUser("AUTHOR")
    reader = await createUser()
    await feedbackLimiter.resetKey(String(author.id))
    await feedbackLimiter.resetKey("admin")
})

const feedback = (id: number, as?: User) => {
    const req = request(app).post(`/posts/${id}/feedback`)
    return as ? req.set("Cookie", authCookie(as)) : req
}

describe("POST /posts/:id/feedback", () => {
    it("requires login", async () => {
        const post = await createPost(author.id)
        expect((await feedback(post.id)).status).toBe(401)
    })

    it("is only for authors", async () => {
        const post = await createPost(reader.id)
        expect((await feedback(post.id, reader)).status).toBe(403)
    })

    it("404s on a missing post", async () => {
        expect((await feedback(9999, author)).status).toBe(404)
    })

    it("403s on someone else's post", async () => {
        const post = await createPost(reader.id)
        expect((await feedback(post.id, author)).status).toBe(403)
        expect(getDraftFeedback).not.toHaveBeenCalled()
        expect(getPublishedFeedback).not.toHaveBeenCalled()
    })

    it("gives draft feedback on an unpublished post, without likes or comments", async () => {
        const post = await createPost(author.id, { published: false })
        vi.mocked(getDraftFeedback).mockResolvedValue("Tighten the intro")

        const res = await feedback(post.id, author)
        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({ type: "draft", feedback: "Tighten the intro", cached: false })
        expect(getDraftFeedback).toHaveBeenCalledWith(
            expect.objectContaining({ title: post.title, content: post.content })
        )
        expect(getPublishedFeedback).not.toHaveBeenCalled()
    })

    it("sends likes and comment text, but no usernames, for a published post", async () => {
        const post = await createPost(author.id)
        await prisma.userLikedPost.create({ data: { postId: post.id, userId: reader.id } })
        await createComment(post.id, reader.id, "Great post")
        await createComment(post.id, reader.id, "Show a compose file")
        vi.mocked(getPublishedFeedback).mockResolvedValue("Readers want more examples")

        const res = await feedback(post.id, author)
        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({ type: "published", feedback: "Readers want more examples", cached: false })

        const [sentPost, likes, comments] = vi.mocked(getPublishedFeedback).mock.calls[0]
        expect(sentPost).toMatchObject({ title: post.title, content: post.content })
        expect(likes).toBe(1)
        expect([...comments].sort()).toEqual(["Great post", "Show a compose file"])
        expect(JSON.stringify(comments)).not.toContain(reader.username!)
        expect(getDraftFeedback).not.toHaveBeenCalled()
    })

    it("503s when the AI is unavailable", async () => {
        const post = await createPost(author.id, { published: false })
        vi.mocked(getDraftFeedback).mockRejectedValue(new FeedbackUnavailableError())

        const res = await feedback(post.id, author)
        expect(res.status).toBe(503)
        expect(res.body.message).toBe("Feedback is unavailable right now, try again later")
    })
})

describe("feedback cache", () => {
    const draftReply = () => vi.mocked(getDraftFeedback).mockResolvedValue("Draft tips")
    const publishedReply = () => vi.mocked(getPublishedFeedback).mockResolvedValue("Reader tips")

    it("reuses draft feedback while the post is unchanged", async () => {
        const post = await createPost(author.id, { published: false })
        draftReply()

        await feedback(post.id, author)
        const res = await feedback(post.id, author)
        expect(res.body).toMatchObject({ type: "draft", feedback: "Draft tips", cached: true })
        expect(getDraftFeedback).toHaveBeenCalledTimes(1)
    })

    it("asks again when the draft changes", async () => {
        const post = await createPost(author.id, { published: false })
        draftReply()

        await feedback(post.id, author)
        await prisma.post.update({ where: { id: post.id }, data: { content: "# Rewritten\n\nNew text." } })
        const res = await feedback(post.id, author)
        expect(res.body.cached).toBe(false)
        expect(getDraftFeedback).toHaveBeenCalledTimes(2)
    })

    it("doesn't reuse draft feedback once the post is published", async () => {
        const post = await createPost(author.id, { published: false })
        draftReply()
        publishedReply()

        await feedback(post.id, author)
        await prisma.post.update({ where: { id: post.id }, data: { published: true } })
        const res = await feedback(post.id, author)
        expect(res.body).toMatchObject({ type: "published", feedback: "Reader tips", cached: false })
    })

    it("reuses published feedback until there are 3 new comments", async () => {
        const post = await createPost(author.id)
        publishedReply()

        await feedback(post.id, author)
        await createComment(post.id, reader.id, "First")
        await createComment(post.id, reader.id, "Second")
        expect((await feedback(post.id, author)).body.cached).toBe(true)

        await createComment(post.id, reader.id, "Third")
        expect((await feedback(post.id, author)).body.cached).toBe(false)
        expect(getPublishedFeedback).toHaveBeenCalledTimes(2)
    })

    it("counts replaced comments as new", async () => {
        const post = await createPost(author.id)
        const old = await Promise.all(["a", "b", "c"].map(text => createComment(post.id, reader.id, text)))
        publishedReply()

        await feedback(post.id, author)
        await prisma.comment.deleteMany({ where: { id: { in: old.map(c => c.id) } } })
        for (const text of ["d", "e", "f"]) await createComment(post.id, reader.id, text)

        expect((await feedback(post.id, author)).body.cached).toBe(false)
    })

    it("asks again when a published post is edited", async () => {
        const post = await createPost(author.id)
        publishedReply()

        await feedback(post.id, author)
        await prisma.post.update({ where: { id: post.id }, data: { title: "A better title" } })
        expect((await feedback(post.id, author)).body.cached).toBe(false)
    })

    it("doesn't cache a failed request", async () => {
        const post = await createPost(author.id, { published: false })
        vi.mocked(getDraftFeedback).mockRejectedValueOnce(new FeedbackUnavailableError())
        draftReply()

        expect((await feedback(post.id, author)).status).toBe(503)
        const res = await feedback(post.id, author)
        expect(res.body).toMatchObject({ feedback: "Draft tips", cached: false })
    })

    it("is deleted with the post", async () => {
        const post = await createPost(author.id, { published: false })
        draftReply()

        await feedback(post.id, author)
        await prisma.post.delete({ where: { id: post.id } })
        expect(await prisma.postFeedback.count()).toBe(0)
    })
})

describe("POST /admin/posts/:id/feedback", () => {
    const adminFeedback = (id: number, headers: Record<string, string> = adminHeader()) =>
        request(app).post(`/admin/posts/${id}/feedback`).set(headers)

    it("requires the admin key", async () => {
        const post = await createPost(author.id)
        expect((await adminFeedback(post.id, {})).status).toBe(401)
    })

    it("404s on a missing post", async () => {
        expect((await adminFeedback(9999)).status).toBe(404)
    })

    it("gives feedback on a post", async () => {
        const post = await createPost(author.id, { published: false })
        vi.mocked(getDraftFeedback).mockResolvedValue("Draft tips")

        const res = await adminFeedback(post.id)
        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({ type: "draft", feedback: "Draft tips", cached: false })
    })

    it("shares the cache with the author's endpoint", async () => {
        const post = await createPost(author.id, { published: false })
        vi.mocked(getDraftFeedback).mockResolvedValue("Draft tips")

        await feedback(post.id, author)
        expect((await adminFeedback(post.id)).body.cached).toBe(true)
        expect(getDraftFeedback).toHaveBeenCalledTimes(1)
    })
})

describe("feedback rate limiting", () => {
    it("allows 10 requests per hour", async () => {
        const post = await createPost(author.id, { published: false })
        vi.mocked(getDraftFeedback).mockResolvedValue("ok")

        const statuses: number[] = []
        for (let i = 0; i < 12; i++) statuses.push((await feedback(post.id, author)).status)

        expect(statuses.slice(0, 10).every(s => s === 200)).toBe(true)
        expect(statuses.slice(10)).toEqual([429, 429])
    })
})
