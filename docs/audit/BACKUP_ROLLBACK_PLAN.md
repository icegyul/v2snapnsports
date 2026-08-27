# Backup and Rollback Plan

## Status and authorization boundary

This is a required plan, not authorization to connect to production, copy personal data, create a database, run a migration, deploy files, or delete legacy assets. The exact source, operator, account, secure storage, retention, and isolated restore target must be approved out of band.

## Backup sets

| Set | Required contents | Acceptance evidence |
|---|---|---|
| Repository/source | exact commit, dirty status, scoped diff, migration hashes | immutable manifest and reviewer sign-off |
| Web artifacts | current `/app/` entry, SW, manifest, hashed assets, headers | byte/SHA-256 and public delivery map |
| API artifacts | current deployed PHP file manifest excluding secrets | per-file hash and protected backup |
| DB schema | version, tables, columns, indexes, constraints, triggers, routines, events | normalized `SHOW CREATE` and inventory hash |
| DB data | consistent encrypted dump plus exact counts | checksum and isolated restore result |
| Main media | `/files/snapn_cards`, `/files/snapn_photos`, `/files/snapn_logos` | path/size/hash/owner manifest and restore test |
| External identity | sanitized provider-link counts and identity-key contract | no provider tokens or secrets |
| Operational config | names/owners/rotation metadata only | secure-store references, never values |

## Production backup preflight

Stop if any item is missing:

1. named source host/database label and approved read-only/backup account;
2. restricted output outside repository and web root;
3. at least twice estimated free space;
4. no password in process arguments, history, chat, or evidence;
5. MariaDB version/engine review, including non-transactional table handling;
6. approved encryption and retention owner;
7. empty, named, non-production restore target;
8. operator and reviewer present for source/target identity checks.

## Database procedure

1. Run the approved read-only inventory and verify database identity.
2. Capture schema-only and consistent full dumps without `CREATE DATABASE` or `DROP DATABASE` statements.
3. Record tool versions, start/end UTC, source label, byte sizes, and SHA-256.
4. Encrypt before moving from the controlled host.
5. Restore only into the named isolated target after hostname/database confirmation.
6. Run the same inventory against the restore.
7. Compare structure, exact table counts, and aggregate domain checks.
8. Fail the gate on unexplained differences or undocumented repair.

## Media procedure

1. Freeze only the approved migration window; do not stop V1 writes before an authorized operation window.
2. Inventory relative path, size, SHA-256, media signature, modification time, and owner/reference candidate.
3. Compare DB URLs to filesystem paths in both directions.
4. Back up binaries into encrypted restricted storage.
5. Restore into an isolated non-public directory.
6. Recompute hashes and test representative decode/render behavior.
7. Record missing references, orphans, duplicates, and quarantined objects without exposing personal media.

## Code and artifact rollback

| Failure | First response | Rollback |
|---|---|---|
| V2 UI/read adapter | disable V2 feature/read flag | serve prior V1 route/artifact |
| Web entry/SW | stop switch or revert entry set | restore verified `index.html` and `sw.js`, then public byte check |
| PHP adapter | stop requested release set | restore every affected PHP file and run smoke |
| Shadow write mismatch | stop shadow consumer, preserve events | V1 remains authoritative; discard/rebuild non-authoritative target |
| Backfill mismatch | stop target writes, preserve run manifest | reviewed inverse or restore decision; never guess |
| Partial additive DDL | stop dependent release | record actual schema; reviewed forward repair or dormant objects |
| Data corruption | freeze affected writes and declare incident | restore approved point, reconcile later writes, rerun identity/permission/data checks |
| Community parity failure | disable V2 Community route/write | V1 Community remains sole read/write owner |

## Migration rollback principles

- Code/feature rollback comes before destructive schema reversal.
- Additive objects may remain dormant if they contain no authoritative data.
- A `down.sql` file alone is not recovery.
- Old fields, tables, endpoints, and IDs remain available through the observation window.
- New schema objects are dropped only after proof that they are unused and contain no unique data, with separate approval.
- No restore is ever run over production through an unresolved variable or automated database-creation step.

## Cutover recovery package

Each domain cutover must include source/target manifests, mapping version, event/run IDs, idempotency keys, count and integrity queries, permission results, media checks, audit hashes, previous artifact hashes, flags to disable new reads/writes, operator contacts, rollback decision tree, and observation-window criteria.

## Current gate result

`NOT READY`: no current production inventory, encrypted backup, isolated restore rehearsal, media manifest, or migration ledger was produced by this audit.
