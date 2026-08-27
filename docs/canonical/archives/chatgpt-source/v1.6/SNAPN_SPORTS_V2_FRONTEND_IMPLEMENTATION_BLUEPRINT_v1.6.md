# SNAPN SPORTS V2 FRONTEND IMPLEMENTATION BLUEPRINT

**v1.6 | Frontend Lock | 2026-08-27**

## 0. Source of Truth 및 구현 전제
1. Safety / 개인정보 / 미성년자 보호 / 승인된 운영 정책
2. v1.4 Physical Contracts: OpenAPI, UI Component Contract, Test Gate, Community Parity
3. v1.5 Backend Implementation Contract / Error Registry
4. v1.3 UI/UX Screen Spec / My Football World / Football Life
5. Legacy frontend repository/runtime의 READ-ONLY Audit 증거
6. 시각 레퍼런스

v1.6은 **논리 Frontend 구조를 잠그는 문서**다. 현재 저장소의 React/React Native/Flutter/웹 프레임워크, router, query library, state library, 3D runtime을 Audit 전에 임의로 교체하거나 확정하지 않는다.

## 1. Frontend 구현 목표
- 첫 인상은 기능 대시보드가 아니라 My Football World다.
- 공개 가입은 PLAYER / MANAGER 두 개만 노출한다.
- Player bottom nav는 HOME / TRAINING / COMMUNITY / VIDEO / MORE를 유지한다.
- Manager는 verified RoleGrant에 따라 Coach / Team Manager / Club Director / Referee / Agent / Analyst Workspace를 전환한다.
- 3D는 정체성·탐색·전술 설명, 2D는 입력·편집·관리·긴 목록의 기본 UI다.
- Community는 V2.0에서 Legacy parity를 우선한다.
- EPTS / Camera AI / Sports AI는 release approval 전 일반 사용자 UI에 존재하지 않는다.
- Earthus 환경정보는 보조 Context이며 장애가 훈련/경기 화면을 막지 않는다.

## 2. Reference Frontend Runtime Topology
```text
App Bootstrap
  -> Session Restore
  -> GET /v2/me + GET /v2/features
  -> Capability Projection
  -> Role-aware Router
       |-> Player App Shell
       |-> Guardian Invite Shell
       |-> Manager Role Shell
  -> Feature View Models
  -> API/Query/Cache Adapter
  -> Offline Sync / Media Upload
  -> 3D Runtime + Asset Loader + Semantic Navigation Bridge
```

## 3. Canonical Logical Directory Contract
```text
frontend/
  app/                  # bootstrap, providers, session restore
  navigation/           # routes, role projections, deep links
  features/             # auth/player/manager/training/match/community/...
  components/           # primitives + composites
  data/                  # OpenAPI client, query/cache adapters
  state/                 # local/session/offline state boundaries
  scene3d/               # runtime, assets, bridge
  contracts/             # generated types/tokens/feature/error registries
  analytics/
  accessibility/
  tests/                 # unit/contract/visual/e2e/role/offline/3d
```
실제 저장소 구조가 다르면 강제 rename하지 않고 **책임 매핑 문서**를 작성한다.

## 4. App Shell / Navigation Contract
### Public Shell
Splash → Login → Signup Type → Player/Manager Onboarding. Guardian 공개 가입 CTA는 없다.

### Player Shell
HOME / TRAINING / COMMUNITY / VIDEO / MORE. Growth/Career는 HOME의 My Player Card에서 진입한다.

### Manager Shell
Manager common profile/role settings는 공통이고 실제 workspace tab은 active verified grant로 결정한다.

### Route Guard 순서
session → account → feature visibility → verified role grant → tenant/subject scope → consent/safeguarding → screen load.

## 5. Role Projection
Role preference는 UI personalization 입력일 뿐 authority가 아니다. privileged workspace는 `GET /v2/me`가 제공하는 verified grant/capability projection만 사용한다. deep link도 동일 guard를 통과한다.

## 6. State Management Contract
- **Session state:** secure local persistence. 인증/계정 상태만.
- **Capability state:** 서버 권위. RoleGrant/entitlement/feature visibility.
- **Server/query state:** API cache가 소유. 화면 local state로 복제 금지.
- **Draft state:** form/builder/composer 단위. conflict 시 보존.
- **3D scene state:** camera/phase/selected object/device tier 등 ephemeral.
- **Offline state:** durable local event queue + sync cursor.
- **Media state:** upload progress/checksum/resume.

## 7. API Client / Query Contract
- OpenAPI operationId를 canonical client contract로 사용한다.
- API call은 screen에서 raw URL로 직접 호출하지 않는다.
- 403은 UI hide로 성공 처리하지 않는다; forbidden projection 또는 safe redirect.
- 409 conflict는 local draft를 보존하고 reconcile UX를 제공한다.
- signed media URL은 short-lived display token이며 영구 state에 저장하지 않는다.
- Earthus unavailable/stale는 core event query 성공을 유지한다.

## 8. My Football World Render Architecture
### FULL
첫 실행 또는 명시적 재생. Stadium Exterior → Stand → Pitch → My Card → Team Formation → Scoreboard.

### FAST
일반 진입. 0.8~1.5초 목표. target test set에서 3초 내 My Position + Next Event 인지.

### LIGHT
저사양/thermal/low-power. style identity는 유지하고 비용 높은 환경/관중/효과를 줄인다.

### STATIC
3D 실패/미지원/reduce-motion. 정적 경기장/피치 + 동일 formation + 동일 core navigation.

## 9. Formation / My Position Binding
- `getStadiumHome`/server snapshot을 유일한 formation source로 사용한다.
- 본인 marker/card의 우선순위는 동료보다 높지만 게임식 종합능력치 숫자를 생성하지 않는다.
- 3D와 2D fallback은 동일 coordinate mapping contract를 사용한다.
- 타 선수 민감 데이터와 내부 코치 메모는 marker payload에 포함하지 않는다.

## 10. 3D ↔ 2D Semantic Bridge
3D object는 DB/API를 직접 변경하지 않는다. `semantic_action`을 emit하고 Router/Feature가 처리한다.
- My Player → Player/Career
- Pitch → Training/Tactics
- Scoreboard → Next Event
- Legacy Wall → Career Passport
- Clubhouse → role-appropriate team/club route
- Camera object → Video; Camera AI controls는 hard-disabled 동안 미노출

## 11. Asset Loader / Performance Contract
- Asset manifest → bundle resolve → download → checksum verify → cache → ready.
- 실패 시 degraded/static으로 즉시 전환하고 shell은 계속 사용 가능.
- App shell p75 <= 2.5s, 3D first frame p75 <= 4.0s.
- visible tris: LOW <350k / MID <700k / HIGH <1.2M.
- pitch focus 시 facade/environment LOD를 낮추고 seat는 instancing을 우선한다.
- bottom sheet/panel open/background에서는 render를 pause 또는 10fps 이하로 제한한다.

## 12. Loading UX
- Splash는 Logo + 실제 초기화 progress만. 마케팅 카드 과다 금지.
- Stadium bundle이 추가 다운로드될 때 progress를 보여주되 usable 2D shell을 가리지 않는다.
- Community/Video list는 skeleton + pagination 상태.
- 무한 spinner보다 stage/remaining state를 명확히 표현한다.

## 13. Community / Communication Contract
Community는 체류/소셜 공간, Team Communication은 운영 대화다. 같은 컴포넌트/route로 합치지 않는다.
Community V2.0은 기존 ordering/pagination/visibility/report/block/media semantics를 유지한다. Feed Intelligence는 OFF default다.

## 14. Training / Match Field UX
Coach Session과 Referee Match Center는 field mode로 동작하며 큰 touch target, 화면꺼짐 방지 옵션, offline event log, sync status를 제공한다. UI action은 먼저 local durable event로 기록한 뒤 서버 동기화할 수 있어야 한다.

## 15. Feature Visibility / Future Hardware
`EPTS`, `CAMERA_AI`, `SPORTS_AI`가 HARD_DISABLED이면 component, route, badge, placeholder metric 자체가 렌더링되지 않는다. 내부 beta도 server capability + release approval이 모두 있어야 한다.

## 16. Error / Conflict Projection
Backend v1.5 error registry를 UI registry에 1:1 매핑한다. 권한/미성년자 오류는 resource 존재나 타 선수 metadata를 추가 노출하지 않는다. `RESOURCE_VERSION_CONFLICT`는 Stadium Builder/Plan draft를 버리지 않는다.

## 17. Offline / Sync UX
- pending count / last sync / conflict 여부를 field workspace에서 확인 가능.
- 네트워크 단절은 core field operation을 멈추지 않는다.
- `client_id + local_event_id`가 화면/스토리지 모델의 stable key다.
- sync conflict는 silent overwrite 금지.

## 18. Responsive Contract
- Mobile-first.
- Phone: bottom nav + bottom sheets.
- Tablet: split pane 허용. Coach/Referee field workspace는 가독성 우선.
- Desktop/Web: Stadium Builder/Admin/Club operational screens에서 wider panels 허용.
- breakpoint는 implementation token을 사용하고 device model 이름 하드코딩 금지.

## 19. Accessibility / Motion
- 주요 touch 44px 이상, field mode 52px 권장.
- 색상만으로 상태 구분 금지.
- dynamic type/screen reader/focus order 지원.
- reduce-motion에서 cinematic camera spline 금지; dissolve/static transition.
- 3D off 상태에서도 기능 동등성 유지.

## 20. Frontend Privacy / Security
- 권한 판단은 서버가 수행하되 client도 restricted route를 cache에 남기지 않는다.
- logout/account switch 시 sensitive query cache/scene marker를 clear한다.
- signed media URL은 만료 후 refresh하며 local permanent storage 금지.
- analytics에는 message body, minor private profile, raw token을 넣지 않는다.

## 21. Analytics / Product Telemetry
측정은 제품 개선용 event contract로 제한한다. 예: app_shell_usable, stadium_entry_mode, home_primary_cta_seen, community_opened, role_switch_result, offline_queue_size, 3d_fallback_reason. 선수 능력평가와 경기장 취향 telemetry를 혼합하지 않는다.

## 22. Frontend Test Architecture
Unit / Contract / Visual / Role / Security / Offline / 3D / E2E / Performance suites를 분리한다. Golden Screens와 Golden Acceptance Scenarios를 release evidence로 저장한다.

## 23. Implementation Sequence
F0 READ-ONLY Frontend Audit → F1 Bootstrap/Auth/Role Shell → F2 Legacy Community Parity → F3 My Football World → F4 Stadium Builder → F5 Training/Match Offline Workspaces → F6 Manager Role Workspaces → F7 Career/Opportunity/Communication → F8 Accessibility/Performance/Release Hardening.

## 24. READ-ONLY Audit 출력
- FRONTEND_STACK_INVENTORY.md
- FRONTEND_ROUTE_INVENTORY.md
- FRONTEND_STATE_DATA_FLOW.md
- FRONTEND_3D_ASSET_AUDIT.md
- FRONTEND_COMMUNITY_PARITY_AUDIT.md
- FRONTEND_GAP_ANALYSIS_v1.6.md
- FRONTEND_STACK_BINDING_v1.6.md

## 25. Definition of Done
화면이 보이는 것은 완료가 아니다. 역할/권한, remote states, offline, 3D fallback, API/error contract, accessibility, performance, visual golden test가 모두 통과해야 완료다.
