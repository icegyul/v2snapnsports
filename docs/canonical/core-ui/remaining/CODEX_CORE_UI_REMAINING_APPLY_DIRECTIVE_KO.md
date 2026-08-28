# CODEX CORE UI REMAINING APPLY DIRECTIVE — KO

## 작업명

SNAPN SPORTS V2 — CORE UI REMAINING IMPLEMENTATION APPLY

## 절대 규칙

1. 새 프로젝트 생성 금지.
2. 현재 F0 React/Vite/TypeScript/PWA foundation 유지.
3. canonical을 먼저 읽고 이 pack을 증분 적용.
4. 기존 `FixtureLegacyAdapter`를 재작성/복제하지 않음.
5. `ProductionLegacyAdapter` disabled 유지.
6. production DB/API/media/deploy 활성화 금지.
7. EPTS/CAMERA_AI/SPORTS_AI HARD DISABLED.
8. COMMUNITY_FEED_INTELLIGENCE OFF.
9. Team Communication을 Community와 합치지 않음.
10. source/provenance 없는 Career record 생성 금지.
11. 유명 실경기장 asset/브랜드 모사 금지.
12. 임의 재기획 금지.

## 1. READ FIRST

순서:
1. `docs/canonical/**`
2. `docs/implementation/**`
3. `update/**`의 기존 CORE UI pack
4. 현재 app/router/query/state/component tree
5. 현재 fixture/legacy adapter
6. 현재 tests

특히 실제 repository에서 Engine/Algorithm catalog가 이 pack의 v1.3보다 새 버전이면 **새 canonical을 우선**하고 변경점을 보고한다.

## 2. Inventory

아래를 먼저 표로 만든다.

| Area | KEEP | ADAPT | REPLACE | MISSING | Evidence |
|---|---|---|---|---|---|
| Community | | | | | |
| Training | | | | | |
| Video | | | | | |
| Career | | | | | |
| Player E2E | | | | | |
| Responsive | | | | | |
| Accessibility | | | | | |
| Tests | | | | | |

REPLACE는 canonical 충돌이나 명백한 결함 증거가 있을 때만.

## 3. Contract import

이 pack의 `src-contracts/*.ts`를 먼저 review한다.

적용 원칙:
- 프로젝트에 동일 타입이 있으면 duplicate 파일을 만들지 말고 canonical type에 merge.
- field name이 서버 generated type과 다르면 adapter mapper에서만 변환.
- raw legacy payload를 React page로 전달하지 않음.
- `contracts.ts`는 DB migration spec이 아니다.

## 4. Route apply

primary route는 현재 canonical route lock을 우선:
- `/home`
- `/training`
- `/training/:event_id`
- `/community`
- `/community/post/:post_id`
- `/community/compose`
- `/video`
- `/player/me`
- `/player/me/career`
- `/stadium`
- `/more`

scene child:
- `/home/approach`
- `/home/enter`
- `/home/position`
- `/home/formation`
- `/home/team`

현재 F0가 `/home` 단일 route + internal scene machine으로 이미 구현돼 있으면 child route를 강제로 쪼개지 말고 deep-link intent/alias로 ADAPT한다. direct URL acceptance는 유지한다.

기존 `/app/*` route는 새 canonical primary로 사용하지 않는다. 기존 사용자/bookmark 필요 시 redirect만.

## 5. Adapter apply

기존 F0 FixtureLegacyAdapter에 다음 canonical operations를 매핑:
- Community feed/detail/create/comments/reaction/report/block
- Training list/detail/attendance
- Video list/detail
- Career passport/events/highlights/visibility
- Stadium home

API/Data Contract v1.3에는 존재하지만 OpenAPI v1.4 physical contract에 없는 operation을 발견하면:
`PROPOSED_API_EXTENSION`이 아니라 **`OPENAPI_PROMOTION_GAP`**으로 기록한다.

새 endpoint를 발명하지 말고 먼저 current route/API inventory와 v1.3 canonical을 대조한다.

## 6. UI implementation order

### Commit A — Community
- Home
- Detail
- Composer
- local draft
- report/block
- hidden/empty/offline/forbidden
- sanitize + unsafe URL
- Legacy order

### Commit B — Training
- Home
- Detail
- schedule
- participation
- history seam
- forbidden metrics 문자열/component 0

### Commit C — Video
- Home/Library
- Detail
- permission
- representative video selection seam
- no fake AI/tracking

### Commit D — Career Passport
- Overview/Timeline
- season/team/position
- milestones/videos/achievements
- share seam
- provenance validation

### Commit E — Player E2E + fallback
- scene state
- direct URL/refresh/history
- bottom nav
- Static parity
- renderer failure isolation

### Commit F — Responsive/A11y
- breakpoints
- safe area
- IME
- scroll restore
- 44px
- semantic landmarks
- focus/reduced motion/high contrast

### Commit G — Tests/QA
- 10 test files
- screenshot validation
- typecheck/lint/test/build

## 7. Test migration

`tests/*.test.*`의 `Reference*` harness는 contract assertion을 설명하기 위한 실행 가능한 skeleton이다.

Codex:
1. 해당 Reference component를 실제 F0 page/component import로 교체.
2. assertion 삭제 금지.
3. fixture provider를 existing FixtureLegacyAdapter로 연결.
4. happy path + negative path 모두 통과.
5. test가 실제 UI를 검증한 뒤 Reference harness 삭제 가능.

## 8. Required screenshot matrix

최소:
- small mobile 320
- standard mobile 390
- large mobile 430
- tablet 768
- desktop 1440
- mobile landscape
- reduced motion / STATIC
- high contrast Graphite
- 20% brightness manual review proxy

각 domain:
Community / Training / Video / Career / Spatial Home.

## 9. Required commands

저장소 package manager를 audit하여 기존 명령만 사용한다. 예:
- typecheck
- lint
- vitest
- build

없는 script를 있다고 가정하지 않는다. 필요한 경우 package.json과 CI를 보존하며 최소 추가.

## 10. Hard grep gates

일반 user bundle/UI에서:
- EPTS
- CAMERA_AI
- SPORTS_AI
- fatigue
- speed metric
- AI score
- fake tracking
- pro potential
- sample analysis

가 허용된 문서/comment/test 외 실제 UI copy/component로 노출되지 않는지 전수 검색.

Community:
- `dangerouslySetInnerHTML` 사용 시 sanitizer proof 필수.
- unsafe URL scheme test.

Career:
- `source` 없는 CareerEvent render path 0.

Video:
- `assetId`로 production URL string concat 0.

## 11. Validation report

반드시 아래 형식으로 종료:

COMMUNITY READY FOR CODE: YES/NO
TRAINING READY FOR CODE: YES/NO
VIDEO READY FOR CODE: YES/NO
CAREER READY FOR CODE: YES/NO
PLAYER E2E READY FOR CODE: YES/NO

ENGINE COVERAGE: 40/40 accounted, N/40 directly bound
ALGORITHM COVERAGE: 45/45 accounted, N/45 directly bound
PROPOSED API EXTENSIONS: 0 new
OPENAPI PROMOTION GAPS: 12 operations + 1 Career Passport path reconciliation (pack baseline; repository 최신본 재대조)
PROPOSED SCHEMA EXTENSIONS: 0
PROPOSED ENGINE/ALGORITHM GAPS: 0

READY FOR CODEX APPLY: YES/NO

그 다음:
- typecheck/lint/test/build 결과
- screenshot evidence path
- scoped commit hashes
- push result

## 12. Git

- scoped commits
- unrelated files 금지
- secrets 금지
- 현재 branch/HEAD 기록
- tests 실패 상태 push 금지(기존 baseline failure가 있으면 별도 evidence)
- 사용자 요청 범위 밖 production deployment 금지
