import { afterAll, beforeEach } from "vitest"
import { prisma } from "../../src/repos/client.js"
import { assertTestDatabase } from "./assertTestDatabase.js"

assertTestDatabase(process.env.DATABASE_URL)

beforeEach(async () => {
    await prisma.$executeRawUnsafe(
        `TRUNCATE users, accounts, posts, comments, user_liked_post, post_feedback RESTART IDENTITY CASCADE`
    )
})

afterAll(async () => {
    await prisma.$disconnect()
})
