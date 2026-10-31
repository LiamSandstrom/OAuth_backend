# OAuth Blog backend API

[![CI](https://github.com/LiamSandstrom/OAuth_backend/actions/workflows/ci.yml/badge.svg)](https://github.com/LiamSandstrom/OAuth_backend/actions/workflows/ci.yml)

A backend for a blog. Users sign in with Google or GitHub, write posts in Markdown and easily post and manage the blog from the CLI.
Primarily written to learn OAuth & make a CLI friendly Blog :)

## Stack

- **API** — Node.js + Express 5 + TypeScript
- **DB** — PostgreSQL + Prisma
- **Auth** — Passport (Google & GitHub OAuth) + JWT in an httpOnly cookie
- **CLI** — Go (`blogapi`)
- **Tests** — Vitest + Supertest
- **Infra** — Docker, GitHub Actions

## How it works

### Auth

Signing in with Google or GitHub gives you a JWT in an httpOnly cookie. One user can have both providers linked:

- Logging in with a new provider while already signed in links it to your account.
- A provider that already belongs to someone else can't be linked.
- If a new login has the same email as an existing user, it's refused instead of silently merged. Otherwise anyone controlling that email on another provider could take over the account. Log in first, then link.
- You can't unlink your last provider.

There is one author: the user whose email is `ADMIN_EMAIL`. The role is set when that user logs in, so changing `ADMIN_EMAIL` and logging in again moves it. Nobody can change their email to `ADMIN_EMAIL` or set roles through the API.

### Roles

| Who | How | Can |
|---|---|---|
| Visitor | No cookie | Read published posts, comments and likes |
| `USER` | OAuth cookie | Comment, like, manage own account |
| `AUTHOR` | Logged in as `ADMIN_EMAIL` | All of the above + see drafts, users and accounts, get AI feedback on own posts |
| Admin | `Authorization: Bearer $ADMIN_API_KEY` | Create, edit and publish posts, moderate comments and users. Used by the CLI |

### Errors

Every error response looks like `{ "message": "..." }` with a matching status code (400 validation, 401 not logged in, 403 not yours, 404, 409 duplicate, 429 rate limited).

## Setup

```bash
npm install
cp example.env .env         # You still need to fill in OAuth providers and DB
npx prisma migrate dev
npm run dev
```

### Docker

```bash
cp example.env .env         # Fill in OAuth providers, DATABASE_URL is set by compose
docker compose up --build
```

Starts Postgres, runs the migrations and serves the API on `http://localhost:3000`.

### Env

| Variable | |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Signs the login cookie |
| `ADMIN_API_KEY` | Key for `/admin` and the CLI |
| `ADMIN_EMAIL` | The blog owner. Logging in with this email gives the `AUTHOR` role, and posts created with the CLI belong to this user. Log in with OAuth once to create the user |
| `NODE_ENV` | `development` / `production` |
| `GOOGLE_*`, `GITHUB_*` | OAuth client id, secret and callback url |
| `ANTHROPIC_API_KEY` | Optional. Needed for AI feedback on posts |
| `CORS_ORIGIN` | Optional. Comma separated frontend origins allowed to use the cookie |
| `PORT` | Optional. Defaults to `3000` |

## Testing

Tests use [Vitest](https://vitest.dev) and [Supertest](https://github.com/ladjs/supertest), split into two projects:

- **Unit** (`tests/unit`): validation schemas, helpers, middleware and the OAuth login/linking logic, with the DB mocked out.
- **Integration** (`tests/integration`): every route hit over HTTP against a real Postgres, covering auth, ownership checks and error codes.

Integration tests run against a throwaway Postgres on port 5433 configured in `.env.test`, and refuse to run against any database whose name doesn't contain `test`.

```bash
npm run test:db:up        # start the test database
npm test                  # run everything
npm run test:unit         # no database needed
npm run test:coverage
npm run test:db:down
```

CI runs lint, format check, type check and the full test suite on every push, and builds the CLI and Docker image.

```bash
npm run lint
npm run format
npm run typecheck
```

## Routes

### Posts
| Method | Path | Access |
|---|---|---|
| `GET` | `/posts` | Public |
| `GET` | `/posts/:id` | Public |
| `POST` | `/posts/:id/feedback` | `AUTHOR`, own post |
| `GET` | `/posts/admin` | `AUTHOR` |
| `GET` | `/posts/admin/:id` | `AUTHOR` |
| `GET` | `/posts/:id/comments` | Public |
| `GET` | `/posts/:id/comments/:commentId` | Public |
| `POST` | `/posts/:id/comments` | Logged in |
| `PATCH` | `/posts/:id/comments/:commentId` | Comment owner |
| `DELETE` | `/posts/:id/comments/:commentId` | Comment or post owner |
| `GET` | `/posts/:id/likes` | Public |
| `POST` | `/posts/:id/likes` | Logged in |
| `DELETE` | `/posts/:id/likes` | Logged in |

`GET /posts` takes `?title=`, `?page=`, `?limit=` (default 20, max 100) and `?withComments=true`. `GET /posts/:id` returns the parsed post, add `?format=raw` for the Markdown.

`POST /posts/:id/feedback` asks Claude for feedback on one of your posts. Drafts get feedback on the writing itself; published posts also send the like count and up to 50 comments (text only, no usernames) so the feedback covers how readers responded. Answers are cached in the database: a draft is only sent again when its title, content or the prompt changes, and a published post when that changes or it has 3 new comments since the last answer. The response says whether it was `cached`. Limited to 10 requests per hour per user, and returns 503 if the AI service is unavailable.

### Users
| Method | Path | Access |
|---|---|---|
| `GET` | `/users` | `AUTHOR` |
| `GET` | `/users/protected` | Logged in |
| `GET` | `/users/:id` | `AUTHOR` |
| `PATCH` | `/users/:id` | Self |
| `DELETE` | `/users/:id` | Self |

### Accounts
| Method | Path | Access |
|---|---|---|
| `GET` | `/accounts` | `AUTHOR` |
| `GET` | `/accounts/:id` | Owner or `AUTHOR` |
| `DELETE` | `/accounts/:id` | Owner, unlinks the provider |

### Auth
| Method | Path |
|---|---|
| `GET` | `/auth/google` |
| `GET` | `/auth/google/callback` |
| `GET` | `/auth/github` |
| `GET` | `/auth/github/callback` |
| `GET` | `/auth/failure` |
| `POST` | `/auth/logout` |

Rate limited to 20 requests per 15 minutes.

### Admin
All need the `ADMIN_API_KEY`.

| Method | Path |
|---|---|
| `POST` | `/admin/posts` |
| `GET` | `/admin/posts` |
| `GET` | `/admin/posts/:id` |
| `PATCH` | `/admin/posts/:id` |
| `DELETE` | `/admin/posts/:id` |
| `PATCH` | `/admin/users/:id` |
| `DELETE` | `/admin/users/:id` |
| `GET` | `/admin/comments` |
| `DELETE` | `/admin/comments/:commentId` |

### Health
| Method | Path |
|---|---|
| `GET` | `/health` |

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

Posts are stored as Markdown and parsed into an AST when requested. The frontend can update or create new components freely without touching the backend.

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
blogapi delete-user $id
blogapi get-comment < --id | --text >
blogapi delete-comment $id
```

Reads `BASE_URL` and `ADMIN_API_KEY` from env or a `.env` file. New posts belong to the `ADMIN_EMAIL` user and are drafts until you `publish` them.
