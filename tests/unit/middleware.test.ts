import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { requireRole } from "../../src/middleware/requireRole.js"
import { isSelf } from "../../src/middleware/isSelf.js"
import { validateId } from "../../src/middleware/validateId.js"
import { validate } from "../../src/middleware/validate.js"
import { verifyApiKey } from "../../src/middleware/verifyApiKey.js"
import { VerifyToken, unsafeVerifyToken } from "../../src/middleware/verifyToken.js"
import { filterToxicComments } from "../../src/middleware/filterToxicComments.js"
import { CreateCommentSchema } from "../../src/validation/validateComment.js"

const mockReq = (overrides: Partial<Request> = {}) =>
    ({ params: {}, body: {}, headers: {}, cookies: {}, ...overrides }) as Request

const mockRes = () => {
    const res = {} as Response
    res.status = vi.fn().mockReturnValue(res)
    res.json = vi.fn().mockReturnValue(res)
    return res
}

let next: ReturnType<typeof vi.fn>
beforeEach(() => {
    next = vi.fn()
    vi.spyOn(console, "log").mockImplementation(() => {})
})

describe("requireRole", () => {
    it("401s when there is no user", () => {
        const res = mockRes()
        requireRole("AUTHOR")(mockReq(), res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).not.toHaveBeenCalled()
    })

    it("403s when the role doesn't match", () => {
        const res = mockRes()
        requireRole("AUTHOR")(mockReq({ user: { id: 1, role: "USER" } }), res, next)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(next).not.toHaveBeenCalled()
    })

    it("passes when the role matches", () => {
        requireRole("AUTHOR")(mockReq({ user: { id: 1, role: "AUTHOR" } }), mockRes(), next)
        expect(next).toHaveBeenCalledOnce()
    })
})

describe("isSelf", () => {
    it("passes when the route id is the current user", () => {
        isSelf(mockReq({ params: { id: "5" }, user: { id: 5, role: "USER" } }), mockRes(), next)
        expect(next).toHaveBeenCalledOnce()
    })

    it("rejects a different user", () => {
        const res = mockRes()
        isSelf(mockReq({ params: { id: "6" }, user: { id: 5, role: "USER" } }), res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).not.toHaveBeenCalled()
    })
})

describe("validateId", () => {
    it("passes a numeric id", () => {
        validateId()(mockReq({ params: { id: "12" } }), mockRes(), next)
        expect(next).toHaveBeenCalledOnce()
    })

    it("400s on a non-numeric id", () => {
        const res = mockRes()
        validateId()(mockReq({ params: { id: "abc" } }), res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(next).not.toHaveBeenCalled()
    })

    it("checks a custom param name", () => {
        const res = mockRes()
        validateId("commentId")(mockReq({ params: { id: "1", commentId: "x" } }), res, next)
        expect(res.status).toHaveBeenCalledWith(400)
    })
})

describe("validate", () => {
    it("replaces the body with parsed data", () => {
        const req = mockReq({ body: { text: "hi", extra: "dropped" } })
        validate(CreateCommentSchema)(req, mockRes(), next)
        expect(next).toHaveBeenCalledOnce()
        expect(req.body).toEqual({ text: "hi" })
    })

    it("400s with field errors on invalid input", () => {
        const res = mockRes()
        validate(CreateCommentSchema)(mockReq({ body: { text: "" } }), res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Validation failed",
            errors: { text: expect.any(Array) },
        }))
        expect(next).not.toHaveBeenCalled()
    })
})

describe("verifyApiKey", () => {
    const withKey = (authorization?: string) => mockReq({ headers: { authorization } })

    it("passes with the correct bearer key", () => {
        verifyApiKey(withKey(`Bearer ${process.env.ADMIN_API_KEY}`), mockRes(), next)
        expect(next).toHaveBeenCalledOnce()
    })

    it.each([undefined, "Bearer wrong", process.env.ADMIN_API_KEY])("rejects authorization header %j", (header) => {
        const res = mockRes()
        verifyApiKey(withKey(header), res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).not.toHaveBeenCalled()
    })

    it("rejects everything when ADMIN_API_KEY is not configured", () => {
        vi.stubEnv("ADMIN_API_KEY", undefined)
        const res = mockRes()
        verifyApiKey(withKey(), res, next)
        vi.unstubAllEnvs()
        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(401)
    })
})

describe("VerifyToken", () => {
    const sign = (payload: object, secret = process.env.JWT_SECRET!) => jwt.sign(payload, secret)
    const withToken = (token?: string) => mockReq({ cookies: { jwt_token: token } })

    it("sets req.user from a valid token", async () => {
        const req = withToken(sign({ id: 3, role: "AUTHOR" }))
        await VerifyToken(req, mockRes(), next)
        expect(next).toHaveBeenCalledOnce()
        expect(req.user).toEqual({ id: 3, role: "AUTHOR" })
    })

    it.each([
        ["missing token", undefined],
        ["garbage token", "not-a-jwt"],
        ["wrong secret", sign({ id: 3, role: "USER" }, "other-secret")],
        ["invalid payload", sign({ id: "3", role: "USER" })],
        ["unknown role", sign({ id: 3, role: "SUPERADMIN" })],
        ["expired token", jwt.sign({ id: 3, role: "USER" }, process.env.JWT_SECRET!, { expiresIn: -10 })],
    ])("401s on %s", async (_, token) => {
        const res = mockRes()
        await VerifyToken(withToken(token), res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).not.toHaveBeenCalled()
    })
})

describe("unsafeVerifyToken", () => {
    it("sets req.user from a valid token", async () => {
        const req = mockReq({ cookies: { jwt_token: jwt.sign({ id: 1, role: "USER" }, process.env.JWT_SECRET!) } })
        await unsafeVerifyToken(req, mockRes(), next)
        expect(req.user).toEqual({ id: 1, role: "USER" })
        expect(next).toHaveBeenCalledOnce()
    })

    it.each([undefined, "garbage"])("continues without a user for token %j", async (token) => {
        const req = mockReq({ cookies: { jwt_token: token } })
        await unsafeVerifyToken(req, mockRes(), next)
        expect(req.user).toBeUndefined()
        expect(next).toHaveBeenCalledOnce()
    })
})

describe("filterToxicComments", () => {
    it("passes clean text", () => {
        filterToxicComments(mockReq({ body: { text: "What a lovely post" } }), mockRes(), next)
        expect(next).toHaveBeenCalledOnce()
    })

    it("400s on profanity", () => {
        const res = mockRes()
        filterToxicComments(mockReq({ body: { text: "this is shit" } }), res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(next).not.toHaveBeenCalled()
    })
})
