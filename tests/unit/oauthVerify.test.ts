import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Request } from "express"
import type { VerifyCallback } from "passport-oauth2"
import { oauthVerify } from "../../src/auth/oauthVerify.js"
import * as repo from "../../src/repos/userRepository.js"

vi.mock("../../src/repos/userRepository.js", () => ({
    getAccountWithUser: vi.fn(),
    getUserWithEmail: vi.fn(),
    linkAccountToUser: vi.fn(),
    createUserWithAccount: vi.fn()
}))

const profile = { id: "gh-123", provider: "github", emails: [{ value: "me@example.com" }] }
const user = { id: 1, role: "USER" as const }
const otherUser = { id: 2, role: "USER" as const }

const loggedIn = { user } as Request
const anonymous = {} as Request

let done: VerifyCallback
beforeEach(() => {
    vi.resetAllMocks()
    done = vi.fn()
})

describe("oauthVerify when already logged in (linking a provider)", () => {
    it("refuses if the provider is already linked to this user", async () => {
        vi.mocked(repo.getAccountWithUser).mockResolvedValue({ user } as never)
        await oauthVerify(loggedIn, profile, done)
        expect(done).toHaveBeenCalledWith(null, false, {
            message: expect.stringContaining("already linked to your account")
        })
        expect(repo.linkAccountToUser).not.toHaveBeenCalled()
    })

    it("refuses if the provider belongs to another user", async () => {
        vi.mocked(repo.getAccountWithUser).mockResolvedValue({ user: otherUser } as never)
        await oauthVerify(loggedIn, profile, done)
        expect(done).toHaveBeenCalledWith(null, false, { message: expect.stringContaining("another user") })
        expect(repo.linkAccountToUser).not.toHaveBeenCalled()
    })

    it("links a new provider to the current user", async () => {
        vi.mocked(repo.getAccountWithUser).mockResolvedValue(null)
        await oauthVerify(loggedIn, profile, done)
        expect(repo.linkAccountToUser).toHaveBeenCalledWith({ provider: "github", providerId: "gh-123" }, user.id)
        expect(done).toHaveBeenCalledWith(null, user)
    })
})

describe("oauthVerify when anonymous (login / sign up)", () => {
    it("logs in the owner of an existing account", async () => {
        vi.mocked(repo.getAccountWithUser).mockResolvedValue({ user } as never)
        await oauthVerify(anonymous, profile, done)
        expect(done).toHaveBeenCalledWith(null, user)
        expect(repo.createUserWithAccount).not.toHaveBeenCalled()
    })

    it("refuses when the provider has no public email", async () => {
        vi.mocked(repo.getAccountWithUser).mockResolvedValue(null)
        await oauthVerify(anonymous, { ...profile, emails: [] }, done)
        expect(done).toHaveBeenCalledWith(null, false, { message: expect.stringContaining("No email") })
        expect(repo.createUserWithAccount).not.toHaveBeenCalled()
    })

    it("refuses to silently merge into an existing user with the same email", async () => {
        vi.mocked(repo.getAccountWithUser).mockResolvedValue(null)
        vi.mocked(repo.getUserWithEmail).mockResolvedValue(otherUser as never)
        await oauthVerify(anonymous, profile, done)
        expect(done).toHaveBeenCalledWith(null, false, { message: expect.stringContaining("Log in first") })
        expect(repo.createUserWithAccount).not.toHaveBeenCalled()
    })

    it("creates a new user for a brand new account", async () => {
        const created = { id: 9, role: "USER" }
        vi.mocked(repo.getAccountWithUser).mockResolvedValue(null)
        vi.mocked(repo.getUserWithEmail).mockResolvedValue(null)
        vi.mocked(repo.createUserWithAccount).mockResolvedValue(created as never)
        await oauthVerify(anonymous, profile, done)
        expect(repo.createUserWithAccount).toHaveBeenCalledWith(
            { provider: "github", providerId: "gh-123" },
            "me@example.com"
        )
        expect(done).toHaveBeenCalledWith(null, created)
    })
})

it("passes repository errors to done", async () => {
    const err = new Error("db down")
    vi.mocked(repo.getAccountWithUser).mockRejectedValue(err)
    await oauthVerify(anonymous, profile, done)
    expect(done).toHaveBeenCalledWith(err)
})
