# V2 auth service (Cafe24, PHP 8.2)

V2 owns its own accounts. There is no Rhymix member integration, and nothing
here reads or writes a table outside the `snapn_v2_` prefix.

## Why these choices

**Opaque session tokens, not JWT.** The security gap report requires a session
the server can revoke the instant an account is suspended, which a
self-contained token cannot give. Opaque tokens also need no signing secret,
and inventing one is forbidden. Only a SHA-256 of the token is stored, so
reading the database does not let anyone impersonate a user.

**bcrypt.** Measured on the host: `argon2id` and `sodium` are unavailable,
`bcrypt` is. Sign-in re-hashes transparently when the cost changes.

**No DDL at request time.** The existing V1 endpoints create and alter tables
while serving traffic; `schema/001_auth.sql` is run once, by hand, by the
owner.

## Layout

- `schema/001_auth.sql` — tables. Run once against the database.
- `src/Auth.php` — the rules: validation, hashing, tokens, minor handling,
  session lifetime, rate-limit thresholds. No database, no HTTP.
- `tests/AuthTest.php` — `php api-v2/tests/AuthTest.php`. No composer, no
  extensions beyond core PHP.

## Configuration — never in this repository, never over FTP

Database credentials are `BLOCKED_CREDENTIAL_NOT_PROVIDED` until the owner
places them on the server. The deploy pipeline speaks **plaintext FTP** (the
host does not offer TLS), so credentials must not travel it. The owner uploads
`config.php` once, out of band, and the deployment set never contains it.

## Status

Rules and schema only. No endpoint is deployed, no database is connected, and
sign-in in the app reports `BACKEND_UNAVAILABLE` until that changes.
