import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"
import { authCookie, createComment, createPost, createUser } from "./helpers.js"

let author: Awaited<ReturnType<typeof createUser>>

beforeEach(async () => {
    author = await createUser("AUTHOR")
})

describe("GET /posts", () => {
    it("only lists published posts", async () => {
        await createPost(author.id, { title: "Public" })
        await createPost(author.id, { title: "Draft", published: false })

        const res = await request(app).get("/posts")
        expect(res.status).toBe(200)
        expect(res.body.map((p: { title: string }) => p.title)).toEqual(["Public"])
    })

    it("filters by title, case-insensitively", async () => {
        await createPost(author.id, { title: "Learning Docker" })
        await createPost(author.id, { title: "Testing Express" })

        const res = await request(app).get("/posts").query({ title: "docker" })
        expect(res.body).toHaveLength(1)
        expect(res.body[0].title).toBe("Learning Docker")
    })

    it("paginates with page and limit", async () => {
        for (const n of [1, 2, 3, 4, 5]) await createPost(author.id, { title: `Post ${n}` })

        const res = await request(app).get("/posts").query({ page: 2, limit: 2 })
        expect(res.body.map((p: { title: string }) => p.title)).toEqual(["Post 3", "Post 4"])
    })

    it("ignores empty query params", async () => {
        await createPost(author.id)

        const res = await request(app).get("/posts?limit=&page=")
        expect(res.body).toHaveLength(1)
    })

    it("includes comments only when asked", async () => {
        const post = await createPost(author.id)
        await createComment(post.id, author.id)

        const without = await request(app).get("/posts")
        expect(without.body[0].comments).toBeUndefined()

        const withComments = await request(app).get("/posts").query({ withComments: "true" })
        expect(withComments.body[0].comments).toHaveLength(1)
    })
})

describe("GET /posts/:id", () => {
    it("returns the post as frontmatter meta + markdown AST", async () => {
        const post = await createPost(author.id)

        const res = await request(app).get(`/posts/${post.id}`)
        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({ id: post.id, title: post.title, meta: { tags: ["test"] } })
        expect(res.body.ast.type).toBe("root")
        expect(res.body.content).toBeUndefined()
    })

    it("returns raw markdown with ?format=raw", async () => {
        const post = await createPost(author.id)

        const res = await request(app).get(`/posts/${post.id}`).query({ format: "raw" })
        expect(res.body.content).toBe(post.content)
        expect(res.body.ast).toBeUndefined()
    })

    it("404s on an unpublished post", async () => {
        const draft = await createPost(author.id, { published: false })
        const res = await request(app).get(`/posts/${draft.id}`)
        expect(res.status).toBe(404)
    })

    it("404s on a missing post", async () => {
        const res = await request(app).get("/posts/9999")
        expect(res.status).toBe(404)
    })

    it("400s on a non-numeric id", async () => {
        const res = await request(app).get("/posts/abc")
        expect(res.status).toBe(400)
    })
})

describe("GET /posts/admin", () => {
    it("requires a token", async () => {
        const res = await request(app).get("/posts/admin")
        expect(res.status).toBe(401)
    })

    it("forbids regular users", async () => {
        const user = await createUser()
        const res = await request(app).get("/posts/admin").set("Cookie", authCookie(user))
        expect(res.status).toBe(403)
    })

    it("lets authors see drafts", async () => {
        const draft = await createPost(author.id, { published: false })

        const list = await request(app).get("/posts/admin").set("Cookie", authCookie(author))
        expect(list.status).toBe(200)
        expect(list.body).toHaveLength(1)

        const single = await request(app).get(`/posts/admin/${draft.id}`).set("Cookie", authCookie(author))
        expect(single.status).toBe(200)
        expect(single.body.published).toBe(false)
    })
})
