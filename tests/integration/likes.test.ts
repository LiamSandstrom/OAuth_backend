import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"
import { authCookie, createPost, createUser } from "./helpers.js"

type User = Awaited<ReturnType<typeof createUser>>
let user: User, post: Awaited<ReturnType<typeof createPost>>

beforeEach(async () => {
    user = await createUser()
    post = await createPost((await createUser("AUTHOR")).id)
})

const likes = () => request(app).get(`/posts/${post.id}/likes`)
const like = (u: User) => request(app).post(`/posts/${post.id}/likes`).set("Cookie", authCookie(u))
const unlike = (u: User) => request(app).delete(`/posts/${post.id}/likes`).set("Cookie", authCookie(u))

describe("likes", () => {
    it("starts at zero", async () => {
        const res = await likes()
        expect(res.status).toBe(200)
        expect(res.body).toBe(0)
    })

    it("requires login to like or unlike", async () => {
        expect((await request(app).post(`/posts/${post.id}/likes`)).status).toBe(401)
        expect((await request(app).delete(`/posts/${post.id}/likes`)).status).toBe(401)
    })

    it("counts likes from different users", async () => {
        await like(user)
        await like(await createUser())
        expect((await likes()).body).toBe(2)
    })

    it("unlikes", async () => {
        await like(user)
        const res = await unlike(user)
        expect(res.status).toBe(200)
        expect((await likes()).body).toBe(0)
    })

    it("409s when liking the same post twice", async () => {
        await like(user)
        const res = await like(user)
        expect(res.status).toBe(409)
        expect((await likes()).body).toBe(1)
    })

    it("404s when unliking a post you haven't liked", async () => {
        const res = await unlike(user)
        expect(res.status).toBe(404)
    })

    it("404s when liking a missing post", async () => {
        const res = await request(app).post("/posts/9999/likes").set("Cookie", authCookie(user))
        expect(res.status).toBe(404)
    })
})
