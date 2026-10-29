import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"
import { authCookie, createAccount, createUser, prisma } from "./helpers.js"

type User = Awaited<ReturnType<typeof createUser>>
let user: User, other: User, author: User

beforeEach(async () => {
    user = await createUser()
    other = await createUser()
    author = await createUser("AUTHOR")
})

it("401s without a token", async () => {
    expect((await request(app).get("/accounts")).status).toBe(401)
})

describe("GET /accounts", () => {
    it("is author-only", async () => {
        const res = await request(app).get("/accounts").set("Cookie", authCookie(user))
        expect(res.status).toBe(403)
    })

    it("lists all accounts for authors", async () => {
        await createAccount(user.id)
        await createAccount(other.id)
        const res = await request(app).get("/accounts").set("Cookie", authCookie(author))
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
    })
})

describe("GET /accounts/:id", () => {
    it("returns your own account", async () => {
        const account = await createAccount(user.id)
        const res = await request(app).get(`/accounts/${account.id}`).set("Cookie", authCookie(user))
        expect(res.status).toBe(200)
        expect(res.body.id).toBe(account.id)
    })

    it("refuses someone else's account", async () => {
        const account = await createAccount(other.id)
        const res = await request(app).get(`/accounts/${account.id}`).set("Cookie", authCookie(user))
        expect(res.status).toBe(403)
    })

    it("lets authors view any account", async () => {
        const account = await createAccount(other.id)
        const res = await request(app).get(`/accounts/${account.id}`).set("Cookie", authCookie(author))
        expect(res.status).toBe(200)
        expect(res.body.id).toBe(account.id)
    })

    it("400s on a non-numeric id", async () => {
        const res = await request(app).get("/accounts/abc").set("Cookie", authCookie(user))
        expect(res.status).toBe(400)
    })
})

describe("DELETE /accounts/:id (unlink provider)", () => {
    it("won't unlink your only login method", async () => {
        const account = await createAccount(user.id)
        const res = await request(app).delete(`/accounts/${account.id}`).set("Cookie", authCookie(user))
        expect(res.status).toBe(400)
        expect(await prisma.account.count()).toBe(1)
    })

    it("unlinks one of several providers", async () => {
        const google = await createAccount(user.id, "google")
        await createAccount(user.id, "github")

        const res = await request(app).delete(`/accounts/${google.id}`).set("Cookie", authCookie(user))
        expect(res.status).toBe(200)
        expect(await prisma.account.findMany({ where: { userId: user.id } })).toHaveLength(1)
    })

    it("can't unlink someone else's provider", async () => {
        await createAccount(user.id, "google")
        await createAccount(user.id, "github")
        const victim = await createAccount(other.id)

        const res = await request(app).delete(`/accounts/${victim.id}`).set("Cookie", authCookie(user))
        expect(res.status).toBe(403)
        expect(await prisma.account.findUnique({ where: { id: victim.id } })).not.toBeNull()
    })
})
