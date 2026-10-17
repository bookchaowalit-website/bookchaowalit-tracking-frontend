# Authentication

TrackIt uses NextAuth v4 with the Prisma adapter and **database sessions**. The
session cookie holds only an opaque token. Deleting a row from `Session`
revokes that sign-in immediately.

## How tracking reads are authorised

`GET /api/tracking` (public):

1. Each exported handler accepts only its own method. Anything else
   (`OPTIONS`, `HEAD`, a mismatched method) gets `405` with
   `Allow: GET, POST, PUT, DELETE`.
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

## How tracking writes are authorised

`POST`, `PUT` and `DELETE /api/tracking` follow the same steps as reads, plus:

1. **Session first.** No session → `401` before the body is read.
2. **userId from the session only.** A `userId` in the query or the JSON body
   that is not the session user (including `null`) → `403`. The forwarded
   request always carries the session user id, set last so the body cannot
   replace it.
3. **CSRF.** NextAuth's cookie is `SameSite=Lax`. On top of that a write must
   have an `Origin` equal to the `NEXTAUTH_URL` or `https://$VERCEL_URL` origin
   (from configuration, never the Host header), must not carry
   `Sec-Fetch-Site` other than `same-origin`, and must be
   `Content-Type: application/json`. Failing the origin checks → `403`; a
   non-JSON content type → `415`.
4. **Allow-listed body** (zod, strict; unknown keys → `400`, bodies over 16 KB → `413`, enforced while reading the stream):
   - `POST`: `title`, `category`, `description`, `imageUrl`, `externalUrl`,
     `author`, `year`, `genres`, `totalEpisodes`, `totalChapters`,
     `totalBooks`, `status`, `rating`, `progress`, `priority`, `isFavorite`.
     Links must be `http(s)`.
   - `PUT`: `itemId`, `status`, `rating`, `progress`, `startDate`,
     `finishDate`, `priority`, `isFavorite`.
   - `DELETE`: `itemId` (JSON body; forwarded as a query parameter).
5. **Ownership.** Items are shared; a user owns their `UserTracking` row. The
   internal route loads that row by `(userId, itemId)` before an update or
   delete and writes with the same key. Another user's item, or a missing
   one, is `404` and nothing changes. Adding an item already on the list is `409`.

In the UI, signed-in changes go only to the API. Each write carries the user
id the page is showing, as an assertion only, so a stale tab whose cookie was
switched to another account in a different tab gets `403` instead of writing
to that account. A failed load or save shows
a notice; the signed-in list is never read from or written to the
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
