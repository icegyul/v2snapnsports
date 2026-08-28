# SNAPN SPORTS V2 — CORE UI REMAINING IMPLEMENTATION MASTER

## 0. 판정

- CANONICAL SPECS READY FOR IMPLEMENTATION: **YES**
- F0 FOUNDATION: **KEEP / DO NOT REDESIGN**
- READY TO APPLY FINAL UI DESIGN: **YES**
- SAFE FOR LOCAL DEVELOPMENT: **YES**
- SAFE FOR STAGING: **NO**
- SAFE FOR PRODUCTION CUTOVER: **NO**
- COMMUNITY FEED INTELLIGENCE: **OFF**
- EPTS / CAMERA_AI / SPORTS_AI: **HARD DISABLED**
- EARTHUS: **SOFT DEPENDENCY**
- Team Communication: **Community와 별도 domain**
- Production API / DB / media / deploy: **이번 pack에서 변경 금지**

## 1. Source of Truth

| 우선순위 | 정본/기반 | 본 패키지 적용 |
|---|---|---|
| 1 | 현재 V2 canonical / Engine Catalog v1.3 / Algorithm Catalog v1.3 | 엔진·알고리즘 ID를 임의 변경하지 않음 |
| 2 | API/Data Contract v1.3 | Training/Community/Video/Career 논리 API 계약 |
| 3 | OpenAPI v1.4 physical contract | 충돌 endpoint 생성 금지, 누락은 promotion gap으로 표시 |
| 4 | UI Component Contract v1.4 | LOADING/EMPTY/ERROR/OFFLINE/FORBIDDEN/STALE |
| 5 | Frontend + Graphite visual lock v1.7 | canonical player routes, Graphite, hard-disabled UI 규칙 |
| 6 | 기존 CORE UI implementation pack | F0/기존 파일을 KEEP 우선, 이번 pack은 remaining 증분 |

## 2. 이번 pack의 범위

1. Community UI
2. Training UI (Player)
3. Video UI
4. Career Passport UI
5. Player canonical E2E
6. Responsive / Accessibility
7. Test / Acceptance Contract

이 패키지는 화면 설명서가 아니라 **React props + DTO + routes + state machine + adapter boundary + engine/algorithm binding + tests + Codex apply directive**를 제공한다.

## 3. 기존 pack과 충돌 방지 원칙

- 기존 F0의 `FixtureLegacyAdapter`를 새로 만들지 않는다. `src-contracts/adapters.ts`의 `FixtureLegacyAdapterPort`를 기존 구현에 **ADAPT**한다.
- `ProductionLegacyAdapter`는 계속 disabled 상태를 유지한다.
- 기존 canonical route를 우선한다. v1.7 route lock의 `/home`, `/training`, `/community/post/:post_id`, `/community/compose`, `/video`, `/player/me/career`, `/more`를 primary로 사용한다.
- 기존 CORE UI pack의 `/app/*` 값은 migration alias로만 취급한다.
- Community V1 ordering과 write ownership은 Legacy parity가 정본이다.
- Career Passport는 E36 canonical projection이며 Legacy Wall/Growth는 presentation/projection이다.
- 3D scene state는 business truth가 아니다.

## 4. Graphite Lock

- Background `#121416`
- Surface1 `#1C2023`
- Surface2 `#282D31`
- Elevated `#353C41`
- Primary `#F4F6F7`
- Secondary `#B8C0C5`
- Pitch Green `#62D36D`
- Dark Navy 금지
- 색상만으로 상태 전달 금지
- 구형/저밝기 LCD에서도 surface/border 경계를 유지

## 5. 공통 UI 상태

`LOADING → READY | EMPTY | ERROR | OFFLINE | FORBIDDEN | STALE`

mutation이 필요한 화면은 `SAVING`, offline journal은 `SYNCING`, 정책상 쓰기 제한은 `READ_ONLY`를 추가할 수 있다.

### 상태 의미

- LOADING: skeleton/shell을 먼저 표시. 3D 로드가 앱 shell을 막지 않음.
- EMPTY: 데이터가 0건인 정상 상태.
- ERROR: usable cache가 없고 request 실패.
- OFFLINE: navigation 유지, cache가 있으면 stale badge.
- FORBIDDEN: hidden resource의 존재·소유자·팀 정보를 누설하지 않음.
- STALE: last updated/source timestamp 표시.
- SAVING: draft를 보존하며 중복 submit 방지.
- SYNCING: local journal을 서버 ack 전에 삭제하지 않음.
- READ_ONLY: 권한/정책/legacy write owner 때문에 보기만 허용.

## 6. Canonical Player Flow

`Login → EXTERIOR → APPROACH → PITCH_ENTRY → MY_POSITION → TEAM_REVEAL → SPATIAL_HOME`

Spatial Home 이후 bottom nav:

`HOME / TRAINING / COMMUNITY / VIDEO / MORE`

Career는 bottom tab이 아니다.

`My Player Card → /player/me/career`

## 7. STATIC parity hard contract

STATIC에서도 아래를 잃으면 안 된다.

- Player identity
- Team context
- Formation context
- Next training
- Next match
- Bottom navigation
- Core actions
- My Player → Career Passport 진입

3D renderer/context/asset 실패는 `downgradeVisualMode()`로 처리하며 앱 전체 ERROR로 승격하지 않는다.

## 8. API 기준

이번 pack은 **신규 production endpoint를 만들지 않는다.**

API/Data Contract v1.3에 이미 존재하지만 OpenAPI v1.4 physical contract에 빠진 operation은 `PROMOTE_V1_3_TO_OPENAPI`로 분류했다. 이는 새로운 제품 API 제안이 아니라 physical contract 승격 작업이다.

신규 API 확장: **0**

OpenAPI 승격 gap(pack baseline): **12 operations**(Training detail/attendance, Community detail/reaction/report/block, Video library/detail, Career events/highlights/visibility 등) + **Career Passport path 1건 reconciliation**. 모두 기존 v1.3 canonical operation 정합화이며 신규 제품 API 제안이 아니다. Codex는 repository 최신 OpenAPI와 재대조한다.

## 9. 구현 파일

### src-contracts
- `contracts.ts`
- `routes.ts`
- `state-machines.ts`
- `adapters.ts`
- `community-components.ts`
- `training-components.ts`
- `video-components.ts`
- `career-components.ts`
- `player-flow-components.ts`

### tests
Vitest + React Testing Library 형태의 contract/acceptance skeleton 10개.

## 10. DONE 의미

화면 하나가 DONE이 되려면 동시에 아래 10개를 만족한다.

`Design + Component + Route + State + Adapter + Permission + Engine + Fallback + Test + Accessibility + Responsive`

단순 컴포넌트 존재 또는 screenshot 한 장으로 DONE 판정하지 않는다.
