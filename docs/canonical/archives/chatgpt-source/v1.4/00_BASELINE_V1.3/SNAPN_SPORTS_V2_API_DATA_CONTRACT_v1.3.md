# SNAPN SPORTS V2 API & DATA CONTRACT

**v1.3 | /v2 canonical API | Football Life + Safeguarding contracts**

## 0. Contract Rules

- 모든 외부 앱 API는 `/v2/` prefix.
- 권한 판단은 서버에서 수행한다.
- organization/team/athlete 리소스는 tenant/scope 검증 필수.
- 쓰기 API는 가능한 `Idempotency-Key`를 지원한다.
- 편집형 리소스는 `version` 또는 ETag 기반 optimistic concurrency.
- 이벤트형 기록은 append-only + correction.
- 대용량 미디어는 pre-signed upload.
- 모든 민감 read/write에 audit event.
- EPTS/Camera/AI endpoint는 release gate 전 public router에 mount하지 않거나 server hard deny.

## 1. Standard Response

```json
{
  "data": {},
  "meta": {
    "request_id": "req_...",
    "server_time": "2026-08-27T18:00:00+09:00",
    "version": 12
  }
}
```

### Error

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "요청한 작업을 수행할 수 없습니다.",
    "request_id": "req_...",
    "retryable": false
  }
}
```

## 2. Identity / Role / Credential

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /v2/signup | PLAYER/MANAGER 가입 |
| GET | /v2/me | 현재 사용자/primary experience |
| PATCH | /v2/me/profile | 프로필 수정 |
| GET | /v2/me/roles | preference + RoleGrant |
| PATCH | /v2/me/role-preferences | 매니저 역할 선호 변경 |
| POST | /v2/role-verifications | 역할 검증 case 생성 |
| GET | /v2/role-verifications/{id} | 상태 확인 |
| POST | /v2/role-verifications/{id}/evidence | 증빙 제출 |
| POST | /v2/manager/switch-role | 활성 RoleGrant 전환 |

### RoleGrant

```json
{
  "role": "COACH",
  "state": "ACTIVE",
  "organization_id": "org_1",
  "team_ids": ["team_u15"],
  "capabilities": ["TRAINING_PLAN_WRITE", "TEAM_VIEW"],
  "expires_at": null
}
```

## 3. Guardian / Consent / Privacy

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /v2/guardian-invites | 보호자 초대 |
| POST | /v2/guardian-invites/{token}/accept | Guardian 연결 |
| GET | /v2/consents | 동의 현황 |
| POST | /v2/consents | 동의 grant |
| POST | /v2/consents/{id}/revoke | 동의 철회 |
| POST | /v2/privacy/exports | 데이터 내보내기 |
| POST | /v2/privacy/deletions | 삭제 요청 |
| GET | /v2/privacy/requests/{id} | lifecycle 상태 |

## 4. Organization / Team / Player

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/organizations/{id} | 조직 |
| GET | /v2/teams | visible teams |
| GET | /v2/teams/{id} | 팀 |
| GET | /v2/teams/{id}/squad | roster projection |
| GET | /v2/athletes/{id} | 권한별 athlete projection |
| GET | /v2/athletes/{id}/career | Growth/Career timeline |

## 5. My Football World / Stadium

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/stadium/home | recipe + formation + home state |
| GET | /v2/stadium/style-families | Style Family |
| GET | /v2/stadium/presets | 기본 recipe |
| POST | /v2/stadium/generate | 추천 recipe 생성 |
| POST | /v2/stadium/score | 수동 조합 점수 |
| POST | /v2/stadium/validate | 구조/IP/성능 검증 |
| PUT | /v2/stadium/recipe | 저장/복원 |
| GET | /v2/assets/stadium-manifest | device-aware asset manifest |

### `/v2/stadium/home` response minimum

```json
{
  "recipe": {"id":"R01","version":3},
  "formation": {
    "system":"4-3-3",
    "players":[{"athlete_id":"P1","slot":"LCM","x":0.42,"y":0.58,"is_me":true}]
  },
  "home_state": {
    "primary":"NEXT_TRAINING",
    "title":"내일 19:00 훈련",
    "route":"/training/TS_1"
  },
  "feature_visibility": {"epts":false,"camera_ai":false,"sports_ai":false}
}
```

## 6. Schedule / Training / Tactical

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/events | 훈련/경기/행사 일정 |
| GET | /v2/training-sessions/{id} | 세션 상세 |
| POST | /v2/training-sessions | 세션 생성 |
| POST | /v2/training-sessions/{id}/attendance | 출석/참가 상태 |
| POST | /v2/training-sessions/{id}/events | timer/set/note event |
| GET | /v2/training-plans/{id} | plan |
| PUT | /v2/training-plans/{id} | draft/update |
| POST | /v2/tactics | 전술 생성 |
| PUT | /v2/tactics/{id} | 2D tactical data update |
| GET | /v2/tactics/{id}/render | 3D projection data |

## 7. Match & Competition

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/competitions | 대회 |
| GET | /v2/matches | 역할별 경기 목록 |
| GET | /v2/matches/{id} | match aggregate |
| PUT | /v2/matches/{id}/roster | roster |
| PUT | /v2/matches/{id}/lineup | lineup |
| POST | /v2/matches/{id}/state-transitions | 상태 전이 |
| POST | /v2/matches/{id}/events | append-only match event |
| POST | /v2/matches/{id}/reports | 심판/공식 report |
| POST | /v2/matches/{id}/corrections | finalized correction |

## 8. Community

V2.0은 Legacy parity contract를 우선한다. 기존 DB/API를 직접 복제하기 전에 Adapter로 route contract를 고정한다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/community/feed | Legacy order 기본 |
| POST | /v2/community/posts | 글 생성 |
| GET | /v2/community/posts/{id} | 글 상세 |
| POST | /v2/community/posts/{id}/comments | 댓글 |
| POST | /v2/community/posts/{id}/reactions | 반응 |
| POST | /v2/community/reports | 신고 |
| POST | /v2/community/blocks | 차단 |

Feed Intelligence flag OFF일 때 response order는 legacy 기준을 보존한다.

## 9. Media / Video

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /v2/media/uploads | signed upload session |
| POST | /v2/media/uploads/{id}/complete | checksum/metadata confirm |
| GET | /v2/media/{id} | authorized media metadata |
| GET | /v2/videos | visible video library |
| POST | /v2/videos/{id}/share | 정책 범위 공유 |

## 10. Agent / Opportunity

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/agent/players | 관계/승인 선수 |
| GET | /v2/athletes/{id}/portfolio | permissioned portfolio |
| POST | /v2/opportunities | opportunity 생성 |
| POST | /v2/opportunities/{id}/actions | state action |

## 11. Search

`GET /v2/search?q=&type=`는 Authorization Engine의 prefilter와 post-check를 모두 통과한 결과만 반환한다. 숨겨진 resource count/facet leak 금지.

## 12. Notification

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/notifications | 알림함 |
| POST | /v2/notifications/{id}/read | 읽음 |
| POST | /v2/threads/{id}/response | 일정/참가응답 |

## 13. Offline Sync

```json
POST /v2/sync/batch
{
  "client_id":"ios_abc",
  "cursor":"c_102",
  "events":[
    {"event_id":"e1","local_seq":44,"type":"COACH_NOTE","idempotency_key":"...","payload":{}}
  ]
}
```

Response는 accepted/rejected/conflicts와 새 cursor를 반환. 권한/동의는 현재 서버 상태를 재검증한다.

## 14. Feature Flags

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/features | 현재 사용자에 렌더 가능한 capability |

중요 flags:
- EPTS_ENABLED=false
- CAMERA_AI_ENABLED=false
- SPORTS_AI_ENABLED=false
- COMMUNITY_FEED_INTELLIGENCE=false
- VENUE_CONTEXT_ENABLED=optional

## 15. Optional Earthus Context Context

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/context/venues/{venue_id} | 공공시설 link + 공식 context |
| GET | /v2/context/events/{event_id} | 일정 시간 기준 날씨/영향/대기질 |

### Context contract

```json
{
  "venue": {"internal_id":"v1","public_match_state":"CONFIRMED"},
  "weather": {"status":"AVAILABLE","source":"KMA","issued_at":"...","values":{}},
  "impact": {"status":"AVAILABLE","source":"KMA_IMPACT","values":{}},
  "air": {"status":"PARTIAL","source":"AIRKOREA","values":{}},
  "decision": null
}
```

`decision`은 null을 기본으로 한다. 공공데이터로 훈련 취소/출전/의료 결정을 자동 생성하지 않는다.

## 16. Audit & Observability

모든 critical action은 `request_id`, actor, active_role, organization/team scope, resource, action, result, timestamp를 남긴다.

## 17. Data Ownership Matrix

| Domain | Source of Truth |
| --- | --- |
| Identity/RoleGrant/Consent | V2 server |
| Legacy community during parity | Legacy system via Adapter |
| Team/Schedule before migration | evidence-based ownership map |
| Stadium recipe | V2 |
| Match canonical after cutover | V2 Match Engine |
| Public venue/weather/air | external official source + cached snapshot |
| EPTS/Camera/AI | FUTURE gated stores |


## 15. Football Career Passport

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/athletes/{id}/passport | 권한별 Career Passport projection |
| GET | /v2/athletes/{id}/passport/events | provenance 포함 Career Events |
| GET | /v2/athletes/{id}/passport/highlights | 대표 영상/마일스톤 |
| POST | /v2/athletes/{id}/passport/highlights | 본인/허용 사용자의 대표항목 선택 |
| PATCH | /v2/athletes/{id}/passport/visibility | 공유 범위 설정 |

### CareerEvent minimum

```json
{
  "career_event_id": "ce_...",
  "type": "TEAM_JOINED",
  "occurred_at": "2026-03-01T00:00:00+09:00",
  "title": "U15 팀 합류",
  "source": {
    "type": "TEAM_MEMBERSHIP",
    "id": "membership_...",
    "version": 4,
    "verified_state": "VERIFIED"
  },
  "visibility": "PLAYER_GUARDIAN"
}
```

## 16. Scouting Consent & Opportunity

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/scouting/preferences | 선수 스카우팅 공개 설정 |
| PATCH | /v2/scouting/preferences | opt-in/공개 필드 설정 |
| GET | /v2/scouting/opportunities | 권한/조건에 맞는 기회 목록 |
| POST | /v2/scouting/opportunities | 검증된 구단/역할의 기회 생성 |
| POST | /v2/scouting/opportunities/{id}/interest | 선수/보호자 관심 표시 |
| POST | /v2/scouting/invitations | 검증된 관계의 초대 생성 |
| POST | /v2/scouting/invitations/{id}/respond | 수락/거절 |

### Hard contract

- Minor `scouting_enabled=false` default unless guardian/policy requirements satisfied.
- API response에서 health, EPTS raw/derived metrics, internal coach notes, private video는 scouting projection에 포함 금지.
- candidate endpoint는 숨겨진 선수의 존재/건수를 leak하지 않는다.

## 17. Team Communication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/comms/threads | visible operational threads |
| POST | /v2/comms/threads | 허용 context로 thread 생성 |
| GET | /v2/comms/threads/{id}/messages | 메시지 목록 |
| POST | /v2/comms/threads/{id}/messages | 메시지 전송 |
| POST | /v2/comms/announcements | 팀/구단 공지 fanout |
| GET | /v2/comms/unread | unread summary |

Message write는 E03 Authorization + E40 Safeguarding을 모두 통과해야 한다. Push Notification은 비동기 delivery이며 message commit 성공 여부와 분리한다.

## 18. Safeguarding & Trust

### Internal policy decision

```json
{
  "action": "DIRECT_MESSAGE",
  "actor_id": "user_agent_1",
  "subject_id": "athlete_minor_1",
  "context": {"organization_id":"org_1"}
}
```

```json
{
  "decision": "REQUIRE_GUARDIAN",
  "allowed_channel": "GUARDIAN_MEDIATED_THREAD",
  "allowed_fields": [],
  "policy_version": "safety_1.0"
}
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /v2/safety/reports | 신고 생성 |
| POST | /v2/safety/blocks | 사용자/관계 차단 |
| DELETE | /v2/safety/blocks/{id} | 차단 해제 |
| GET | /v2/safety/incidents/{id} | authorized reviewer incident 조회 |
| POST | /v2/safety/incidents/{id}/actions | 제한/검토 조치 |

`/v2/safety/check`는 일반 앱 public API가 아니라 서버 내부 policy interface를 기본으로 한다.

## 19. Earthus Context Adapter

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v2/context/events/{event_id} | Earthus 기반 날씨/폭염·한파/대기질 Context projection |

- SnapN public API는 Earthus 원본 provider naming을 강제하지 않고 normalized context를 반환한다.
- `freshness_state`: FRESH / STALE / PARTIAL / UNAVAILABLE.
- Earthus 실패는 200 partial/unavailable 또는 context subresource error로 처리하되 Event API 자체를 실패시키지 않는다.
