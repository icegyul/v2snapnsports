# Reuse and Migration Matrix

## Classification contract

Every major V1 asset is assigned exactly one requested disposition:

- `REUSE_AS_IS`: copy only after license, dependency, and isolated test verification; no semantic change.
- `REUSE_WITH_ADAPTER`: preserve behavior behind a V2 contract while V1 remains authoritative.
- `MIGRATE_DATA_ONLY`: move verified data, not legacy UI/implementation.
- `REBUILD_NEW`: implement a new V2 capability; legacy code is evidence only.

This matrix approves no copy, migration, deployment, or cutover by itself.

## Matrix

| Asset/domain | Classification | Evidence and constraint |
|---|---|---|
| Safe return-intent normalization | `REUSE_AS_IS` | constrained helper semantics; isolate and test before copy |
| General token/API client behavior | `REUSE_WITH_ADAPTER` | preserve response/auth-expiry compatibility; storage/session design not copied blindly |
| Password/social identity flow | `REUSE_WITH_ADAPTER` | current provider IDs and member identity remain authoritative until verified |
| Member identity records | `MIGRATE_DATA_ONLY` | preserve IDs; require DB inventory, consent, backup, integrity, and auth validation |
| Account type and legacy titles | `MIGRATE_DATA_ONLY` | historical/display attributes only; never become V2 authority by direct mapping |
| Team/club records | `MIGRATE_DATA_ONLY` | preserve IDs and names after tenant/ownership validation |
| Team membership roles | `REUSE_WITH_ADAPTER` | map legacy owner/coach/manager/player/guardian through scoped policy adapter |
| Player profiles and stats | `MIGRATE_DATA_ONLY` | field allowlist, provenance, privacy, and ownership review required |
| Guardian links and minor consent | `MIGRATE_DATA_ONLY` | no inferred type; version/scope/revocation gaps require review states |
| Match schedules, rosters, events, scores | `MIGRATE_DATA_ONLY` | validate participant/team provenance and score reconciliation |
| Match event transaction/idempotency patterns | `REUSE_WITH_ADAPTER` | retain proven invariants after isolated tests; no direct endpoint copy |
| Training schedules/programs/attendance | `MIGRATE_DATA_ONLY` | schema drift and partial-write behavior require canonical model |
| Notifications | `REUSE_WITH_ADAPTER` | preserve list/count/read/clear meaning and compatibility while adding delivery contract |
| Community posts/comments/likes | `MIGRATE_DATA_ONLY` | preserve identifiers, order, counts, HTML meaning, and author linkage |
| Community endpoint behavior | `REUSE_WITH_ADAPTER` | V1 remains write owner until complete parity and dual verification |
| Community UI | `REBUILD_NEW` | Graphite Stadium shell; existing behavior cannot be reduced |
| Development-request board data | `MIGRATE_DATA_ONLY` | preserve state/comment history after operational owner review |
| Player-card, photo, and logo binaries | `MIGRATE_DATA_ONLY` | hash manifest, ownership, rights, retention, and URL compatibility required |
| Media URL/path compatibility | `REUSE_WITH_ADAPTER` | old `/files/` references must continue to resolve during migration |
| General media/object service | `REBUILD_NEW` | current local web-root storage is not a reusable V2 media architecture |
| Admin member/team operational data | `MIGRATE_DATA_ONLY` | policy, audit, and sensitive-field allowlist required |
| Admin UI/workspaces | `REBUILD_NEW` | role-specific V2 shell and server policy separation |
| App/API SFTP deployment safety concepts | `REUSE_WITH_ADAPTER` | platform-specific scripts stay with V1; carry locks/backups/atomic verification principles |
| Existing PHP endpoint files | `REUSE_WITH_ADAPTER` | compatibility layer only; runtime DDL and policy duplication block direct copy |
| Existing SQL migration directory | `REBUILD_NEW` | incomplete base/ledger/rollback; use as evidence, not a fresh-install system |
| Pure tactics engine utilities in main app | `REUSE_AS_IS` | only individually proven framework-independent modules/tests; remain separate from app migration |
| Independent `snapn-tactics` | `REUSE_WITH_ADAPTER` | separate product boundary and identity exchange only |
| Existing whole UI/navigation | `REBUILD_NEW` | explicitly excluded from wholesale migration |
| Legacy 3D/dashboard/Stadium UI | `REBUILD_NEW` | replaced by My Football World and Graphite Stadium design with static fallback |
| V2 app shell and player navigation | `REBUILD_NEW` | HOME/TRAINING/COMMUNITY/VIDEO/MORE |
| Manager role workspace | `REBUILD_NEW` | new scoped role UX; server authority must be explicit |
| Career Passport and Scouting Consent | `REBUILD_NEW` | new contracts and consent model required |
| Team Communication | `REBUILD_NEW` | additive design after Community and permission contracts |
| EPTS/CAMERA_AI/SPORTS_AI implementations | `REBUILD_NEW` | hard disabled; interface seams only after separate approval |
| Shorts Factory | `REUSE_WITH_ADAPTER` | remains separate subsystem; no direct V2 import |

## `REUSE_AS_IS` safety gate

`REUSE_AS_IS` is intentionally narrow. Before copying any item, prove that it is framework independent, secret free, production-data free, licensed for V2, covered by deterministic tests, and not coupled to a legacy route, DB table, storage path, role assumption, or build output.

## First implementation candidates after blockers close

1. V1 read-only identity/team/player/Community contract adapters.
2. Sanitized parity fixtures and permission tests.
3. New Graphite Stadium app shell without live writes.
4. Media URL compatibility reader.
5. Shadow-read comparison and audit logging.

No shadow write begins until backup/restore, idempotency, ownership, permission, and rollback gates pass.
