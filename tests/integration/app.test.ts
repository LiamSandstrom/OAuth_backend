import { describe, it, expect } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"

describe("app", () => {
    it("reports healthy when the database is reachable", async () => {
        const res = await request(app).get("/health")
        expect(res.status).toBe(200)
        expect(res.body).toEqual({ status: "ok" })
    })

    it("sets security headers", async () => {
        const res = await request(app).get("/health")
        expect(res.headers["x-content-type-options"]).toBe("nosniff")
        expect(res.headers["x-powered-by"]).toBeUndefined()
    })

    it("allows credentialed CORS from the configured origin", async () => {
        const res = await request(app).options("/posts").set("Origin", "http://localhost:5173")
        expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173")
        expect(res.headers["access-control-allow-credentials"]).toBe("true")
    })

    it("doesn't allow CORS from other origins", async () => {
        const res = await request(app).options("/posts").set("Origin", "https://evil.example")
        expect(res.headers["access-control-allow-origin"]).toBeUndefined()
    })

    it("returns a JSON 404 for unknown routes", async () => {
        const res = await request(app).get("/does-not-exist")
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ message: "Not found" })
    })

    it("returns a JSON 400 for a malformed body", async () => {
        const res = await request(app)
            .post("/admin/posts")
            .set("Authorization", `Bearer ${process.env.ADMIN_API_KEY}`)
            .set("Content-Type", "application/json")
            .send("{not json")
        expect(res.status).toBe(400)
        expect(res.body).toEqual({ message: "Invalid JSON body" })
    })
})
