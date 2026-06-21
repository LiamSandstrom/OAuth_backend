# OAuth Blog backend API 

A backend for a blog. Users sign in with Google or GitHub, write posts in Markdown and easily post and manage the blog from the CLI. 
Primarily written to learn OAuth & make a CLI friendly Blog :)

## Stack

- **API** — Node.js + Express
- **DB** — PostgreSQL + Prisma
- **CLI** — Go (`blogapi`)

## Setup

```bash
npm install
cp example.env .env         # You still need to fill in OAuth providers and DB
npx prisma migrate dev
npx prisma generate
npm run dev
```

## Routes

### Posts
| Method | Path |
|---|---|
| `GET` | `/posts` |
| `GET` | `/posts/:id` |
| `GET` | `/posts/:id/comments` |
| `GET` | `/posts/:id/comments/:commentId` |
| `POST` | `/posts/:id/comments` |
| `PATCH` | `/posts/:id/comments/:commentId` |
| `DELETE` | `/posts/:id/comments/:commentId` |
| `GET` | `/posts/:id/likes` |
| `POST` | `/posts/:id/likes` |
| `DELETE` | `/posts/:id/likes` |

### Users
| Method | Path |
|---|---|
| `GET` | `/users/protected` |
| `PATCH` | `/users/:id` |
| `DELETE` | `/users/:id` |

### Auth
| Method | Path |
|---|---|
| `GET` | `/auth/google` |
| `GET` | `/auth/github` |
| `POST` | `/auth/logout` |

### Admin
| Method | Path |
|---|---|
| `POST` | `/admin/posts` |
| `GET` | `/admin/posts` |
| `GET` | `/admin/posts/:id` |
| `PATCH` | `/admin/posts/:id` |
| `DELETE` | `/admin/posts/:id` |
| `PATCH` | `/admin/users/:id` |
| `DELETE` | `/admin/users/:id` |

## Post Format

Posts are written in Markdown with YAML frontmatter. You can embed custom components using [remark directives](https://github.com/remarkjs/remark-directive):

```markdown
---
title: My Post
---

# Hello

:::mycomponent{}
:::

Regular content.
```

The server parses each post into a static AST. The frontend can update or create new components freely without touching the backend.

## Admin CLI

```bash
cd cli && go build -o blogapi .
```

```
blogapi post $title $filepath
blogapi edit-post $id [--title] [--filepath]
blogapi publish $id
blogapi unpublish $id
blogapi posts [--id] [--title] [--include-comments] [--page] [--limit]
blogapi delete-user $id
blogapi get-comment [--id | --text]
blogapi delete-comment $id
```

Reads `BLOGAPI_URL` and `BLOGAPI_TOKEN` from env.
