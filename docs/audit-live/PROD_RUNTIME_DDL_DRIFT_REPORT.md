# Production Runtime DDL Drift Report

## Verdict

**Status: `FAIL`**

The current Legacy API directory contains **58 PHP files with 126 runtime DDL term matches**. Production effects are unknown because the live schema was not captured.

## Confirmed patterns

- `CREATE TABLE IF NOT EXISTS` occurs during normal GET/POST requests.
- Conditional `ALTER TABLE` occurs in feature endpoints.
- Some newer helpers fail closed and require migrations, while older endpoints still mutate schema at request time.
- `players.php` can add `birth_year` and `gender` during a public list request.
- `community.php`, `devreq.php`, `guardian`/consent-related paths, photo/logo paths, match plan, check-in, training, and numerous other domains contain DDL terms.

## Why this blocks V2

Request ordering can determine the effective schema. The 29 SQL files therefore cannot reproduce production reliably, and file rollback cannot reverse a schema change already committed by MariaDB DDL.

It also makes ordinary public runtime verification unsafe under a strict read-only audit: loading the Community page calls `community.php`, which submits `CREATE TABLE IF NOT EXISTS`, and the public player list can submit conditional `ALTER TABLE`. The limited live GET checks in this audit may therefore have issued those statements. No direct SQL or write HTTP method was used, and whether any schema actually changed is `UNKNOWN`.

## Required classification after snapshot

Every runtime DDL site must be classified:

| Class | Action |
|---|---|
| Object exists exactly as expected | Replace request-time DDL with a fail-closed readiness check in the future owner code. |
| Object exists with drift | Create reviewed additive reconciliation migration; no destructive repair. |
| Object absent and feature inactive | Keep feature disabled; do not let a request create it. |
| Object absent and feature required | Add canonical migration only after backup/restore gate. |
| Cannot map | `UNKNOWN`; block ownership transfer. |

No Legacy file is modified by this report.
