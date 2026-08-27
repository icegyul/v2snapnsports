# Production DB Inventory

## Verdict

**Status: `FAIL / UNKNOWN`**

No direct production DB connection was available. The audit did not submit SQL through a DB client and did not inspect credentials.

The audit did make limited public HTTP GET requests. Because current Legacy GET handlers include request-time DDL, those HTTP reads cannot be certified as SQL-read-only. No direct DB command was sent, but actual no-op/change status is `UNKNOWN` without the production snapshot.

## Access-path inventory

| Candidate path | Finding | Status |
|---|---|---|
| Local MySQL collector | `scripts/inventory/collect_db_inventory.sh` accepts a separate `0600` defaults file, approved DB name, and output outside the repo | `REPOSITORY_CONFIRMED`, credentials not supplied |
| Temporary server endpoint | `api/d12_inventory.php` limits itself to admin-authenticated metadata, counts, `SHOW CREATE TABLE`, and a read-only transaction | `REPOSITORY_CONFIRMED` |
| Live server endpoint | `https://snapnsports.com/api/d12_inventory.php` returned 404 | `LIVE_PUBLIC_CONFIRMED`, unavailable |
| Legacy live config | `api/config.php`, `api/db_config.php`, and `api/secrets.php` are absent locally and Git-ignored | No connection method available |
| D-12 approval record | Legacy record remains `NOT APPROVED/PENDING`, with source label, window, operator, reviewer, and restore target unassigned | Operational gate open |

The current request authorizes read-only investigation in principle, but it does not supply a named DB operator, approved source database label, secure defaults file, backup window, evidence store, or isolated restore target. Those conditions cannot be guessed.

## Requested inventory versus result

| Required fact | Result |
|---|---|
| Host configuration method | Server-only config and mysqli helper referenced; exact host/config unknown |
| Engine/version | MariaDB is repository/handoff evidence; exact live version unknown |
| Database/schema list | `UNKNOWN` |
| Tables | 84 explicit `sn_*` names are current code candidates; live list unknown |
| Columns/type/null/default | `UNKNOWN` |
| Primary/unique/foreign keys | `UNKNOWN` |
| Indexes | `UNKNOWN` |
| Row counts | `UNKNOWN` |
| Charset/collation | Code usually requests `utf8mb4`; live defaults and per-table values unknown |
| Triggers/views/routines/events | `UNKNOWN` |
| Applied migrations | Local checksum ledger exists; production application is unverified |
| Runtime DDL result | 58 code paths found; actual resultant production shape unknown |
| Orphans/duplicates | Risks identified; counts unknown |

## Safe next input required

1. A product-owner-approved source **label** and scope, not a credential pasted into chat.
2. A DB operator and reviewer.
3. A `SELECT`/metadata-only account delivered through the approved secure channel.
4. A `0600` MySQL defaults file outside the repo/web root.
5. A secure evidence-directory label, retention, and encryption owner.
6. A separately named non-production restore target before any rehearsal.

Until all six exist, production inventory remains a P0 blocker.
