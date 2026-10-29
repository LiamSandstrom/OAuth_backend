import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"
import { authCookie, createUser, prisma } from "./helpers.js"

type User = Awaited<ReturnType<typeof createUser>>
let user: User, other: User, author: User

beforeEach(async () => {
    user = await createUser()
    other = await createUser()
    author = await createUser("AUTHOR")
})

describe("GET /users/protected", () => {
    it("401s without a token", async () => {
        expect((await request(app).get("/users/protected")).status).toBe(401)
    })

    it("shows who you're logged in as", async () => {
        const res = await request(app).get("/users/protected").set("Cookie", authCookie(user))
        expect(res.status).toBe(200)
        expect(res.body.message).toContain(user.username)
    })

    it("404s if the user was deleted after the token was issued", async () => {
        await prisma.user.delete({ where: { id: user.id } })
        const res = await request(app).get("/users/protected").set("Cookie", authCookie(user))
        expect(res.status).toBe(404)
    })
})

describe("GET /users", () => {
    it("is author-only", async () => {
        const res = await request(app).get("/users").set("Cookie", authCookie(user))
        expect(res.status).toBe(403)
    })

    it("lists users for authors", async () => {
        const res = await request(app).get("/users").set("Cookie", authCookie(author))
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(3)
    })

    it("gets one user for authors", async () => {
        const res = await request(app).get(`/users/${user.id}`).set("Cookie", authCookie(author))
        expect(res.body.id).toBe(user.id)
    })

    it("404s on a missing user", async () => {
        const res = await request(app).get("/users/9999").set("Cookie", authCookie(author))
        expect(res.status).toBe(404)
    })

    it("400s on a non-numeric id", async () => {
        const res = await request(app).get("/users/abc").set("Cookie", authCookie(author))
        expect(res.status).toBe(400)
    })
})

describe("PATCH /users/:id", () => {
    const patch = (as: User, id: number, body: object) =>
        request(app).patch(`/users/${id}`).set("Cookie", authCookie(as)).send(body)

    it("updates your own username", async () => {
        const res = await patch(user, user.id, { username: "renamed" })
        expect(res.status).toBe(200)
        expect((await prisma.user.findUnique({ where: { id: user.id } }))?.username).toBe("renamed")
    })

    it("refuses to update someone else", async () => {
        const res = await patch(user, other.id, { username: "hacked" })
        expect(res.status).toBe(401)
        expect((await prisma.user.findUnique({ where: { id: other.id } }))?.username).toBe(other.username)
    })

    it("ignores attempts to change your own role", async () => {
        await patch(user, user.id, { username: "renamed", role: "AUTHOR" })
        expect((await prisma.user.findUnique({ where: { id: user.id } }))?.role).toBe("USER")
    })

    it("400s on an invalid email", async () => {
        const res = await patch(user, user.id, { email: "nope" })
        expect(res.status).toBe(400)
    })

    it("409s when the username is taken", async () => {
        const res = await patch(user, user.id, { username: other.username })
        expect(res.status).toBe(409)
    })
})

describe("DELETE /users/:id", () => {
    it("deletes your own account", async () => {
        const res = await request(app).delete(`/users/${user.id}`).set("Cookie", authCookie(user))
        expect(res.status).toBe(200)
        expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull()
    })

    it("refuses to delete someone else", async () => {
        const res = await request(app).delete(`/users/${other.id}`).set("Cookie", authCookie(user))
        expect(res.status).toBe(401)
        expect(await prisma.user.findUnique({ where: { id: other.id } })).not.toBeNull()
    })
})
