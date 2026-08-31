# Claude Code 최종 개발지시서 — Stadium 기능 복구 및 상업 서비스 완성

## 0. 지시 우선순위

1. 사용자의 최신 지시
2. `HANDOFF/UPDATE_REASON_AND_FAILURE_RECORD_KO.md`
3. 이 개발지시서
4. `ORIGINAL_HANDOFF/DEVELOPMENT_DIRECTIVE_KO.md`
5. repository canonical contracts
6. 현재 코드

문서와 코드가 충돌하면 조용히 한쪽을 선택하지 말고 충돌 위치와 사용자 영향부터 보고한다.

## 1. 작업 기준

```text
Repository: icegyul/v2snapnsports
Branch: codex/stadium-commercial-finish
HEAD base: 92f7d5211b2c44b17fb9ed71924c859a4f58fc33
Source status: DIRTY, modified + untracked files 포함
Primary implementation: apps/web/src/three/stadiumWebglV14.ts
Home route: /v2/home
Entry route: /v2/home/full
Builder route: /v2/home/builder
```

`HEAD base`는 dirty 변경 이전 commit을 뜻한다. 실제 작업 기준은 archive에 들어 있는 현재 filesystem이다.

## 2. 시작 전 필수 감사

```bash
git status --short
git branch --show-current
git rev-parse HEAD
find apps/web/src/features/stadium -maxdepth 1 -type f | sort
find apps/web/src/three -maxdepth 1 -type f | sort
```

다음을 읽는다.

```text
apps/web/src/features/stadium/Stadium3DScene.tsx
apps/web/src/features/stadium/PlayerStadiumPages.tsx
apps/web/src/features/stadium/FullStadiumJourneyScene.tsx
apps/web/src/features/stadium/TeamFormation3DScene.tsx
apps/web/src/features/stadium/PlayerPosition3DScene.tsx
apps/web/src/three/stadiumScene.ts
apps/web/src/three/stadiumWebglV14.ts
apps/web/src/adapters/fixtureCoreProductAdapter.ts
apps/web/src/api/coreProductContracts.ts
```

## 3. P0-A — STATIC Home zoom 복구

현재 문제:

- `Stadium3DScene.handleWheel()`은 STATIC에서 즉시 return한다.
- pinch 처리도 STATIC을 제외한다.
- `stadiumScene.ts` STATIC zoomMin/zoomMax가 둘 다 `1`이다.
- service CSS가 fallback transform을 `none !important`로 고정한다.

요구:

- desktop wheel zoom
- mobile pinch zoom
- keyboard `+`, `-`, `0` 또는 동등한 접근 가능한 제어
- zoom 범위 제한
- pointer gesture 이후 accidental entry 방지
- reduced-motion은 자동 camera movement만 줄이고 사용자 직접 zoom은 막지 않음
- STATIC poster가 깨지거나 빈 배경이 되지 않음

테스트는 실패하는 사례부터 작성한다.

## 4. P0-B — 입장 후 즉시 전술 필드

`/home/full`의 현재 STATIC 경로는 progress를 `1`로 만들고 stage를 `SPATIAL_HOME`으로 바꾼다. 이 동작을 제품 요구로 유지하면 안 된다.

입장 직후 기본 상태:

```text
TEAM TACTICS
4-3-3
내 위치 #8 중앙 미드필더
연결된 동료 3명
```

필드 요구:

- 명확한 축구 필드 line
- 내 marker는 cyan focus + `#8 · 나`
- teammate marker는 익명 번호와 position만 사용
- fixture의 x/y 좌표를 필드 좌표로 투영
- 선택한 teammate와 내 marker 사이 연결 강조
- mobile 첫 viewport에서 필드와 주요 marker가 보임
- WebGL이 없어도 SVG/HTML tactical layer로 기능 동등성 유지
- WebGL이 있으면 tactical layer 아래 또는 같은 renderer에 pitch context를 제공할 수 있음

데이터 source:

```text
formation.shapeLabel = 4-3-3
formation.player = #8 중앙 미드필더
formation.teammates = #4 DF, #7 MF, #11 FW
```

없는 선수를 추가하지 않는다.

## 5. P0-C — 전술 화면 interaction

- 기본 선택은 내 marker
- teammate marker 클릭/키보드 선택 가능
- 선택 시 연결선과 번호 강조
- 선택된 선수의 position을 한국어 또는 contract enum 그대로 안전하게 표시
- zoom/pan 후 marker hit target 유지
- 모든 marker 최소 44px interaction target
- screen reader label 예: `동료 등번호 4, DF`

## 6. 기존 3D continuity 처리

기존 `APPROACH → PITCH → PROJECTION → POSITION → FORMATION → SPATIAL_HOME` 코드를 삭제하지 않는다. deep-link와 별도 cinematic experience로 보존할 수 있다.

하지만 기본 Home entry의 첫 결과는 전술 필드여야 한다. 6.2초 자동 sequence가 끝나야 사용 가능한 UI가 나오는 구조를 기본값으로 두지 않는다.

## 7. Motion / Anime.js

설치 상태:

```text
animejs 4.5.0
motion 13.1.1
```

현재 사용:

- Motion: Home 제목, CTA, active navigation presence
- Anime.js: SERVICE_HOME camera one-shot orbit/zoom
- Builder: step transition과 camera showcase

추가 전술 UI에서도 Motion은 marker/line presence와 selection에만 사용한다. Anime.js는 camera 또는 numeric scene value에만 사용한다. 무한 decorative loop를 만들지 않는다. 사용자 조작은 자동 motion을 즉시 취소한다.

## 8. Builder 후속 P1

Builder first frame poster는 상업적으로 보이지만 실제 interactive WebGL은 poster와 동일 수준이 아니다.

P0 전술 흐름을 닫은 뒤:

- Builder 실제 WebGL material/geometry parity
- 7단계 설정의 실제 frame difference
- poster에서 3D 전환 시 품질 급락 최소화
- desktop/mobile actual browser revalidation

완료 전 `Builder visual parity PASS`를 선언하지 않는다.

## 9. 테스트 지시

반드시 TDD로 진행한다.

최소 신규 테스트:

1. STATIC wheel/pinch zoom changes visual transform
2. zoom gesture suppresses entry click
3. `/home/full` initial tactical field visible
4. `4-3-3` visible
5. own `#8 · 나` visible
6. three teammate markers visible
7. no invented teammate marker
8. teammate selection changes active connection
9. keyboard labels and 44px targets
10. reduced-motion keeps user-controlled zoom

최종 검증:

```bash
npm run typecheck
npm test -- --run
npm run build
npm run lint
git diff --check
```

브라우저:

```text
1440×900 /v2/home
390×844 /v2/home
1440×900 /v2/home/full
390×844 /v2/home/full
```

실제 wheel, pinch 상당 gesture, entry click, own marker, teammate marker 선택을 실행한다.

## 10. 보안·권한·데이터 경계

- 실제 API/DB credential을 코드나 문서에 쓰지 않음
- RolePreference를 권한으로 사용하지 않음
- VerifiedRoleGrant 경계 유지
- 미성년자 개인정보 최소화
- fixture를 production data로 표현하지 않음
- teammate 이름·얼굴·연락처 생성 금지
- EPTS, CAMERA_AI, SPORTS_AI hard-disabled 유지

## 11. 완료 보고

다음을 각각 분리한다.

```text
CODE_EXISTS
TEST_PASS_EXECUTED
BROWSER_PASS_EXECUTED
STATIC_FALLBACK_PASS_EXECUTED
WEBGL_PASS_EXECUTED
AUTH_NOT_EXECUTED 또는 AUTH_PASS_EXECUTED
PRODUCTION_NOT_EXECUTED
```

하나를 통과했다고 나머지까지 완료로 쓰지 않는다.
