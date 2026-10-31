import jwt from "jsonwebtoken"
import { prisma } from "../../src/repos/client.js"
import { Provider, Role } from "../../src/generated/prisma/enums.js"

let seq = 0
const unique = () => `${Date.now().toString(36)}${seq++}`

export async function createUser(role: Role = Role.USER, email?: string) {
    const id = unique()
    return prisma.user.create({
        data: { username: `user_${id}`, email: email ?? `${id}@test.local`, role }
    })
}

export async function createPost(
    userId: number,
    overrides: Partial<{ title: string; content: string; published: boolean }> = {}
) {
    return prisma.post.create({
        data: {
            title: "A test post",
            content: "---\ntags: [test]\n---\n# Hello\n\nSome body text.",
            published: true,
            userId,
            ...overrides
        }
    })
}

export async function createComment(postId: number, userId: number, text = "Nice post!") {
    return prisma.comment.create({ data: { postId, userId, text } })
}

export async function createAccount(userId: number, provider: Provider = Provider.google) {
    return prisma.account.create({
        data: { userId, provider, providerId: unique() }
    })
}

export function tokenFor(user: { id: number; role: string }, secret = process.env.JWT_SECRET!) {
    return jwt.sign({ id: user.id, role: user.role }, secret)
}

export const authCookie = (user: { id: number; role: string }) => [`jwt_token=${tokenFor(user)}`]

export const adminHeader = () => ({ Authorization: `Bearer ${process.env.ADMIN_API_KEY}` })

export { prisma }
