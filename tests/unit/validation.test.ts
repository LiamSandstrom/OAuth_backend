import { describe, it, expect } from "vitest"
import { CreateCommentSchema } from "../../src/validation/validateComment.js"
import { CreatePostSchema, UpdatePostSchema } from "../../src/validation/validateCreatePost.js"
import { UpdateUserSchema } from "../../src/validation/validateUser.js"

describe("CreateCommentSchema", () => {
    it("accepts text between 1 and 255 chars", () => {
        expect(CreateCommentSchema.safeParse({ text: "a" }).success).toBe(true)
        expect(CreateCommentSchema.safeParse({ text: "a".repeat(255) }).success).toBe(true)
    })

    it.each([
        ["empty text", { text: "" }],
        ["too long text", { text: "a".repeat(256) }],
        ["missing text", {}],
        ["non-string text", { text: 42 }]
    ])("rejects %s", (_, body) => {
        expect(CreateCommentSchema.safeParse(body).success).toBe(false)
    })
})

describe("CreatePostSchema", () => {
    const valid = { title: "Hello", content: "Long enough content" }

    it("accepts a valid post and leaves published optional", () => {
        const result = CreatePostSchema.safeParse(valid)
        expect(result.success).toBe(true)
        expect(result.data?.published).toBeUndefined()
    })

    it.each([
        ["short title", { ...valid, title: "Hi" }],
        ["long title", { ...valid, title: "a".repeat(101) }],
        ["short content", { ...valid, content: "short" }],
        ["non-boolean published", { ...valid, published: "yes" }]
    ])("rejects %s", (_, body) => {
        expect(CreatePostSchema.safeParse(body).success).toBe(false)
    })
})

describe("UpdatePostSchema", () => {
    it("accepts a partial update", () => {
        expect(UpdatePostSchema.safeParse({ published: true }).success).toBe(true)
    })

    it("rejects an empty update", () => {
        expect(UpdatePostSchema.safeParse({}).success).toBe(false)
    })
})

describe("UpdateUserSchema", () => {
    it("accepts a username or email change", () => {
        expect(UpdateUserSchema.safeParse({ username: "newname" }).success).toBe(true)
        expect(UpdateUserSchema.safeParse({ email: "new@example.com" }).success).toBe(true)
    })

    it("rejects an invalid email", () => {
        expect(UpdateUserSchema.safeParse({ email: "not-an-email" }).success).toBe(false)
    })

    it("strips role so users can't promote themselves", () => {
        const result = UpdateUserSchema.safeParse({ username: "newname", role: "AUTHOR" })
        expect(result.success).toBe(true)
        expect(result.data).not.toHaveProperty("role")
    })

    it("rejects a body that only contains role", () => {
        expect(UpdateUserSchema.safeParse({ role: "AUTHOR" }).success).toBe(false)
    })
})
