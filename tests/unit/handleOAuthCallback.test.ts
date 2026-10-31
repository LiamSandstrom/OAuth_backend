import { describe, it, expect, vi, beforeEach } from "vitest"
import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import passport from "passport"
import { handleOAuthCallback } from "../../src/middleware/handleOAuthCallback.js"

vi.mock("passport", () => ({ default: { authenticate: vi.fn() } }))

type AuthCallback = (err: Error | null, user: unknown, info?: { message: string }) => void

const passportResolves = (...args: Parameters<AuthCallback>) => {
    vi.mocked(passport.authenticate).mockImplementation(
        ((_: string, __: object, cb: AuthCallback) => () => cb(...args)) as never
    )
}

const mockRes = () => {
    const res = {} as Response
    res.cookie = vi.fn().mockReturnValue(res)
    res.redirect = vi.fn()
    return res
}

let next: NextFunction
beforeEach(() => {
    vi.resetAllMocks()
    next = vi.fn()
})

describe("handleOAuthCallback", () => {
    it("authenticates with the requested provider and no session", () => {
        passportResolves(null, false)
        handleOAuthCallback("github")({} as Request, mockRes(), next)
        expect(passport.authenticate).toHaveBeenCalledWith("github", { session: false }, expect.any(Function))
    })

    it("sets a signed httpOnly JWT cookie and redirects on success", () => {
        passportResolves(null, { id: 7, role: "AUTHOR" })
        const res = mockRes()
        handleOAuthCallback("google")({} as Request, res, next)

        expect(res.cookie).toHaveBeenCalledWith(
            "jwt_token",
            expect.any(String),
            expect.objectContaining({
                httpOnly: true,
                sameSite: "lax"
            })
        )
        const token = vi.mocked(res.cookie).mock.calls[0][1]
        expect(jwt.verify(token, process.env.JWT_SECRET!)).toMatchObject({ id: 7, role: "AUTHOR" })
        expect(res.redirect).toHaveBeenCalledWith("/users/protected")
    })

    it("makes the token and cookie expire after one day", () => {
        passportResolves(null, { id: 7, role: "AUTHOR" })
        const res = mockRes()
        handleOAuthCallback("google")({} as Request, res, next)

        const [, token, options] = vi.mocked(res.cookie).mock.calls[0] as unknown as [string, string, object]
        const { iat, exp } = jwt.decode(token) as { iat: number; exp: number }
        expect(exp - iat).toBe(24 * 60 * 60)
        expect(options).toMatchObject({ maxAge: 24 * 60 * 60 * 1000 })
    })

    it("redirects to /auth/failure with an encoded message when login is refused", () => {
        passportResolves(null, false, { message: "No email & stuff" })
        const res = mockRes()
        handleOAuthCallback("github")({} as Request, res, next)
        expect(res.cookie).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith(`/auth/failure?message=${encodeURIComponent("No email & stuff")}`)
    })

    it("forwards errors to next", () => {
        const err = new Error("provider down")
        passportResolves(err, false)
        const res = mockRes()
        handleOAuthCallback("github")({} as Request, res, next)
        expect(next).toHaveBeenCalledWith(err)
        expect(res.redirect).not.toHaveBeenCalled()
    })
})
