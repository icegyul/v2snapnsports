# SnapN Sports V2 Pre-implementation Blocker Clearance

## Scope

- Audit date: `2026-08-27 KST`
- V2 output root: `/Volumes/740GB/## APP/Sanpnsports v2_app`
- Legacy evidence root: `/Volumes/740GB/웹/스냅엔스포츠cafe24-deploy`
- Legacy policy: `READ_ONLY`
- Direct production SQL/deploy command: none
- Production mutation certainty: `UNKNOWN` — sampled public GET routes contain request-time DDL in Legacy code
- Production deployment/migration/restore: none
- V2 feature implementation: none

## Evidence labels

| Label | Meaning |
|---|---|
| `REPOSITORY_CONFIRMED` | Current local source was read directly. It does not prove deployment or production data. |
| `LIVE_PUBLIC_CONFIRMED` | A public page, response field set, or HTTP status was checked on 2026-08-27 without writing data. |
| `HANDOFF_REPORTED` | A prior handoff states a result that was not independently reproduced in this audit. |
| `CONTRACT_FROZEN` | The V2 design decision is written and testable, but not implemented. |
| `UNKNOWN` | Required operational evidence was unavailable. |
| `FAIL` | A required gate is absent or a blocking defect was confirmed. |

`CONTRACT_FROZEN` is never equivalent to a runtime `PASS`.

## Non-destructive actions performed

- Read V2 audit documents and Legacy source, scripts, manifests, and Git status.
- Inspected only file presence/permissions for ignored config paths; no secret values were read.
- Recounted 29 migration SQL files and 58 PHP files containing 126 runtime DDL term matches.
- Opened the public Community screen without submitting a user action. This can still call Legacy GET endpoints that issue runtime DDL; see the incident boundary below.
- Checked public API response **field names only** for player/team endpoints.
- Checked unauthenticated HTTP status only for protected endpoints and the D-12 inventory endpoint.
- Wrote these documents only under V2 `docs/audit-live/`.

## Live checks

| Check | Result | Evidence boundary |
|---|---|---|
| `/app/community` | Community, prediction, leaderboard, news, posts, and YouTube blocks rendered; no pagination control was visible | `LIVE_PUBLIC_CONFIRMED`; no post detail was opened because it increments views |
| `/api/players.php` | Public list field set contained no `member_srl` | `LIVE_PUBLIC_CONFIRMED`; values were not reported |
| `/api/players.php?id=1` | Public detail field set contained no `member_srl` | `LIVE_PUBLIC_CONFIRMED`; one sampled identifier only |
| `/api/players.php?debug=1` | No SQL/file/line/debug field appeared | `LIVE_PUBLIC_CONFIRMED`; not an exhaustive error-path test |
| `/api/teams.php` | Public list field set contained no `manager_member_srl` | `LIVE_PUBLIC_CONFIRMED`; values were not reported |
| `/api/matchplan.php?match_id=1` | HTTP 401 without credentials | Proves unauthenticated denial only |
| `/api/guardian.php?action=list` | HTTP 401 without credentials | Proves unauthenticated denial only |
| `/api/d12_inventory.php` | HTTP 404 | The repository endpoint is not an available production inventory path |
| app/API security headers | `Content-Security-Policy`, HSTS, frame, referrer, permissions, and nosniff headers were not observed | Header sample only |

## Read-only method limitation

After the live checks, code review confirmed that `community.php` executes `CREATE TABLE IF NOT EXISTS` on GET and the public list path in `players.php` can conditionally execute `ALTER TABLE`. The Community screen also loads adjacent GET endpoints found in the runtime-DDL inventory. Therefore the live requests were not guaranteed SQL-read-only even though no write method or direct SQL was submitted. Existing production objects likely made the DDL a no-op, but the live schema is unavailable, so actual change is `UNKNOWN`. No further live application/API requests were made after this was recognized.

## Document index

- DB: `PROD_DB_*`, `PROD_RUNTIME_DDL_DRIFT_REPORT.md`, `PROD_DATA_INTEGRITY_RISK_REPORT.md`
- Backup/restore: `BACKUP_CURRENT_STATE.md`, `RESTORE_REHEARSAL_REPORT.md`, `ROLLBACK_READINESS_REPORT.md`
- Authorization: `AUTH_*`, `ROLE_PERMISSION_EFFECTIVE_MATRIX.md`, `V2_AUTHORIZATION_DECISION_CONTRACT.md`
- Community: `COMMUNITY_*`
- Media: `MEDIA_*`, `V2_MEDIA_MIGRATION_CONTRACT.md`
- Runtime: `V2_RUNTIME_DECISION.md`, `V2_DEPLOYMENT_TARGET.md`, `V2_STORAGE_DECISION.md`, `V2_LEGACY_ADAPTER_ARCHITECTURE.md`
- First slice: `FIRST_READ_ONLY_ADAPTER_SLICE.md`, `LEGACY_TO_V2_CANONICAL_MAPPING.md`, `ADAPTER_*`
- Tests and verdict: `PRE_IMPLEMENTATION_FAILING_TEST_MATRIX.md`, `IMPLEMENTATION_READINESS_REPORT.md`
