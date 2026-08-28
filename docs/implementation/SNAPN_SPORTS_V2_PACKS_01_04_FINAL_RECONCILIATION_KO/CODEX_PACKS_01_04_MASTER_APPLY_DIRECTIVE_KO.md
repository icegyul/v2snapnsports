# CODEX PACKS 01~04 MASTER APPLY DIRECTIVE — KO

## 목표

현재 로컬 V2 repository에 이 reconciliation package를 **순차 적용**한다. 임의 기획 재생성, production migration, deploy, push, main merge는 하지 않는다.

## 0. 먼저 확인

1. 현재 branch/HEAD/status 기록.
2. `docs/canonical`의 Physical DB v1.4 / OpenAPI v1.4 / Backend v1.5 / Frontend v1.7이 이 패키지의 source version과 같은지 diff.
3. `update/`의 PACK01~04 ZIP 또는 이미 반영된 implementation docs 확인.
4. 충돌이 있으면 newer canonical evidence를 우선하고 reconciliation diff를 먼저 작성.

## 1. API

- Base physical OpenAPI에 `yaml/SNAPN_SPORTS_V2_PACKS_01_04_OPENAPI_RECONCILED_PATCH.yaml`을 적용하거나 merged file을 diff source로 사용.
- `REJECTED`, `DEFERRED`, `INTERNAL_USE_CASE_ONLY`, `ADMIN_PROJECTION_ONLY`를 public route로 mount하지 않는다.
- Logical alias를 새 public endpoint로 동시에 노출하지 않는다.
- `/passport` → `/career`
- `/comms` → `/communication`
- scouting opportunity list/create/action → `/opportunities` canonical aggregate
- Agent player list → `/v2/search?type=portfolio`
- Training state command → existing `appendTrainingEvent` + A16
- `POST /v2/matches`는 만들지 않는다.

## 2. Schema

`sql/SNAPN_SPORTS_V2_PACKS_01_04_SCHEMA_EXTENSION_DRAFT.sql`은 **migration SQL이 아니라 DDL draft**다.

Local migration proposal로 전환하기 전에:
- current physical schema diff
- data scan
- FK/index lock estimate
- forward/backfill plan
- rollback plan
- test DB apply/revert

를 수행한다.

승인 후보는 4개만:
1. captain column/index
2. exact match official assignment
3. communication member read cursor
4. portfolio share grants

PACK04 신규 업무별 table 생성 금지.

## 3. Shared foundation first

Implementation order:
1. Authorization
2. RoleGrant
3. Guardian/Consent
4. Safeguarding
5. Audit
6. Feature Flags
7. Notification/Media/Search
8. Offline/Outbox
9. Earthus soft adapter

모든 domain controller/application service는 위 체인을 통과한다.

## 4. PACK01

Implement owner modules for Schedule/Training/Match/Tactics.
- A16 state machine
- A28 match state machine
- A29 append/correction ordering
- exact referee assignment
- offline replay reauthorization
- captain persistence only if feature ships
- Earthus failure never blocks core

## 5. PACK02

Implement Career/Communication/Scouting/Opportunity/Portfolio.
- Career root is `/career`.
- `consent_records.scope` + athlete profile visibility reuse for scouting preferences.
- opportunity interest/invite/respond are `opportunity_actions`.
- communication unread comes from thread-member read cursor.
- portfolio ShareGrant is separate from child `media.share_grants`.

## 6. PACK03

Build six role workspaces as permissioned projections.
Never own duplicate business state.
Active role switch uses `role_grant_id`; role preference is not permission.

## 7. PACK04

Build Admin/Ops as least-privilege read models + only approved audited mutations.
- role verification: one `decision` command
- role grant: one `state-transitions` command
- Community V2 write routes remain deferred behind legacy parity
- migration console read-only
- job retry deferred until infra gate
- Earthus health read model only
- production delete/media mutation disabled

## 8. Hard disabled

Do not create UI, routes, prefetch, background jobs, or hidden experimental mounts for:
- E22 / A25 EPTS
- E23 Camera/Vision
- E24 / A26 Sports AI

E38 remains RESERVED.

## 9. Tests

Run existing package tests plus:
- `tests/cross-pack-permission.test.ts`
- `tests/cross-pack-integration.test.ts`
- `tests/openapi-reconciliation.test.ts`
- `tests/schema-reconciliation.test.ts`

Then add actual repository integration tests from `10_TEST_MASTER_MATRIX_KO.md`.

## 10. Commit plan

Use separate commits:
1. chore: reconcile V2 API and schema contracts
2. feat: implement shared authorization and safety foundation
3. feat: implement training match and tactics pack
4. feat: implement football life pack
5. feat: implement manager workspaces pack
6. feat: implement admin ops and safety pack
7. test: add cross-pack acceptance coverage
8. docs: finalize engine and algorithm implementation map

## 11. Final report template

```text
PACKS RECONCILED: 4/4
TOTAL API CANDIDATES: 101
EXISTING API: 12
INTERNAL/ADMIN PROJECTION: 28
OPENAPI PROMOTIONS: 38
PATH RECONCILIATIONS: 11
REAL API EXTENSIONS: 5
REJECTED/DEFERRED API: 9

TOTAL SCHEMA CANDIDATES: 26
REUSED EXISTING SCHEMA: 20
REAL SCHEMA EXTENSIONS: 4
DEFERRED/REJECTED SCHEMA: 2

ENGINES ACCOUNTED: 40/40
CURRENTLY IMPLEMENTED ENGINES: X/40
ALGORITHMS ACCOUNTED: 45/45
CURRENTLY IMPLEMENTED ALGORITHMS: X/45

CROSS-PACK SAFETY: PASS/FAIL
OPENAPI VALIDATION: PASS/FAIL
TYPESCRIPT VALIDATION: PASS/FAIL
READY FOR CODEX SEQUENTIAL APPLY: YES/NO
SAFE FOR STAGING: NO
SAFE FOR PRODUCTION CUTOVER: NO
```
