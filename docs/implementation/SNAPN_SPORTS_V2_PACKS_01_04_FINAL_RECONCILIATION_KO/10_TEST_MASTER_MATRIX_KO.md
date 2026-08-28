# 10. TEST MASTER MATRIX — KO

## Consolidated P0 matrix

| ID | Area | Scenario | Expected | Owner |
| --- | --- | --- | --- | --- |
| P0-SEC-001 | Cross-tenant | actor tenant A → resource tenant B | DENY; no row count/existence leak | cross-pack-permission |
| P0-SEC-002 | Cross-team | Coach team A → team B | DENY | cross-pack-permission |
| P0-SEC-003 | Role escalation | RolePreference=CLUB_DIRECTOR without grant | DENY ROLE_GRANT_REQUIRED | cross-pack-permission |
| P0-SEC-004 | Guardian isolation | unlinked guardian → minor data | DENY | owner pack + cross |
| P0-SEC-005 | Minor direct contact | Agent/Manager → minor without mediated permission | DENY/MEDIATED | safeguarding |
| P0-SEC-006 | Referee private data | assigned referee → growth/private notes | DENY minimal match-only fields | PACK01/PACK03 |
| P0-SEC-007 | Referee exact assignment | RoleGrant but wrong match | DENY | PACK01 PSE-002 |
| P0-SEC-008 | Agent consent | portfolio without current consent/share grant | DENY | PACK02 |
| P0-SEC-009 | Community hidden/block | blocked user reconstructs hidden content | DENY/no existence leak | PACK04 |
| P0-SEC-010 | Admin least privilege | Support attempts safeguarding/privacy mutation | DENY | PACK04 |
| P0-SEC-011 | Self role grant | verification operator approves own role | DENY SELF_APPROVAL_DENIED | PACK04 |
| P0-SEC-012 | Hard feature flag | client sends EPTS/CAMERA_AI/SPORTS_AI true | DENY/HIDDEN | cross-pack-permission |
| P0-OPS-001 | Migration readonly | operator requests cutover/decommission | DENY MIGRATION_COMMAND_DISABLED | PACK04 |
| P0-OPS-002 | Earthus soft failure | timeout/schema mismatch | core Schedule/Training/Match succeeds | cross-pack-integration |
| P0-OFF-001 | Offline idempotency | same local event replays | one server effect; same ACK | PACK01 |
| P0-OFF-002 | Offline role revoke | queued write replays after grant revoked | DENY, keep journal resolution evidence | PACK01/PACK03 |
| P0-API-001 | operationId uniqueness | merged OpenAPI | all unique | validation |
| P0-API-002 | OpenAPI local refs | merged OpenAPI | all refs resolve | validation |
| P0-DB-001 | Schema no duplicate Pack04 tables | DDL draft | only 4 approved extensions | schema-reconciliation |
| P0-DB-002 | Captain invariant | two captains same match/team | unique index rejects | PACK01 |
| P0-DB-003 | Communication read cursor | read cursor points to different thread | service rejects | PACK02 |
| P0-DB-004 | Portfolio revoke | revoke active grant | immediate access deny + audit | PACK02 |

## Duplicate removal

Pack-specific tests that assert the same invariant are retained only at the canonical owner level, while workspace packs keep projection/role-specific tests.

Examples:
- authorization cross-tenant: shared owner
- match state/event/referee assignment: PACK01
- career/scouting/communication share: PACK02
- workspace role switch/projection: PACK03
- admin operator privilege/moderation/privacy: PACK04
- Earthus fallback: shared adapter + one cross-pack integration test

## Generated compile checks

- `tests/cross-pack-permission.test.ts`
- `tests/cross-pack-integration.test.ts`
- `tests/openapi-reconciliation.test.ts`
- `tests/schema-reconciliation.test.ts`

These TypeScript test skeletons are strict-compiled by `tsc`. Runtime domain tests must be added/applied in the actual repository during sequential implementation.
