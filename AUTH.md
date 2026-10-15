# Authentication

TrackIt uses NextAuth v4 with the Prisma adapter and **database sessions**. The
session cookie holds only an opaque token. Deleting a row from `Session`
revokes that sign-in immediately.

## How tracking reads are authorised

`GET /api/tracking` (public):

1. Rejects every non-GET method with `405`.
2. Resolves the caller with `getServerSession`. No session or no user id → `401`.
3. If the client sends `userId`, it must equal the session user id, otherwise → `403`.
4. Forwards to `/api/internal/tracking` with `userId` set server-side, the
   allow-listed filters (`category`, `status`, `isFavorite`, `search`) and the
   `x-internal-secret` header. Client cookies and authorization headers are
   not forwarded.
5. The internal origin comes from `INTERNAL_API_ORIGIN`, then `NEXTAUTH_URL`,
   then `https://$VERCEL_URL`. It is never taken from the request's Host header.
   The origin must be HTTPS (plain HTTP only for `localhost`, `127.0.0.1`, `[::1]`).
   If the secret is missing or the origin is missing or not HTTPS, the route returns `503`.

Writes through the public route stay disabled (`405`). A signed-in user sees a
read-only notice when a write fails. Their list is never copied into the
browser-local demo storage that signed-out visitors use.

## Providers

Each provider is enabled only when its environment variables are set:

| Provider | Variables | OAuth callback URL |
| --- | --- | --- |
| Google | `NEXTAUTH_GOOGLE_CLIENT_ID`, `NEXTAUTH_GOOGLE_CLIENT_SECRET` | `<NEXTAUTH_URL>/api/auth/callback/google` |
| GitHub | `NEXTAUTH_GITHUB_CLIENT_ID`, `NEXTAUTH_GITHUB_CLIENT_SECRET` | `<NEXTAUTH_URL>/api/auth/callback/github` |
| Discord | `NEXTAUTH_DISCORD_CLIENT_ID`, `NEXTAUTH_DISCORD_CLIENT_SECRET` | `<NEXTAUTH_URL>/api/auth/callback/discord` |
| Email magic link | `EMAIL_SERVER`, `EMAIL_FROM` | — |

Accounts from different providers that share an email are **not** linked
automatically. NextAuth shows `OAuthAccountNotLinked` instead. This is
deliberate: it stops one provider from taking over another provider's account.

Also required in every environment: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`,
`INTERNAL_API_SECRET`, `DATABASE_URL`.

## Database migration (one-time baseline)

The production database was created with `prisma db push`, so it has no
migration history. `prisma/migrations/0_init` is a baseline that matches the
schema before auth was added. Mark it as applied once instead of running it,
then deploy the auth migration:

```bash
npx prisma migrate resolve --applied 0_init
npx prisma migrate deploy
```

`20261015000000_add_nextauth` adds `Account`, `Session` and `VerificationToken`,
adds `User.emailVerified`, and makes `User.email` nullable (GitHub may not
share an email).
