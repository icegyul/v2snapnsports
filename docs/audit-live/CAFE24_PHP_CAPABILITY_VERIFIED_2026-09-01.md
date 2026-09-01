# Cafe24 PHP capability — VERIFIED 2026-09-01

Measured, not inferred. `tools`/`.github/workflows/probe-cafe24-php.yml` uploaded one
read-only capability report to `api/v1/`, read it over HTTPS, and removed it again;
the probe URL returns 404 afterwards and `https://snapnsports.com/v2/` still returns 200.
No database connection was opened, no V1 file was touched, and no secret travelled the
(plaintext) FTP transport.

This supersedes the `PRODUCTION_UNVERIFIED` entries for PHP runtime facts in
`docs/audit/LEGACY_DEPLOYMENT_MAP.md` and `docs/audit-live/V2_DEPLOYMENT_TARGET.md`.
It does **not** supersede the database, backup, or TLS-policy gaps, which remain open.

## Measured

| Fact | Value |
|---|---|
| PHP | 8.2.31 (`apache2handler`) |
| Web server | Apache |
| HTTPS visible to PHP | yes (`HTTPS` on, `X-Forwarded-Proto: https`) |
| `mysqli` / `pdo_mysql` | yes / yes |
| `openssl` / `mbstring` / `json` | yes / yes / yes |
| `sodium` | **no** |
| `password_hash` bcrypt | yes (`PASSWORD_DEFAULT` = `2y`) |
| `password_hash` argon2id | **no** |
| `random_bytes` | yes |
| memory_limit | 256M |
| max_execution_time | 30s |
| post_max_size / upload_max_filesize | 100M / 100M |
| temp dir writable | yes |
| `api/v1/` serves and executes PHP | yes (HTTP 200 from a newly created directory) |

## What this settles for the V2 auth service

- **PHP 8.2 is modern enough** for typed properties, enums, and `match` — no legacy
  compatibility shims are needed.
- **Passwords: bcrypt via `password_hash`/`password_verify`.** Argon2id is unavailable,
  so bcrypt is the choice, with `password_needs_rehash` on login so a future cost or
  algorithm change migrates users transparently.
- **Session tokens: `random_bytes(32)`,** stored server-side as a hash. `sodium` is
  absent, so no libsodium primitives; `random_bytes` plus `hash_equals` covers what a
  session token needs.
- **Secure cookies are viable** — PHP sees HTTPS, so `Secure`, `HttpOnly` and
  `SameSite` can all be set truthfully. (Capacitor still needs its own decision.)
- **30s execution limit** rules out long synchronous work in a request; anything
  heavier must be chunked or deferred.

## Still blocked

- **No V2 database.** `docs/audit-live/V2_STORAGE_DECISION.md` rejects new V2 writes to
  the legacy MariaDB, and no separate database is provisioned. Whether the hosting plan
  allows an additional database is an owner question and gates schema work.
- **DB credentials not provided** — `BLOCKED_CREDENTIAL_NOT_PROVIDED`. They must not
  travel the plaintext FTP pipe; the config file has to be placed out-of-band by the
  owner and kept outside the deployment set.
- The canonical API contract (`v1.4` OpenAPI) declares **no login/logout/refresh
  endpoints** — it consumes a bearer token from an external IdP. V2-owned credential
  endpoints are a documented extension, not an implementation of that contract.
