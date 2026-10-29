import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"
import { authCookie, createComment, createPost, createUser, prisma } from "./helpers.js"

type User = Awaited<ReturnType<typeof createUser>>
type Post = Awaited<ReturnType<typeof createPost>>

let author: User, commenter: User, stranger: User, post: Post

beforeEach(async () => {
    author = await createUser("AUTHOR")
    commenter = await createUser()
    stranger = await createUser()
    post = await createPost(author.id)
})

describe("GET /posts/:id/comments", () => {
    it("lists comments on a published post", async () => {
        await createComment(post.id, commenter.id, "First")
        await createComment(post.id, commenter.id, "Second")

        const res = await request(app).get(`/posts/${post.id}/comments`)
        expect(res.status).toBe(200)
        expect(res.body.map((c: { text: string }) => c.text)).toEqual(["First", "Second"])
    })

    it("hides comments on drafts", async () => {
        const draft = await createPost(author.id, { published: false })
        await createComment(draft.id, commenter.id)

        const res = await request(app).get(`/posts/${draft.id}/comments`)
        expect(res.body).toEqual([])
    })

    it("gets a single comment", async () => {
        const comment = await createComment(post.id, commenter.id)
        const res = await request(app).get(`/posts/${post.id}/comments/${comment.id}`)
        expect(res.status).toBe(200)
        expect(res.body.text).toBe(comment.text)
    })

    it("404s on a comment that belongs to another post", async () => {
        const other = await createPost(author.id)
        const comment = await createComment(other.id, commenter.id)
        const res = await request(app).get(`/posts/${post.id}/comments/${comment.id}`)
        expect(res.status).toBe(404)
    })

    it("400s on a non-numeric comment id", async () => {
        const res = await request(app).get(`/posts/${post.id}/comments/abc`)
        expect(res.status).toBe(400)
    })
})

describe("POST /posts/:id/comments", () => {
    const comment = (user: User | null, body: object) => {
        const req = request(app).post(`/posts/${post.id}/comments`).send(body)
        return user ? req.set("Cookie", authCookie(user)) : req
    }

    it("requires login", async () => {
        const res = await comment(null, { text: "hi" })
        expect(res.status).toBe(401)
    })

    it("creates a comment owned by the logged-in user", async () => {
        const res = await comment(commenter, { text: "Great read" })
        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({ text: "Great read", postId: post.id, userId: commenter.id })
    })

    it("ignores a userId in the body", async () => {
        const res = await comment(commenter, { text: "Sneaky", userId: stranger.id })
        expect(res.body.userId).toBe(commenter.id)
    })

    it.each([
        ["empty", ""],
        ["too long", "a".repeat(256)]
    ])("400s on %s text", async (_, text) => {
        const res = await comment(commenter, { text })
        expect(res.status).toBe(400)
    })

    it("rejects profanity", async () => {
        const res = await comment(commenter, { text: "what a shit post" })
        expect(res.status).toBe(400)
        expect(await prisma.comment.count()).toBe(0)
    })

    it("404s on a draft", async () => {
        const draft = await createPost(author.id, { published: false })
        const res = await request(app)
            .post(`/posts/${draft.id}/comments`)
            .set("Cookie", authCookie(commenter))
            .send({ text: "hi" })
        expect(res.status).toBe(404)
        expect(await prisma.comment.count()).toBe(0)
    })

    it("404s on a missing post", async () => {
        const res = await request(app)
            .post("/posts/9999/comments")
            .set("Cookie", authCookie(commenter))
            .send({ text: "hi" })
        expect(res.status).toBe(404)
    })
})

describe("PATCH /posts/:id/comments/:commentId", () => {
    it("lets the owner edit", async () => {
        const c = await createComment(post.id, commenter.id)
        const res = await request(app)
            .patch(`/posts/${post.id}/comments/${c.id}`)
            .set("Cookie", authCookie(commenter))
            .send({ text: "Edited" })
        expect(res.status).toBe(200)
        expect(res.body.text).toBe("Edited")
    })

    it("forbids other users, including the post author", async () => {
        const c = await createComment(post.id, commenter.id)
        for (const user of [stranger, author]) {
            const res = await request(app)
                .patch(`/posts/${post.id}/comments/${c.id}`)
                .set("Cookie", authCookie(user))
                .send({ text: "Hijacked" })
            expect(res.status).toBe(403)
        }
        expect((await prisma.comment.findUnique({ where: { id: c.id } }))?.text).toBe(c.text)
    })

    it("404s on a missing comment", async () => {
        const res = await request(app)
            .patch(`/posts/${post.id}/comments/9999`)
            .set("Cookie", authCookie(commenter))
            .send({ text: "Edited" })
        expect(res.status).toBe(404)
    })

    it("rejects profanity in edits", async () => {
        const c = await createComment(post.id, commenter.id)
        const res = await request(app)
            .patch(`/posts/${post.id}/comments/${c.id}`)
            .set("Cookie", authCookie(commenter))
            .send({ text: "shit" })
        expect(res.status).toBe(400)
    })
})

describe("DELETE /posts/:id/comments/:commentId", () => {
    const del = (user: User, postId: number, commentId: number) =>
        request(app).delete(`/posts/${postId}/comments/${commentId}`).set("Cookie", authCookie(user))

    it("lets the comment owner delete", async () => {
        const c = await createComment(post.id, commenter.id)
        const res = await del(commenter, post.id, c.id)
        expect(res.status).toBe(200)
        expect(await prisma.comment.count()).toBe(0)
    })

    it("lets the post owner moderate comments", async () => {
        const c = await createComment(post.id, commenter.id)
        const res = await del(author, post.id, c.id)
        expect(res.status).toBe(200)
    })

    it("forbids other users", async () => {
        const c = await createComment(post.id, commenter.id)
        const res = await del(stranger, post.id, c.id)
        expect(res.status).toBe(403)
        expect(await prisma.comment.count()).toBe(1)
    })

    it("doesn't let a post owner delete comments on someone else's post", async () => {
        const strangersPost = await createPost(stranger.id)
        const c = await createComment(strangersPost.id, commenter.id)

        const res = await del(author, post.id, c.id)
        expect([403, 404]).toContain(res.status)
        expect(await prisma.comment.count()).toBe(1)
    })
})
