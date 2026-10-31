import { prisma } from "../src/repos/client.js"
import { Role } from "../src/generated/prisma/enums.js"

const READERS = [
    { username: "anna_dev", email: "anna@demo.local" },
    { username: "bjorn_codes", email: "bjorn@demo.local" },
    { username: "chen_ops", email: "chen@demo.local" },
    { username: "dana_writes", email: "dana@demo.local" }
]

type DemoPost = {
    title: string
    content: string
    published: boolean
    comments: { reader: number; text: string }[]
    likes: number[]
}

const POSTS: DemoPost[] = [
    {
        title: "Getting started with Docker Compose",
        published: true,
        content: `---
tags: [docker, devops]
---

# Getting started with Docker Compose

Running a database and an API by hand gets old fast. Docker Compose lets you describe every service in one file and start them with a single command.

## The file

\`\`\`yaml
services:
  db:
    image: postgres:17
  api:
    build: .
    depends_on:
      - db
\`\`\`

## Volumes

Without a volume your data disappears with the container. A named volume keeps it between restarts, and \`docker compose down -v\` is the only thing that deletes it.

:::tip
Add a healthcheck to the database so the API waits until it actually accepts connections.
:::
`,
        comments: [
            { reader: 0, text: "The volume explanation finally made it click for me, thanks!" },
            { reader: 1, text: "How do you run migrations before the API starts?" },
            { reader: 2, text: "Would love a follow up about multi-stage builds." },
            { reader: 3, text: "depends_on alone doesn't wait for Postgres to be ready, worth mentioning." }
        ],
        likes: [0, 1, 2, 3]
    },
    {
        title: "Why I store posts as an AST",
        published: true,
        content: `---
tags: [markdown, architecture]
---

# Why I store posts as an AST

My posts are written in Markdown, but the API returns a syntax tree instead of HTML.

## Custom components

With remark directives I can write \`:::chart{}\` in a post and let the frontend decide what a chart looks like. The backend never needs to change when I add a new component.

:::callout
The tree is parsed on every request. It's cheap at this size, and caching it would be the next step.
:::
`,
        comments: [
            { reader: 2, text: "Neat idea, but doesn't the frontend need to know every directive?" },
            { reader: 0, text: "Do you sanitise anything before rendering?" }
        ],
        likes: [0, 2]
    },
    {
        title: "Linking OAuth providers without account takeover",
        published: true,
        content: `---
tags: [security, oauth]
---

# Linking OAuth providers without account takeover

Merging accounts because two providers report the same email sounds friendly, but it lets anyone who controls that email on a weaker provider log into your account.

So my API refuses the merge. You log in first, then link the second provider while you're signed in.
`,
        comments: [{ reader: 3, text: "Great point about weaker providers, never thought about that." }],
        likes: [1, 2, 3]
    },
    {
        title: "Notes on rate limiting",
        published: false,
        content: `---
tags: [api]
---

# Notes on rate limiting

rate limiting is when you limit requests. i use express-rate-limit on the auth routes, 20 per 15 min.

TODO explain why, and the AI endpoint limit
`,
        comments: [],
        likes: []
    }
]

export const seedDemoData = async () => {
    if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed demo data in production")

    const email = process.env.ADMIN_EMAIL
    const owner = email ? await prisma.user.findUnique({ where: { email } }) : null
    if (!owner) throw new Error(`No user with ADMIN_EMAIL (${email}). Log in once with that account, then seed again.`)

    if (owner.role !== Role.AUTHOR) await prisma.user.update({ where: { id: owner.id }, data: { role: Role.AUTHOR } })

    await prisma.post.deleteMany({ where: { userId: owner.id, title: { in: POSTS.map(p => p.title) } } })
    await prisma.user.deleteMany({ where: { email: { in: READERS.map(r => r.email) } } })

    const readers = await Promise.all(READERS.map(data => prisma.user.create({ data })))

    for (const post of POSTS) {
        await prisma.post.create({
            data: {
                title: post.title,
                content: post.content,
                published: post.published,
                userId: owner.id,
                comments: { create: post.comments.map(c => ({ text: c.text, userId: readers[c.reader].id })) },
                userLikedPosts: { create: post.likes.map(i => ({ userId: readers[i].id })) }
            }
        })
    }

    return { owner: owner.email, posts: POSTS.length, readers: READERS.length }
}
