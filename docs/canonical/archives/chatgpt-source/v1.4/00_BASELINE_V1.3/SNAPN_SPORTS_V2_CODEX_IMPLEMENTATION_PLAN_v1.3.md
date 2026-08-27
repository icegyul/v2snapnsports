# SNAPN SPORTS V2 CODEX IMPLEMENTATION PLAN

**v1.3 | Football Life expansion | No fake completion**

## 0. Absolute Rules for Codex

1. 구현 완료 판정은 코드 존재가 아니라 route/API/test/runtime evidence로 한다.
2. 기존 Community/Auth/Team/Schedule을 임의 재작성하지 말고 먼저 Inventory와 write ownership을 확정한다.
3. 삭제/대규모 migration 전 backup + rollback.
4. EPTS/Camera/Sports AI는 일반 사용자에게 HARD OFF.
5. Mock/demo 숫자를 production route에 연결하지 않는다.
6. 각 Phase 종료 시 Acceptance Gate 보고서와 실패 항목을 남긴다.

## Phase 0 — Repository Audit & Freeze

### Tasks
- framework/package/runtime 확인.
- DB schema/Auth/session/cookie/token 조사.
- current Player/Manager/Guardian/Team/Schedule/Attendance/Community/Media 기능 inventory.
- Community endpoint, sorting, pagination, visibility, moderation, media ownership 실사.
- existing Match/competition concepts 조사.
- file/object storage/CDN 조사.
- migration/rollback map.

### Required outputs
- `MASTER_GAP_ANALYSIS_V2.md`
- `LEGACY_WRITE_OWNERSHIP_MATRIX.md`
- `COMMUNITY_PARITY_INVENTORY.md`
- `DB_MIGRATION_ROLLBACK_MAP.md`
- `ROUTE_API_INVENTORY.json`

### Gate
- 추측으로 “없음/완료” 판정 0건.

## Phase 1 — Identity / Role / Credential / Permission

### Build order
1. Public account_type PLAYER/MANAGER.
2. Manager role preference model.
3. RoleCredential/VerificationCase.
4. RoleGrant.
5. Authorization/DataScope middleware/policy.
6. Guardian invite/consent.

### Mandatory negative tests
- self-select CLUB_DIRECTOR -> organization data deny.
- expired credential -> grant suspended.
- agent without player permission -> portfolio deny.
- referee -> unrelated athlete growth deny.

## Phase 2 — Legacy Adapter / Community Parity / Offline / Privacy

- `/v2/community/*` Adapter contract 먼저.
- legacy feed order와 pagination parity snapshot test.
- report/block/media visibility parity.
- Offline Journal + `/v2/sync/batch`.
- Privacy request/lifecycle job skeleton.

### Gate
- V2 Community의 기능 누락 0 또는 명시적 exception list.
- offline session event loss 재현 0.

## Phase 3 — Match & Competition

- CompetitionRuleSet version.
- Match aggregate/state machine.
- roster/lineup.
- append-only events/corrections.
- referee assignment/report.
- Player/Coach/Club/Referee/Agent projections.

### Gate
- score projection이 event replay로 재현.
- FINALIZED 직접 수정 불가.

## Phase 4 — My Football World

### Build vertical slice first
`GET /v2/stadium/home` -> mobile Spatial Home.

- Stadium Exterior/Fast Entry.
- Formation/position coordinate mapping.
- My Player visual priority.
- Home State primary CTA.
- 2D Static fallback.
- Asset manifest/cache minimal.

### Performance gate
- shell usable p75 <=2.5s target.
- Fast Entry key info <=3s.
- core asset failure does not block navigation.

## Phase 5 — Stadium DIY / Analytics

- 10 Style Families / 20 presets.
- compatibility validator.
- Score/Validate.
- step-by-step builder.
- save/restore.
- product analytics events: stadium entry, community, training, video, return visit.

## Phase 6 — Training / Tactical / Video / Career Passport

- Schedule/Training detail.
- 2D Plan/Tactical editor.
- Session timer/set/rest/note + offline.
- video library/media permission.
- E36 Career Passport canonical event/provenance + sensor-independent timeline.

### Gate
- EPTS flag OFF 상태에서 주요 사용자 흐름 100% 가능.

## Phase 7 — Football Life / Communication / Manager Workspaces

- E39 Team Communication: operational thread/message/announcement + E40 safety gate.
- E37 Scouting consent/opportunity domain + Career Passport share projection.
- Coach Ground/Plan/Session/Review.
- Team Manager Home/Schedule/Squad/Comms.
- Club Director Club/Teams/People/Business.
- Referee Today/Matches/Match Center/Report.
- Agent Home/Players/Portfolio/Opportunities.
- Analyst Review/Reports/Search.

## Phase 8 — Search / Earthus Context / Hardening

### Search
- index minimal fields.
- visibility prefilter + post authorization.

### Optional Earthus context
- E35 behind `EARTHUS_CONTEXT_ENABLED`.
- SnapN direct public-data adapters 금지.
- Earthus provider client + normalized context projection.
- source/freshness metadata.
- timeout/stale/unavailable soft fallback.

### Hardening
- permission bypass/security.
- export/delete cascade.
- signed media URL.
- cache invalidation.
- accessibility/reduce motion.
- crash/performance telemetry.

## Phase 9+ — Hardware / AI separately approved

EPTS/Camera/Evidence AI는 별도 PoC와 release approval 없이 시작하지 않는다.

## PR Definition of Done

각 PR은 최소 다음을 포함한다.

- Scope/Engine/Algorithm IDs.
- API/schema migration 영향.
- Unit/contract/integration tests.
- permission negative test.
- loading/empty/error/offline state if UI.
- Feature Flag if incomplete/gated.
- rollback note.
- screenshots/runtime evidence for UI.

## Stop Conditions

Codex는 다음 상황에서 구현을 멈추고 보고해야 한다.

- Legacy DB ownership 불명확.
- 기존 Community behavior와 문서가 충돌.
- destructive migration이 rollback 없이 필요.
- 미성년자 permission 요구가 불명확.
- EPTS/Camera SDK를 production에 켜야만 진행 가능.
- 실제 공식 경기장/구단 IP asset 사용 여부 불명확.


## v1.3 Required Implementation Evidence

### Career Passport
- `CAREER_EVENT_SOURCE_MAP.md`
- source event idempotency tests.
- team migration + deleted media + correction tests.

### Scouting
- `SCOUTING_VISIBILITY_MATRIX.md`
- minor default deny test.
- revoked guardian consent invalidates discovery immediately.
- opportunity eligibility reason-code tests; no hidden ability score.

### Communication
- `COMMUNICATION_THREAD_CONTEXT_MAP.md`
- same announcement idempotency/fanout test.
- push outage does not lose canonical message.

### Safeguarding
- `MINOR_CONTACT_NEGATIVE_TEST_MATRIX.md`
- Agent -> unrelated minor DM DENY.
- Referee -> athlete private contact DENY unless explicit mediated policy.
- verified Coach -> own team operational message policy test.
- block/report state overrides normal RoleGrant capability.

### Earthus
- provider timeout test.
- stale cache test.
- schema version mismatch test.
- Training/Match route remains usable when context unavailable.
