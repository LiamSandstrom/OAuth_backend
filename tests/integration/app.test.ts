import { describe, it, expect } from "vitest"
import request from "supertest"
import { app } from "../../src/app.js"

describe("app", () => {
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
