import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Request, Response } from "express"
import { Prisma } from "../../src/generated/prisma/client.js"
import { errorHandler } from "../../src/middleware/errorHandler.js"
import { FeedbackUnavailableError } from "../../src/services/aiFeedback.js"

const mockRes = () => {
    const res = {} as Response
    res.status = vi.fn().mockReturnValue(res)
    res.json = vi.fn().mockReturnValue(res)
    return res
}

const prismaError = (code: string) =>
    new Prisma.PrismaClientKnownRequestError("db error", { code, clientVersion: "test" })

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("errorHandler", () => {
    it("maps an unavailable AI to 503", () => {
        const res = mockRes()
        errorHandler(new FeedbackUnavailableError(), {} as Request, res, vi.fn())
        expect(res.status).toHaveBeenCalledWith(503)
    })

    it.each([
        ["P2025", 404],
        ["P2003", 404],
        ["P2002", 409]
    ])("maps Prisma %s to %i", (code, status) => {
        const res = mockRes()
        errorHandler(prismaError(code), {} as Request, res, vi.fn())
        expect(res.status).toHaveBeenCalledWith(status)
        expect(console.error).not.toHaveBeenCalled()
    })

    it("400s on a malformed JSON body", () => {
        const err = Object.assign(new SyntaxError("Unexpected token"), { body: "{bad" })
        const res = mockRes()
        errorHandler(err, {} as Request, res, vi.fn())
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("logs and 500s on anything else without leaking details", () => {
        const res = mockRes()
        errorHandler(new Error("secret internals"), {} as Request, res, vi.fn())
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" })
        expect(console.error).toHaveBeenCalled()
    })

    it("500s on unmapped Prisma errors", () => {
        const res = mockRes()
        errorHandler(prismaError("P2010"), {} as Request, res, vi.fn())
        expect(res.status).toHaveBeenCalledWith(500)
    })
})
