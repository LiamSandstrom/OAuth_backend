import { describe, it, expect } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"

describe("OAuth redirects", () => {
    it("GET /auth/google redirects to Google with our client id", async () => {
        const res = await request(app).get("/auth/google")
        expect(res.status).toBe(302)
        const location = new URL(res.headers.location)
        expect(location.host).toBe("accounts.google.com")
        expect(location.searchParams.get("client_id")).toBe(process.env.GOOGLE_CLIENT_ID)
    })

    it("GET /auth/github redirects to GitHub with our client id", async () => {
        const res = await request(app).get("/auth/github")
        expect(res.status).toBe(302)
        const location = new URL(res.headers.location)
        expect(location.host).toBe("github.com")
        expect(location.searchParams.get("client_id")).toBe(process.env.GITHUB_CLIENT_ID)
    })
})

describe("GET /auth/failure", () => {
    it("returns a default message", async () => {
        const res = await request(app).get("/auth/failure")
        expect(res.body.message).toBe("Something went wrong :(")
    })

    it("echoes the message from the query string", async () => {
        const res = await request(app).get("/auth/failure").query({ message: "No email" })
        expect(res.body.message).toBe("No email")
    })
})

describe("POST /auth/logout", () => {
    it("clears the jwt cookie", async () => {
        const res = await request(app).post("/auth/logout").set("Cookie", ["jwt_token=abc"])
        expect(res.status).toBe(200)
        expect(res.body.message).toBe("Logout successful")
        expect(res.headers["set-cookie"][0]).toMatch(/^jwt_token=;.*Expires=Thu, 01 Jan 1970/)
    })
})
