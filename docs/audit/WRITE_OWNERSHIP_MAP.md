# Write Ownership Map

## Core principle

Creating a V2 route or screen does not transfer data ownership. An owner changes only after the relevant migration phase, permission tests, parity checks, count/integrity checks, audit evidence, production smoke, and rollback rehearsal pass.

## Current ownership

| Domain | Current authoritative writer | V2 writer now | Cutover state |
|---|---|---|---|
| Member/auth/social identity | V1 PHP/API + current DB | none | `INVENTORY` |
| Team/club/academy | V1 PHP/API + current DB | none | `INVENTORY` |
| Player/guardian/consent | V1 PHP/API + current DB | none | `INVENTORY` |
| Match/schedule/events | V1 PHP/API + current DB | none | `INVENTORY` |
| Training/attendance | V1 PHP/API + current DB | none | `INVENTORY` |
| Community posts/comments/likes | `community.php` and current tables | none | `INVENTORY` |
| Community adjacent blocks | their V1 endpoints/providers | none | `INVENTORY` |
| Notifications | `notifications.php`/`notify_lib.php` | none | `INVENTORY` |
| Main-app media | V1 `/files/` APIs and web root | none | `INVENTORY` |
| Admin operational data | V1 admin endpoints/current DB | none | `INVENTORY` |
| Independent TACTICS | separate TACTICS boundary | none in main V2 | independent |
| Shorts Factory | separate `ss/` boundary | none in main V2 | independent |

## Migration state definitions

| State | Allowed activity | Write owner |
|---|---|---|
| `INVENTORY` | read repository and approved sanitized production metadata | V1 only |
| `ADAPTER_READ` | V2 reads through a compatibility contract; no V2 persistence | V1 only |
| `SHADOW_WRITE` | V1 write is primary; V2 receives idempotent shadow events not served to users | V1 primary |
| `DUAL_VERIFY` | compare counts, values, permissions, media, and audit outcomes | V1 primary |
| `CUTOVER` | server-controlled switch after all gates and rollback approval | explicit per-domain owner |
| `DECOMMISSION` | old write path disabled after observation and approval | V2, with retained recovery evidence |

## Ownership transfer checklist

Every domain needs:

- current source schema and count baseline;
- exact command/endpoint and field contracts;
- approved source-to-target mapping with `UNKNOWN` review states;
- encrypted backup and isolated restore rehearsal;
- idempotency and retry semantics;
- allow/deny permission matrix and tenant isolation;
- audit records and sanitized mismatch reporting;
- old/new client compatibility;
- data, media, and notification side-effect verification;
- code rollback and data reconciliation procedure;
- named operator/reviewer approval and observation window.

## Community-specific ownership gate

Community stays V1-owned until post list/detail/write, ordering, pagination, comments, likes, counts, card posts, HTML safety, notifications, media paths, news/video/highlight adjuncts, and all approved moderation additions pass dual verification. A new V2 visual shell does not qualify as parity.

## Prohibited during foundation

- V2 DB writes or migrations.
- Production API changes.
- User-data copy.
- Community cutover or dual write.
- Activation of EPTS/CAMERA_AI/SPORTS_AI.
- Copying secrets or server-only configuration.
- Treating UI visibility or local tests as permission evidence.
