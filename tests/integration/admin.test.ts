import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"
import { adminHeader, createPost, createUser, prisma } from "./helpers.js"

let author: Awaited<ReturnType<typeof createUser>>

beforeEach(async () => {
    author = await createUser("AUTHOR")
})

describe("API key", () => {
    it.each([
        ["missing", {}],
        ["wrong", { Authorization: "Bearer nope" }],
        ["not a bearer token", { Authorization: process.env.ADMIN_API_KEY! }],
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

    it("creates a draft by default", async () => {
        const res = await request(app)
            .post("/admin/posts")
            .set(adminHeader())
            .send({ title: "New post", content: "# Fresh content here" })

        expect(res.status).toBe(201)
        expect(res.body).toMatchObject({ title: "New post", published: false, userId: author.id })
        expect(await prisma.post.count()).toBe(1)
    })

    it("400s when there is no author to own the post", async () => {
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
    it("can promote a user to author", async () => {
        const user = await createUser()
        const res = await request(app).patch(`/admin/users/${user.id}`).set(adminHeader()).send({ role: "AUTHOR" })
        expect(res.status).toBe(200)
        expect((await prisma.user.findUnique({ where: { id: user.id } }))?.role).toBe("AUTHOR")
    })

    it("deletes a user and cascades to their posts", async () => {
        await createPost(author.id)
        const res = await request(app).delete(`/admin/users/${author.id}`).set(adminHeader())
        expect(res.status).toBe(200)
        expect(await prisma.post.count()).toBe(0)
    })
})
