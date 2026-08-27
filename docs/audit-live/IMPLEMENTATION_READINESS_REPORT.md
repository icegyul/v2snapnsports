# SnapN Sports V2 Implementation Readiness Report

## Decision

The audit cleared several **design** blockers: the authorization decision sequence, Community safety minimum, transitional runtime direction, storage direction, first read-only slice, adapter policies, and failing-test contract are now written. Operational P0 blockers remain.

## Readiness matrix

| Area | Status | Evidence and blocker |
|---|---|---|
| Production DB | `FAIL` | No live schema/count/index/FK/engine/ledger inventory; D-12 endpoint is 404 and no credential path supplied |
| Backup | `FAIL` | App/API artifact backups exist; DB/media/config backup source, schedule, encryption, and retention unknown |
| Restore | `FAIL` | No isolated restore target or rehearsal |
| Auth | `FAIL` | Current auth exists, but JWT/session/revocation/denied-token behavior unknown |
| RBAC | `FAIL` | Canonical contract frozen; authenticated negative matrix not run and V1 authorities overlap |
| Guardian/Consent | `FAIL` | V1 approval/code flows exist; typed relationship, revocation, versioned scope/evidence, and tests absent |
| Community | `CONDITIONAL PASS` | Public screen and core code behavior mapped; full production fixtures/data/count parity absent |
| Community Safety | `FAIL` | Historical/news HTML sanitizer and CSP absent; moderation/report/block/mute/visibility minimum not implemented |
| Media | `FAIL` | Code-only paths; no physical manifest, ownership lifecycle, backup, or restore |
| Deployment | `FAIL` | Transitional target selected, but exact PHP/server/path/security/log/rollback facts and V2 scripts absent |
| Secrets | `UNKNOWN` | Legacy values correctly absent; approved V2 secure-store/config owner/path not fixed |
| Legacy Adapter | `CONDITIONAL PASS` | Read-only architecture/mapping/error/cache/test contracts frozen; implementation/integration absent |
| Rollback | `FAIL` | V1 artifact rollback exists; DB/media/V2 rollback not rehearsed |
| Test Contract | `PASS` | Required pre-implementation failing matrix defined; execution remains pending |

## A. DB verdict

`FAIL`. Repository evidence confirms 29 migration candidates and 58 API files with 126 runtime DDL matches, but it does not prove production structure. The safe collectors require out-of-band access that was not available. No schema, count, index, FK, collation, orphan, duplicate, or applied-ledger snapshot was produced.

## B. Backup/restore verdict

`FAIL`. Local guarded backups protect selected web/API artifacts only. No DB/media backup source, encrypted acceptance record, retention, RPO/RTO, isolated restore target, or successful rehearsal was verified.

## C. Auth/RBAC verdict

`FAIL`. Current password/JWT/group/team/guardian flows are mapped. The V2 canonical decision contract is frozen, but JWT security properties, subject revocation, cross-team/cross-tenant denial, multi-role precedence, tenant boundary, typed guardian relationships, and consent evidence remain unverified or absent.

## D. Community verdict

Public inventory is `CONDITIONAL PASS`; cutover is `FAIL`. The live screen showed Community, prediction, leaderboard, news, posts, and YouTube. Core endpoint behavior is mapped, and sampled public allowlists are clean. However, Legacy GET handlers contain runtime DDL, so the public sample cannot be certified as SQL-read-only; no direct SQL/write method was used, but actual no-op/change status is `UNKNOWN`. Full parity fixtures, sanitizer/CSP, moderation, report/block/mute, media restore, concurrency/count, notification, stable deep-link, and authenticated safety tests are missing. V1 remains the sole write owner. `Feed Intelligence = OFF` and `SPORTS_AI` is excluded from V2.

## E. Media verdict

`FAIL`. Player photos, team logos, and card paths/validation are code-confirmed, but actual files, owners, public/private/minor classification, orphans, backup, restore, CDN/cache, retention, delete, and consent-revocation behavior are not verified.

## F. V2 runtime decision

`CONTRACT_FROZEN / PHYSICAL TARGET BLOCKED`.

- React + Vite + TypeScript, React Router, TanStack Query, React state/context.
- Separate `/v2/` PWA scope; existing `/app/` and Capacitor shell unchanged.
- Thin GET-only PHP compatibility/BFF adapter under `/api/v1/`; no direct DB in slice 1.
- No V2 persistence in slice 1. PostgreSQL remains the later canonical target after operational gates.
- Redis/queue/worker/object-storage dependencies are rejected for slice 1; S3-compatible private media storage is the later direction.
- Transitional Cafe24 deployment is recommended only after exact runtime/security/operations verification.

## G. First adapter decision

`CONDITIONAL PASS` as design. The first slice is User + Player + Team + Guardian + Schedule, read-only, in-memory, with V1 retaining every write. It excludes Community detail side effects, media movement, private-data expansion, AI/wearable/tactics, DB access, and all write methods.

## H. Remaining P0 blockers

1. Approved and completed production DB inventory.
2. DB/media/config backup source plus encrypted acceptance.
3. Successful isolated DB and media restore rehearsal.
4. Production migration/object ledger reconciliation and runtime DDL retirement plan.
5. JWT/session/subject-revocation operational contract.
6. Authenticated RBAC, guardian, safeguarding, cross-team, and cross-tenant deny tests.
7. Historical Community HTML sanitizer, CSP/security headers, and minimum moderation implementation.
8. Media manifest, ownership/consent lifecycle, backup/restore, and authorized delivery design.
9. Exact V2 PHP/deployment path, security headers, secret provisioning, logging, monitoring, rollback scripts, and old-client overlap proof.
10. Named operators/reviewers and physical infrastructure approvals.

## I. Generated documents

All requested DB, backup/restore, auth/RBAC, Community, media, runtime, adapter, test, and final readiness documents were created under `docs/audit-live/`. `README.md` records the evidence labels and live-check boundary.

## J. Files changed

Only new Markdown files under the V2 `docs/audit-live/` directory. No runtime source, package manifest, config, migration, secret, build output, or Legacy file was edited. No direct production SQL, write method, migration, or deploy command was sent. Because sampled GET handlers contain runtime DDL, production no-op/change status cannot be proven and is recorded as `UNKNOWN`.

## K. V1 git status

- Branch: `codex/player-spatial-home-slice1`
- HEAD: `2cc39d2`
- Existing dirty state: 1 tracked modified entry and 8 untracked status entries at audit start.
- Treatment: user-owned, read-only; no reset, clean, add, commit, build, install, formatting, or deployment.

## L. V2 git status

V2 root is **not a Git repository**, so Git status/branch/HEAD are unavailable. Change verification must use the scoped file inventory until the user separately initializes or attaches Git.

## M. Gate evaluation

The required YES conditions for production DB, backup/restore, authenticated authorization, Community safety, media ownership/backup, physical deployment, and rollback are not met. Multiple P0 facts remain `UNKNOWN`. Contract documents and sampled public checks cannot substitute for those operational gates.

SAFE TO START V2 IMPLEMENTATION: NO
