# 01. FINAL RECONCILIATION MASTER — KO

## 1. 목적

PACK 01~04의 구현 계약을 하나의 physical implementation truth로 합친다. PACK이 제안한 API/DB 변경은 canonical physical contract를 변경하는 근거가 아니라 **검토 후보**다.

## 2. Source priority

1. Safety / Minor Privacy / Security
2. Physical DB Schema v1.4
3. Physical OpenAPI v1.4
4. Backend Implementation Lock v1.5
5. Frontend / Visual v1.7
6. Core UI implementation contracts
7. Engine Catalog v1.3
8. Algorithm Catalog v1.3
9. Football Life / Earthus canonical
10. PACK 01~04
11. V1 audit evidence

## 3. 최종 핵심 판정

- PACK 01의 17 logical gap은 physical OpenAPI 승격 대상으로 유지한다.
- PACK 01 PAE-001 Training lifecycle은 새 endpoint 대신 기존 `appendTrainingEvent` + A16 server state-machine로 처리한다.
- PACK 01 `POST /v2/matches`는 write-owner/canonical approval 전 **DEFERRED**.
- PACK 02는 logical `/passport`, `/comms`, `/scouting/opportunities`를 physical `/career`, `/communication`, `/opportunities`에 맞춰 정규화한다.
- Scouting interest/invite/respond는 `football.opportunity_actions.action_type`로 합쳐 별도 verb endpoint를 만들지 않는다.
- Agent player list는 새 `/agent/players` 대신 physical `/v2/search?type=portfolio`를 사용한다.
- Communication announcements는 existing create-thread + send-message 조합으로 처리한다.
- 별도 `/comms/unread`는 만들지 않고 thread projection에 unread count를 포함한다.
- PACK 03은 workspace projection consumer이며 domain API/DB owner가 아니다.
- PACK 04의 39 endpoints 중 대부분은 existing DB + permission-scoped admin read model 또는 shared domain operations로 처리한다.
- PACK 04의 21 schema 제안은 신규 업무별 테이블로 만들지 않는다. **PACK04 real schema extension = 0.**
- REAL API extensions = **5**
- REAL schema extensions = **4**

## 4. Final REAL API extensions

| ID | Domain | Method | Final path | operationId | Reason |
| --- | --- | --- | --- | --- | --- |
| PAE-01 | Portfolio | POST | /v2/athletes/{athlete_id}/portfolio/share-grants | createPortfolioShareGrant | portfolio는 단일 media asset보다 넓어 media.share_grants만으로 비미디어 career projection grant를 표현할 수 없음 |
| PAE-02 | Portfolio | POST | /v2/athletes/{athlete_id}/portfolio/share-grants/{grant_id}/revoke | revokePortfolioShareGrant | portfolio grant의 명시적 즉시 철회가 필요하며 audit/consent cascade와 결합 |
| PAE-03 | Communication | POST | /v2/communication/threads/{thread_id}/read | markCommunicationThreadRead | 메시지 unread/read high-water mark는 notification read와 다른 domain truth이며 durable per-member state가 필요 |
| P4-API-09 | Verification | POST | /v2/admin/role-verifications/{verification_id}/decision | adminDecideRoleVerification | APPROVE/REJECT를 하나의 audited decision command로 통합; self-approval deny |
| P4-API-11 | Verification | POST | /v2/admin/role-grants/{grant_id}/state-transitions | adminTransitionRoleGrantState | SUSPEND/REVOKE를 하나의 audited state-transition command로 통합 |

## 5. Final REAL schema extensions

| ID | Pack | Domain | Final shape | Reason |
| --- | --- | --- | --- | --- |
| PSE-001 | PACK 01 | Match | ALTER football.match_lineups ADD is_captain boolean + partial unique index | Captain is lineup business truth and requires one-per-match/team invariant; existing columns cannot express it without semantic abuse |
| PSE-002 | PACK 01 | Referee | CREATE football.match_official_assignments | Security-critical exact assignment deserves an explicit FK relation; safety/authorization priority outranks schema minimization |
| P2-PSE-002 | PACK 02 | Communication | ALTER football.communication_members ADD last_read_message_id, last_read_at | Avoid per-message receipt table explosion while preserving canonical unread/read cursor. Application validates same-thread and monotonic advance. |
| P2-PSE-003 | PACK 02 | Portfolio | CREATE football.portfolio_share_grants with athlete/grantor/grantee/scope/consent/expiry/revoke | A portfolio grant spans career fields plus optional assets; media.share_grants remains a narrower child asset gate |

## 6. Apply order

P0 Core UI completion → P1 API/OpenAPI reconciliation → P2 shared authorization/safety → P3 PACK01 → P4 PACK02 → P5 PACK03 → P6 PACK04 → P7 cross-pack integration → P8 engine/algorithm audit → P9 full local acceptance.

Production infrastructure, staging cutover, migration execution, media mutation, queue/DLQ activation are separate gates.

## 7. Final status

```text
PACKS RECONCILED: 4/4
TOTAL API CANDIDATES: 101
EXISTING API: 12
INTERNAL / ADMIN PROJECTION: 28
OPENAPI PROMOTIONS: 38
PATH RECONCILIATIONS: 11
REAL API EXTENSIONS: 5
REJECTED/DEFERRED API: 9

TOTAL SCHEMA CANDIDATES: 26
REUSED EXISTING SCHEMA: 20
REAL SCHEMA EXTENSIONS: 4
DEFERRED/REJECTED SCHEMA: 2

ENGINES ACCOUNTED: 40/40
CURRENTLY IMPLEMENTED ENGINES: 11/40 (local fixture/scaffold evidence only)
ALGORITHMS ACCOUNTED: 45/45
CURRENTLY IMPLEMENTED ALGORITHMS: 11/45 (local fixture/scaffold evidence only)

CROSS-PACK SAFETY: PASS (contract/static reconciliation)
OPENAPI VALIDATION: PASS
TYPESCRIPT VALIDATION: PASS
READY FOR CODEX SEQUENTIAL APPLY: YES
SAFE FOR STAGING: NO
SAFE FOR PRODUCTION CUTOVER: NO
```
