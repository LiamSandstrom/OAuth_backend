# OAuth Blog backend API

[![CI](https://github.com/LiamSandstrom/OAuth_backend/actions/workflows/ci.yml/badge.svg)](https://github.com/LiamSandstrom/OAuth_backend/actions/workflows/ci.yml)

A backend for a blog. Users sign in with Google or GitHub, posts are written in Markdown and the blog is managed from a Go CLI.
Primarily written to learn OAuth & make a CLI friendly Blog :)

**Stack:** Node.js, Express 5, TypeScript, PostgreSQL + Prisma, Passport (Google & GitHub OAuth), JWT, Go, Vitest, Docker, GitHub Actions

## How it works

### Auth

Signing in gives you a JWT in an httpOnly cookie that lasts one day. One user can link both providers:

- Logging in with a new provider while signed in links it to your account. A provider that belongs to someone else can't be linked.
- A new login with the same email as an existing user is refused instead of merged, so nobody can take over an account through another provider. Log in first, then link.
- You can't unlink your last provider.

There is one author: the user whose email is `ADMIN_EMAIL`. The role is set on login, and nobody can set roles or take that email through the API.

| Who | How | Can |
|---|---|---|
| Visitor | No cookie | Read published posts, comments and likes |
| `USER` | OAuth cookie | Comment, like, manage own account |
| `AUTHOR` | Logged in as `ADMIN_EMAIL` | All of the above + see drafts, users and accounts, AI feedback on own posts |
| Admin | `Authorization: Bearer $ADMIN_API_KEY` | Create, edit and publish posts, moderate comments and users. Used by the CLI |

Errors always look like `{ "message": "..." }` with a matching status (400, 401, 403, 404, 409, 429).

### AI feedback

`POST /posts/:id/feedback` asks Claude for feedback on your post. Drafts get feedback on the writing. Published posts also send the like count and up to 50 comments (text only, no usernames).

Answers are cached in the database and only regenerated when the post or prompt changes, or a published post gets 3 new comments. The CLI uses `/admin/posts/:id/feedback`, which shares the cache. Limited to 10 requests per hour, and returns 503 if the AI is unavailable.

### Posts

Posts are Markdown with YAML frontmatter and can embed custom components with [remark directives](https://github.com/remarkjs/remark-directive) like `:::mycomponent{}`. They're stored as Markdown and parsed into an AST when requested, so the frontend decides how each node renders without touching the backend.

## Setup

```bash
npm install
cp example.env .env         # Fill in OAuth providers and DB
npx prisma migrate dev
npm run dev
```

Or with Docker, which starts Postgres, runs migrations and serves the API on `http://localhost:3000`:

```bash
docker compose up --build
```

For demo data, log in once with your `ADMIN_EMAIL` account and run `npm run db:seed` (Docker: `docker compose run --rm migrate npm run db:seed`). It only replaces its own demo posts and readers and refuses to run in production.

| Env | |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Signs the login cookie |
| `ADMIN_API_KEY` | Key for `/admin` and the CLI |
| `ADMIN_EMAIL` | The blog owner and only author. Log in once to create the user |
| `NODE_ENV` | `development` / `production` |
| `GOOGLE_*`, `GITHUB_*` | OAuth client id, secret and callback url |
| `ANTHROPIC_API_KEY` | Optional. Needed for AI feedback |
| `CORS_ORIGIN` | Optional. Comma separated frontend origins |
| `PORT` | Optional. Defaults to `3000` |

## Testing

Unit tests mock the database. Integration tests hit every route over HTTP against a throwaway Postgres on port 5433, and refuse to run against a database without `test` in its name.

```bash
npm run test:db:up        # start the test database
npm test                  # unit + integration
npm run test:unit         # no database needed
npm run lint && npm run typecheck
```

CI runs lint, format, typecheck, all tests and the Go tests on every push, and builds the CLI and Docker image.

## Routes

| Path | Methods |
|---|---|
| `/posts` | `GET` public |
| `/posts/:id` | `GET` public, `?format=raw` for Markdown |
| `/posts/:id/feedback` | `POST` author, own post |
| `/posts/admin`, `/posts/admin/:id` | `GET` author, includes drafts |
| `/posts/:id/comments` | `GET` public, `POST` logged in |
| `/posts/:id/comments/:commentId` | `GET` public, `PATCH` comment owner, `DELETE` comment or post owner |
| `/posts/:id/likes` | `GET` public, `POST` / `DELETE` logged in |
| `/users` | `GET` author |
| `/users/protected` | `GET` logged in |
| `/users/:id` | `GET` author, `PATCH` / `DELETE` self |
| `/accounts` | `GET` author |
| `/accounts/:id` | `GET` owner or author, `DELETE` owner (unlinks provider) |
| `/auth/google`, `/auth/github` + `/callback` | OAuth login, 20 requests per 15 min |
| `/auth/failure`, `/auth/logout` | `GET`, `POST` |
| `/admin/posts` | `GET`, `POST` |
| `/admin/posts/:id` | `GET`, `PATCH`, `DELETE` |
| `/admin/posts/:id/feedback` | `POST` |
| `/admin/users/:id` | `PATCH`, `DELETE` |
| `/admin/comments` | `GET` |
| `/admin/comments/:commentId` | `DELETE` |
| `/health` | `GET`, checks the database |

Post listings take `?title=`, `?page=`, `?limit=` (default 20, max 100) and `?withComments=true`. Author and admin listings also take `?published=true|false`.

## Admin CLI

```bash
go build -o blogapi ./cmd/blogapi
```

```
blogapi post $title $filepath
blogapi edit-post $id < --title | --filepath >
blogapi publish $id
blogapi unpublish $id
blogapi posts [--id] [--title] [--include-comments] [--page] [--limit]
blogapi drafts [--id] [--title] [--page] [--limit]
blogapi delete-user $id
blogapi get-comment < --id | --text >
blogapi delete-comment $id
blogapi feedback $id
```

Output is made to be human readable, add `--json` for the raw API response.`blogapi posts --json | jq -r '.[0].content'`.
