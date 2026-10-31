import { describe, it, expect, vi, afterEach } from "vitest"
import { seedDemoData } from "../../prisma/demoData.js"
import { createPost, createUser, prisma } from "./helpers.js"

afterEach(() => {
    vi.unstubAllEnvs()
})

const counts = async () => ({
    posts: await prisma.post.count(),
    users: await prisma.user.count(),
    comments: await prisma.comment.count(),
    likes: await prisma.userLikedPost.count()
})

describe("seedDemoData", () => {
    it("refuses to run in production", async () => {
        await createUser("AUTHOR", process.env.ADMIN_EMAIL)
        vi.stubEnv("NODE_ENV", "production")

        await expect(seedDemoData()).rejects.toThrow("production")
        expect(await prisma.post.count()).toBe(0)
    })

    it("asks you to log in first when the ADMIN_EMAIL user doesn't exist", async () => {
        await expect(seedDemoData()).rejects.toThrow("Log in once")
        expect(await prisma.user.count()).toBe(0)
    })

    it("creates posts for the owner with comments and likes from demo readers", async () => {
        const owner = await createUser("AUTHOR", process.env.ADMIN_EMAIL)

        expect(await seedDemoData()).toEqual({ owner: owner.email, posts: 4, readers: 4 })

        const posts = await prisma.post.findMany({ include: { comments: true, userLikedPosts: true } })
        expect(posts.every(p => p.userId === owner.id)).toBe(true)
        expect(posts.filter(p => !p.published)).toHaveLength(1)
        expect(posts.some(p => p.comments.length >= 4)).toBe(true)
        expect(await prisma.user.count({ where: { email: { endsWith: "@demo.local" } } })).toBe(4)
    })

    it("can run again without creating duplicates", async () => {
        await createUser("AUTHOR", process.env.ADMIN_EMAIL)

        await seedDemoData()
        const first = await counts()
        await seedDemoData()
        expect(await counts()).toEqual(first)
    })

    it("leaves your own posts and users alone", async () => {
        const owner = await createUser("AUTHOR", process.env.ADMIN_EMAIL)
        const other = await createUser()
        const mine = await createPost(owner.id, { title: "My real post" })
        const theirs = await createPost(other.id)

        await seedDemoData()
        await seedDemoData()

        expect(await prisma.post.findUnique({ where: { id: mine.id } })).not.toBeNull()
        expect(await prisma.post.findUnique({ where: { id: theirs.id } })).not.toBeNull()
        expect(await prisma.user.findUnique({ where: { id: other.id } })).not.toBeNull()
    })

    it("makes the owner an AUTHOR", async () => {
        const owner = await createUser("USER", process.env.ADMIN_EMAIL)

        await seedDemoData()
        expect((await prisma.user.findUnique({ where: { id: owner.id } }))?.role).toBe("AUTHOR")
    })
})
