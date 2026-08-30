# SNAPN SPORTS V2 — 3D STADIUM / SPATIAL HOME / BUILDER CONTINUATION DIRECTIVE

기준일: 2026-08-30
대상: Claude Code / Codex continuation
Repository: `icegyul/v2snapnsports`
Continuation branch: `feature/v2-stadium-first-screen-complete`
PR: `#1` → base `integration/v2-pack01-04-acceptance`

> 이 문서는 새 프로젝트를 시작하기 위한 기획서가 아니다. 현재 repository와 현재 branch를 그대로 이어받아 남은 작업을 닫기 위한 개발 지시문이다.

---

## 0. 절대 원칙

다음 작업을 하지 않는다.

- 새 프로젝트 생성 금지
- React/Vite/TypeScript/PWA foundation 재구축 금지
- 기존 3D Stadium engine 재작성 금지
- 기존 Three.js renderer를 다른 엔진으로 교체 금지
- 기존 working tree / branch history 초기화 금지
- `git reset --hard`, `git clean`, 무차별 restore 금지
- 기존 accepted route를 삭제하고 새 route만 남기는 방식 금지
- 유명 실제 경기장 구조/브랜드/IP를 그대로 복제 금지
- 실제 선수 이름, 개인정보, fake production record 생성 금지
- EPTS / CAMERA_AI / SPORTS_AI hard-disabled 정책 우회 금지
- STATIC fallback 제거 금지
- 브라우저 화면이 보인다는 이유만으로 완료 선언 금지

작업 시작 시 반드시 현재 branch HEAD와 변경 상태를 먼저 확인한다.

```bash
git status --short
git branch --show-current
git rev-parse HEAD
```

정본 branch가 `feature/v2-stadium-first-screen-complete`가 아니면 임의 변경하지 말고 현재 상태를 먼저 감사한다.

---

## 1. 제품 목표

SnapN Sports V2의 Player Stadium은 단순한 배경 3D가 아니다.

최종 경험은 아래 흐름을 실제 Three.js 장면과 실제 제품 데이터 projection으로 연결해야 한다.

```text
STADIUM EXTERIOR
→ APPROACH
→ BOWL CROSSING
→ PITCH ENTRY
→ DIGITAL PROJECTION
→ MY PLAYER POSITION
→ TEAM FORMATION
→ SPATIAL HOME
→ STADIUM BUILDER / DIY
```

핵심 기준:

1. 하나의 축구 경기장으로 인식되는 실제 3D 구조
2. 외부에서 내부로 들어가는 연속 카메라 경험
3. 피치 레벨까지 내려가는 실제 camera transform
4. 사용자 자신의 위치와 팀 형태를 3D로 읽을 수 있어야 함
5. Stadium이 메뉴 장식이 아니라 Spatial Home으로 기능해야 함
6. Builder에서 만든 generic stadium recipe가 동일 renderer를 통해 재현 가능해야 함
7. desktop / mobile / fallback mode 모두 안전해야 함

---

## 2. 현재 구현된 3D Stadium 계보

현재까지의 주요 단계는 다음과 같다.

### V15.29 — Stadium first screen
- 실제 Three.js/PBR 기반 경기장
- pitch / seating tiers / crowd instancing / roof / truss / columns / floodlights / scoreboard / ad boards
- FULL/QUICK/LIGHT/STATIC fallback foundation

### V15.30 — Real Stadium Approach
- `/home/approach`
- CSS zoom이 아니라 실제 Three.js camera transform
- exterior → rim → inside
- desktop/mobile 별 camera coordinates

### V15.31 — Exterior Facade
- exterior plaza
- concrete lower wall
- glass concourse band
- upper metal facade
- vertical fins / entrance blocks / accent rings

### V15.32 — Real Pitch Entry
- `/home/enter`
- bowl → touchline → pitch level
- 실제 camera descent
- desktop/mobile browser evidence 확보

### V15.33 — My Player Position 3D
- `/home/position`
- 현재 fixture #8 중앙 미드필더 위치를 실제 pitch coordinate에 projection
- privacy accessibility contract 유지
- teammate public identity 미노출

### V15.34 — Team Formation 3D
- 연결된 실제 fixture marker만 사용
- 현재 fixture는 player + anonymous teammate #4/#7/#11
- 없는 7명을 임의 생성하지 않음

### V15.35 — Spatial Home
- 경기장 위 실제 기능 anchor 5개
- desktop/mobile interaction
- Stadium을 제품 navigation surface로 사용

### V15.36 — Live 3D Scoreboard
- DOM overlay 복제가 아니라 실제 scoreboard PlaneGeometry의 CanvasTexture 갱신
- team state / formation / next training / next match projection

### V15.37 — Digital Projection / Stadium Audio acceptance
- Digital Projection browser acceptance 완료 이력 존재
- Audio는 autoplay 금지, user opt-in 기반 WebAudio lifecycle
- Full Entry 전환 이후 verifier가 구 route를 가정했던 문제가 수정됨

### V15.38 — Full Entry
- `/home/full`
- 같은 URL, 같은 WebGL canvas에서 다음 6 stage를 연속 수행하도록 구현

```text
APPROACH
→ PITCH
→ PROJECTION
→ POSITION
→ FORMATION
→ SPATIAL_HOME
```

- Quick Entry도 같은 route에서 최종 Spatial Home으로 이동

### V15.39 — Default Entry activation
- 기본 `/home`의 Stadium entry를 `/home/full`로 전환
- 과거 `/home/approach`, `/home/enter`, `/home/projection` 등은 deep-link/fallback으로 보존

---

## 3. 3G Stadium Builder / DIY 현재 상태

Builder는 문서가 아니라 실제 코드로 시작되어 있다.

현재 제공해야 하는 7단계 구성:

```text
STYLE
→ BOWL
→ ROOF
→ STAND
→ SEAT
→ FACADE / LIGHT
→ ENVIRONMENT
```

현재 구현된 핵심:

- generic style family 10개
- preset 20개
- `StadiumBuilderDraft`
- semantic compatibility validator
- current Three.js `StadiumRecipe` 변환
- revision 기반 save / restore
- stale revision conflict detection
- `/home/builder` 격리 route
- live Three.js preview
- desktop/mobile Builder Browser acceptance
- 빠른 preset 전환 시 WebGL context churn 방지를 위한 preview rebuild debounce

Builder Browser acceptance에서 전체 unit suite가 `146/146 PASS`였던 검증 시점이 있다.

그 이후 Builder visual profile을 실제 renderer에 더 강하게 연결하는 변경이 추가되었다. 따라서 **현재 패키지 HEAD에서 전체 matrix를 다시 실행하는 것이 P0**다.

---

## 4. Builder Visual Runtime 확장

Builder 설정이 숫자/텍스트만 바뀌지 않도록 `StadiumRecipe`에 optional Builder visual profile이 추가되었다.

일반 Stadium recipe에는 값이 없으므로 기존 경기장 외관을 보존해야 한다.

Builder에서 연결 대상:

### Seat pattern
- MONO
- DUO
- GRADIENT

좌석 instanceColor가 pattern에 따라 실제로 달라져야 한다.

### Environment profile
예:
- URBAN
- PARK
- COASTAL
- CIVIC
- NIGHT_EVENT

fog / environment intensity / scene atmosphere가 달라져야 한다.

### Lighting profile
예:
- DAYLIGHT
- BALANCED
- EVENT

renderer tone mapping exposure / stadium lighting perception이 달라져야 한다.

### Facade profile
예:
- SOLID_RIB
- GLASS_BAND
- LIGHT_FRAME

외관 재질의 metalness / roughness / emissive / transparency 계열이 실제 geometry/material 결과에 반영되어야 한다.

최근 semantic 수정:
- `DAYLIGHT`는 environment profile이 아니라 lighting profile이다.
- environment intensity 계산에서 이 의미가 섞이지 않도록 수정됨.

---

## 5. 핵심 코드 위치

### Stadium renderer

```text
apps/web/src/three/stadiumWebglV14.ts
apps/web/src/three/stadiumWebglV151.ts
apps/web/src/three/stadiumWebgl.ts
```

`stadiumWebglV14.ts`가 실질적인 geometry/PBR 구현 정본이다.

Renderer contract 주요 capability:

```ts
render(orbit, zoom)
renderApproach?(progress)
renderPitchEntry?(progress)
renderPlayerPosition?(progress, x, z)
renderTeamFormation?(progress, ownX, ownZ, teammates)
renderDigitalProjection?(progress)
updateScoreboard?(state)
destroy()
```

### Stadium product pages / scenes

```text
apps/web/src/features/stadium/
apps/web/src/routes/PlayerStadiumPages.tsx
```

주요 scene:

```text
Stadium3DScene
StadiumApproachScene
PitchEntryScene
PlayerPosition3DScene
TeamFormation3DScene
FullStadiumEntryScene
```

### Builder

```text
apps/web/src/features/stadium-builder/
```

주요 역할:

```text
StadiumBuilderPage.tsx          # Builder UI / stage control
StadiumBuilderPreview.tsx       # debounced Three.js live preview
stadiumBuilderModel.ts          # draft / preset / validator / recipe conversion
stadiumBuilder.css              # responsive UI
```

### Fixture / product data

```text
apps/web/src/adapters/fixtureCoreProductAdapter.ts
apps/web/src/api/coreProductContracts.ts
```

현재 demo fixture는 synthetic fixture다.
실제 production 데이터처럼 표현하지 않는다.

---

## 6. 개인정보 / teammate projection 원칙

현재 formation fixture는 전체 11명이 아니다.

현재 연결된 정보만 표시한다.

예:

```text
나: #8 중앙 미드필더
동료: #4 DF
동료: #7 MF
동료: #11 FW
```

하지 말 것:

- 빠진 7명을 임의 생성
- teammate publicName 임의 노출
- avatar fake 생성
- real player identity 추정

기존 accessibility/privacy regression test를 유지한다.

---

## 7. Full Entry continuity 계약

`/home/full`은 route 6개를 순차 이동하는 가짜 연속 경험이면 안 된다.

Acceptance 기준:

- URL이 `/v2/home/full`에서 유지
- WebGL canvas가 하나
- 같은 renderer lifecycle에서 stage 변경
- APPROACH → PITCH → PROJECTION → POSITION → FORMATION → SPATIAL_HOME 순서
- stage transition 중 갑작스러운 다른 page cut 금지
- 마지막 Spatial Home anchor 활성
- Quick Entry는 최종 state로 안전하게 skip
- reduced-motion 지원
- mobile bottom navigation 침범 금지

기존 개별 route는 fallback/deep-link로 남긴다.

---

## 8. Stadium Audio 계약

Audio는 반드시 user opt-in이다.

금지:
- 자동재생
- 최초 진입 시 AudioContext 임의 running

필수:

```text
LOCKED
→ user gesture
→ RUNNING
→ stage cue change
→ mute
→ unmute
→ route leave / return state restoration
```

Full Entry 이후 verifier는 과거 `/home/approach` 제목을 기다리면 안 된다.
현재 stage는 다음 중 하나를 사용한다.

```text
APPROACH
PITCH
PROJECTION
POSITION
FORMATION
SPATIAL_HOME
```

DOM visibility만으로 판정하지 말고 필요한 경우 state attribute + geometry를 함께 검증한다.

---

## 9. Fallback / performance 원칙

지원 mode:

```text
FULL
QUICK / FAST
LIGHT
STATIC
```

- WebGL 실패 시 제품 전체가 죽으면 안 된다.
- Builder preview가 FALLBACK이어도 validator/save 기능은 유지한다.
- context churn 방지를 위해 Builder preview renderer rebuild는 debounce 유지.
- renderer destroy 시 geometry/material/texture 정리 유지.
- mobile에서는 과도한 DPR, shadow, instance count 확대 금지.

Builder에서 사용자가 preset을 빠르게 넘겨도 매 클릭마다 renderer를 즉시 재생성하지 않는다.

---

## 10. P0 — 패키지를 받은 즉시 실행할 검증

패키지 HEAD는 문서/패키징 커밋 때문에 functional baseline SHA보다 뒤일 수 있다.
정확한 SHA는 패키지 루트의 `SOURCE_HEAD.txt`를 사용한다.

먼저:

```bash
npm ci
npm run typecheck
npm run lint
npm test -- --reporter=dot
npm run build
```

기대:
- typecheck error 0
- lint error 0
- unit/integration suite 전부 PASS
- 최근 Builder acceptance 기준 총 test는 146개였음
- test 수가 늘어난 경우 숫자를 하드코딩하지 말고 `all pass`를 기준으로 판정

그 다음 browser acceptance:

1. Stadium Visual Verify
2. Full Entry Browser Verify
3. Digital Projection Browser Verify
4. Stadium Audio Browser Verify
5. Default Entry Browser Verify
6. Stadium Builder Browser Verify

최신 Builder visual runtime mapping 이후에는 위 matrix를 반드시 같은 HEAD로 다시 닫는다.

---

## 11. P1 — Builder visual acceptance 강화

단순 `READY`만 보지 말고 실제 frame difference를 증명한다.

대표 비교 최소 세트:

```text
URBAN DAY
NIGHT_EVENT
PARK or COASTAL
```

확인:

- frame bytes / pixel histogram 차이
- exposure 차이
- fog/background 차이
- seat pattern 차이
- facade material 차이
- console error 0
- WebGL context loss 0

20개 preset의 semantic validity는 unit test가 책임지고,
실브라우저는 대표 visual families + rapid switching stability를 책임진다.

---

## 12. P2 — Builder 실제 편집 UX

현재 preset 중심에서 다음을 단계적으로 확장한다.

### STYLE
- generic family 선택
- 유명 실제 경기장 이름 금지

### BOWL
- tierCount
- bowl profile
- safe numeric range

### ROOF
- coverage
- profile
- column structure compatibility

### STAND
- stand density / profile
- geometry budget guard

### SEAT
- pattern
- fill density
- color/accent

### FACADE / LIGHT
- facade profile
- lighting profile
- excessive emissive guard

### ENVIRONMENT
- environment profile
- fog/exposure/environment intensity

모든 입력은 validator를 통과해야 save 가능하도록 유지한다.

---

## 13. P3 — Spatial Home과 Builder 연결

Builder가 acceptance 완료되기 전까지 Spatial Home anchor를 임의 추가하지 않는다.

완료 후 다음 선택지를 검토:

- 사용자 stadium customization 진입점
- saved draft thumbnail / preview
- current recipe 적용 / reset
- versioned draft

실제 사용자 권한/tenant scope가 확인되기 전 cloud save를 임의 연결하지 않는다.

---

## 14. 브라우저 evidence 규칙

각 단계 완료 시 최소:

- changed files
- route
- test 결과
- browser screenshot
- desktop/mobile
- console error count
- fallback 여부
- known gaps

성능 관련 변경 시:

- FPS 또는 frame duration
- memory 또는 renderer resource trend
- triangle/instance 규모

을 가능한 범위에서 기록한다.

`Visible = PASS`가 아니다.

---

## 15. 현재 알려진 중요한 이력

- Builder browser acceptance는 debounce 적용 후 SUCCESS 이력이 있음.
- 해당 검증에서 typecheck/lint/test/build 및 desktop/mobile Builder 조작이 통과함.
- 전체 suite는 그 시점 기준 `146/146 PASS`.
- 이후 Builder visual profile을 Three.js runtime에 추가 연결함.
- 그 다음 lighting/environment semantic condition 수정이 추가됨.
- 따라서 패키지 HEAD에서 전체 acceptance를 다시 실행해야 최종 3G PASS 선언 가능.

---

## 16. 완료 선언 조건

### 3A~3F 완료

다음이 동일 HEAD에서 PASS일 때:

- Stadium Visual
- Full Entry
- Projection
- Position
- Formation
- Spatial Home
- Scoreboard
- Audio lifecycle
- Default Entry
- desktop/mobile
- fallback contract

### 3G Builder 완료

추가로:

- 10 style family / 20 preset semantic contract PASS
- validator PASS
- save/reload/revision conflict PASS
- rapid preset switching context stability PASS
- visual profile 실제 frame difference PASS
- desktop/mobile PASS

이전 acceptance가 있더라도 최신 renderer 코드가 바뀌었으면 다시 실행한다.

---

## 17. 최종 개발자의 첫 행동

1. `SOURCE_HEAD.txt` 확인
2. branch / git status 확인
3. 이 문서와 `CURRENT_STATUS_KO.md` 읽기
4. `npm ci`
5. typecheck/lint/test/build
6. 최신 HEAD에서 browser acceptance 재실행
7. failure가 있으면 verifier 완화 전에 제품 원인과 verifier 원인 분리
8. latest visual Builder acceptance를 닫기
9. 그 이후에만 Spatial Home ↔ Builder integration 확장

---

## 18. 한 줄 인수인계

**새 Stadium을 만들지 말고, 현재 Three.js Stadium + Full Entry + Spatial Home + Builder 정본을 그대로 이어받아 최신 HEAD의 전체 browser acceptance를 닫은 뒤 Builder visual/UX를 완성한다.**
