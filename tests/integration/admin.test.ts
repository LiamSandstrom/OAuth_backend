import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"
import { adminHeader, createComment, createPost, createUser, prisma } from "./helpers.js"

let author: Awaited<ReturnType<typeof createUser>>

beforeEach(async () => {
    author = await createUser("AUTHOR", process.env.ADMIN_EMAIL)
})

describe("API key", () => {
    it.each([
        ["missing", {}],
        ["wrong", { Authorization: "Bearer nope" }],
        ["not a bearer token", { Authorization: process.env.ADMIN_API_KEY! }]
    ])("rejects a %s key", async (_, headers) => {
        const res = await request(app).get("/admin/posts").set(headers)
        expect(res.status).toBe(401)
    })
})

describe("/admin/posts", () => {
    it("lists drafts as well as published posts", async () => {
        await createPost(author.id)
        await createPost(author.id, { published: false })

        const res = await request(app).get("/admin/posts").set(adminHeader())
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
    })

    it.each([
        ["false", false],
        ["true", true]
    ])("filters on ?published=%s", async (query, published) => {
        await createPost(author.id)
        await createPost(author.id, { published: false })

        const res = await request(app).get(`/admin/posts?published=${query}`).set(adminHeader())
        expect(res.status).toBe(200)
        expect(res.body.map((p: { published: boolean }) => p.published)).toEqual([published])
    })

    it("creates a draft by default", async () => {
        const res = await request(app)
            .post("/admin/posts")
            .set(adminHeader())
            .send({ title: "New post", content: "# Fresh content here" })

        expect(res.status).toBe(201)
        expect(res.body).toMatchObject({ title: "New post", published: false, userId: author.id })
        expect(await prisma.post.count()).toBe(1)
    })

    it("assigns the post to the ADMIN_EMAIL user, not the first author", async () => {
        await prisma.user.update({ where: { id: author.id }, data: { email: "someone@test.local" } })
        await createUser("AUTHOR")
        const admin = await createUser("AUTHOR", process.env.ADMIN_EMAIL)

        const res = await request(app)
            .post("/admin/posts")
            .set(adminHeader())
            .send({ title: "New post", content: "# Fresh content here" })
        expect(res.status).toBe(201)
        expect(res.body.userId).toBe(admin.id)
    })

    it("400s when no user has ADMIN_EMAIL", async () => {
        await prisma.user.update({ where: { id: author.id }, data: { email: "someone@test.local" } })
        const res = await request(app)
            .post("/admin/posts")
            .set(adminHeader())
            .send({ title: "New post", content: "# Fresh content here" })
        expect(res.status).toBe(400)
    })

    it("400s when the ADMIN_EMAIL user isn't an AUTHOR", async () => {
        await prisma.user.update({ where: { id: author.id }, data: { role: "USER" } })
        const res = await request(app)
            .post("/admin/posts")
            .set(adminHeader())
            .send({ title: "New post", content: "# Fresh content here" })
        expect(res.status).toBe(400)
    })

    it("400s on an invalid post", async () => {
        const res = await request(app).post("/admin/posts").set(adminHeader()).send({ title: "x" })
        expect(res.status).toBe(400)
        expect(res.body.errors).toHaveProperty("title")
        expect(res.body.errors).toHaveProperty("content")
    })

    it("gets a draft by id", async () => {
        const draft = await createPost(author.id, { published: false })
        const res = await request(app).get(`/admin/posts/${draft.id}`).set(adminHeader())
        expect(res.status).toBe(200)
        expect(res.body.id).toBe(draft.id)
    })

    it("publishes a post", async () => {
        const draft = await createPost(author.id, { published: false })

        const res = await request(app).patch(`/admin/posts/${draft.id}`).set(adminHeader()).send({ published: true })
        expect(res.status).toBe(200)
        expect(res.body.published).toBe(true)

        const publicRes = await request(app).get(`/posts/${draft.id}`)
        expect(publicRes.status).toBe(200)
    })

    it("400s on an empty update", async () => {
        const post = await createPost(author.id)
        const res = await request(app).patch(`/admin/posts/${post.id}`).set(adminHeader()).send({})
        expect(res.status).toBe(400)
    })

    it("404s when updating a missing post", async () => {
        const res = await request(app).patch("/admin/posts/9999").set(adminHeader()).send({ published: true })
        expect(res.status).toBe(404)
    })

    it("deletes a post", async () => {
        const post = await createPost(author.id)
        const res = await request(app).delete(`/admin/posts/${post.id}`).set(adminHeader())
        expect(res.status).toBe(200)
        expect(await prisma.post.findUnique({ where: { id: post.id } })).toBeNull()
    })

    it("404s when deleting a missing post", async () => {
        const res = await request(app).delete("/admin/posts/9999").set(adminHeader())
        expect(res.status).toBe(404)
    })
})

describe("/admin/users", () => {
    it("updates a user but ignores role changes", async () => {
        const user = await createUser()
        const res = await request(app)
            .patch(`/admin/users/${user.id}`)
            .set(adminHeader())
            .send({ username: "renamed", role: "AUTHOR" })
        expect(res.status).toBe(200)
        expect(await prisma.user.findUnique({ where: { id: user.id } })).toMatchObject({
            username: "renamed",
            role: "USER"
        })
    })

    it("deletes a user and cascades to their posts", async () => {
        await createPost(author.id)
        const res = await request(app).delete(`/admin/users/${author.id}`).set(adminHeader())
        expect(res.status).toBe(200)
        expect(await prisma.post.count()).toBe(0)
    })
})

describe("/admin/comments", () => {
    it("lists comments on drafts as well as published posts", async () => {
        await createComment((await createPost(author.id)).id, author.id, "On a published post")
        await createComment((await createPost(author.id, { published: false })).id, author.id, "On a draft")

        const res = await request(app).get("/admin/comments").set(adminHeader())
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
    })

    it("filters by text, case-insensitively", async () => {
        const post = await createPost(author.id)
        await createComment(post.id, author.id, "Buy cheap SPAM now")
        await createComment(post.id, author.id, "Lovely post")

        const res = await request(app).get("/admin/comments").query({ text: "spam" }).set(adminHeader())
        expect(res.body.map((c: { text: string }) => c.text)).toEqual(["Buy cheap SPAM now"])
    })

    it("filters by id", async () => {
        const post = await createPost(author.id)
        await createComment(post.id, author.id)
        const target = await createComment(post.id, author.id)

        const res = await request(app).get("/admin/comments").query({ id: target.id }).set(adminHeader())
        expect(res.body).toEqual([expect.objectContaining({ id: target.id })])
    })

    it("deletes any comment", async () => {
        const comment = await createComment((await createPost(author.id)).id, author.id)
        const res = await request(app).delete(`/admin/comments/${comment.id}`).set(adminHeader())
        expect(res.status).toBe(200)
        expect(await prisma.comment.count()).toBe(0)
    })

    it("404s when deleting a missing comment", async () => {
        const res = await request(app).delete("/admin/comments/9999").set(adminHeader())
        expect(res.status).toBe(404)
    })

    it("requires the API key", async () => {
        expect((await request(app).get("/admin/comments")).status).toBe(401)
    })
})
