import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"
import { authCookie, createComment, createPost, createUser, prisma } from "./helpers.js"
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
        expect(res.body).toMatchObject({ type: "draft", feedback: "Tighten the intro" })
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
        expect(res.body).toMatchObject({ type: "published", feedback: "Readers want more examples" })

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

describe("feedback rate limiting", () => {
    it("allows 10 requests per hour", async () => {
        const post = await createPost(author.id, { published: false })
        vi.mocked(getDraftFeedback).mockResolvedValue("ok")

        const statuses: number[] = []
        for (let i = 0; i < 12; i++) statuses.push((await feedback(post.id, author)).status)

        expect(statuses).toContain(429)
    })
})
