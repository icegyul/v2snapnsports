# SNAPN SPORTS V2 Stadium Commercial Visual Acceptance

기준일: 2026-08-31 KST  
판정 범위: 로컬 production build + Chromium 140 / SwiftShader  
판정: **PASS_EXECUTED — LOCAL COMMERCIAL VISUAL / INTERACTION SCOPE**

## 1. Provenance

- Handoff source HEAD: `92f7d5211b2c44b17fb9ed71924c859a4f58fc33`
- Source branch: `feature/v2-stadium-first-screen-complete`
- Isolated local work branch: `codex/stadium-commercial-finish`
- Worktree: `/tmp/snapn-stadium-commercial-92f7d52`
- Existing `integration/v2-pack01-04-acceptance` dirty worktree: 변경하지 않음
- Commit / push / merge / deploy: 실행하지 않음

## 2. 상업용 비주얼 변경

- Builder를 일반 form dashboard에서 `STADIUM ATELIER` 방향의 cinematic architecture workspace로 재구성했다.
- desktop은 WebGL preview가 주 화면을 차지하고 정밀 control rail이 보조하며, mobile은 preview-first 단일 흐름과 safe-area를 사용한다.
- Motion `13.1.1`은 React step/layout/press transition을 담당한다.
- Anime.js `4.5.0`은 preset settle 후 one-shot showcase orbit과 contextual camera focus를 담당한다.
- reduced-motion에서는 spatial animation을 제거한다.
- Builder route를 lazy-load하여 animation libraries를 `/home/builder` 진입 시에만 내려받는다.
- Stadium Builder camera를 외관+개방 지붕+보울을 함께 읽는 showcase view로 분리했다. 일반 Stadium / Full Entry camera는 유지했다.
- BOWL / ROOF / STAND profile을 실제 renderer recipe에 연결했다.
- URBAN / PARK / COASTAL / CIVIC / NIGHT_EVENT별 sky, fog, ground, horizon atmosphere를 구현했다.
- SOLID_RIB / GLASS_BAND / LIGHT_FRAME별 facade geometry/material을 분리했다.
- DAYLIGHT / BALANCED / EVENT별 exposure, key/fill/hemisphere/practical light를 분리했다.
- MONO / DUO / GRADIENT 좌석 패턴을 실제 instance color에 연결했다. DUO는 50:50 교대 band다.
- 좌석 단계와 외관·조명 단계는 해당 편집 대상이 보이도록 contextual camera focus를 사용한다.
- Builder canvas 재사용 시 `forceContextLoss()`를 제거하고 `dispose()`로 정리하여 rapid-switch context churn을 막았다. 일반 renderer teardown의 강제 context 해제는 유지했다.

## 3. Route 계약 수정

- production `MemoryRouter`를 `BrowserRouter basename="/v2"`로 교체했다.
- `/v2/home`에서 Full Entry를 누르면 주소창이 실제 `/v2/home/full`로 변경된다.
- Full Entry 전체 stage에서 URL은 `/v2/home/full`로 유지된다.
- Builder는 별도 lazy route이며 Builder 안에서는 global bottom navigation과 Stadium Audio dock을 표시하지 않는다.

## 4. Fresh non-browser gate

| Gate | 결과 |
|---|---|
| `npm run typecheck` | PASS, error 0 |
| `npm run lint` | PASS(exit 0), error 0, 기존 warning 2 |
| `npm test -- --reporter=dot` | 46 files / **158 tests PASS** |
| `npm run build` | PASS |
| `node --test tools/stadium-frame-analysis.test.mjs` | 3/3 PASS |
| `git diff --check` | PASS |

Build output:

- main JS: `859.09 kB`, gzip `235.16 kB`
- Builder JS lazy chunk: `186.46 kB`, gzip `63.58 kB`
- main CSS: `90.41 kB`, gzip `15.09 kB`
- Builder CSS lazy chunk: `12.11 kB`, gzip `3.20 kB`

기존 baseline main JS `862.61 kB / gzip 235.46 kB`보다 main route payload는 작다. 다만 Vite 500 kB chunk warning은 남아 있다.

## 5. Same-build browser matrix

Evidence root: `output/stadium-commercial-final-same-head/`

| Matrix | Desktop 1440×1000 | Mobile 390×844@2x | 상태 |
|---|---:|---:|---|
| Stadium Visual | FULL / READY / canvas ready / console 0 | FULL / READY / canvas ready / console 0 | PASS_EXECUTED |
| Default Entry | `/v2/home` → `/v2/home/full`, single canvas | 동일 | PASS_EXECUTED |
| Full Entry | 6 stages, single canvas, same URL, anchors clear | 동일 | PASS_EXECUTED |
| Digital Projection | start→mid→end frame change, CTA clear | 동일 | PASS_EXECUTED |
| Stadium Audio | LOCKED→ENABLED→MUTED→ENABLED→route restore | 동일 | PASS_EXECUTED |
| Stadium Builder | 10 family / 20 preset / validator / save / reload | 대표 visual family + 기능 / save / reload | PASS_EXECUTED |

Full Entry stage sequence:

```text
APPROACH → PITCH → PROJECTION → POSITION → FORMATION → SPATIAL_HOME
```

Quick Entry는 동일 `/v2/home/full`에서 `SPATIAL_HOME`, single ready canvas, 5 anchors로 종료했다.

## 6. Builder frame evidence

### Representative families

| 비교 | Changed pixel ratio | Mean channel delta | Histogram distance |
|---|---:|---:|---:|
| Desktop URBAN ↔ NIGHT_EVENT | 86.64% | 16.80 | 0.4222 |
| Desktop NIGHT_EVENT ↔ PARK | 93.96% | 24.35 | 0.7580 |
| Mobile URBAN ↔ NIGHT_EVENT | 74.69% | 16.42 | 0.4498 |
| Mobile NIGHT_EVENT ↔ PARK | 79.15% | 21.33 | 0.6530 |

### Isolated profile comparisons — desktop

| 비교 | Changed pixel ratio | Mean channel delta | Histogram distance |
|---|---:|---:|---:|
| Seat MONO ↔ DUO | 12.06% | 3.15 | 0.0585 |
| Seat DUO ↔ GRADIENT | 17.27% | 3.32 | 0.0367 |
| Facade SOLID_RIB ↔ GLASS_BAND | 6.54% | 3.34 | 0.0279 |
| Facade GLASS_BAND ↔ LIGHT_FRAME | 12.40% | 4.02 | 0.0476 |
| Lighting DAYLIGHT ↔ BALANCED | 30.83% | 4.99 | 0.1908 |
| Lighting BALANCED ↔ EVENT | 17.61% | 3.80 | 0.0696 |

Seat 수치는 contextual focus frame의 실제 bowl ROI에서 계산했다. 증거 PNG는 전체 canvas를 보존한다.

### Rapid switching / resource boundary

- desktop render revision delta: `1`
- mobile render revision delta: `1`
- desktop/mobile `webglcontextlost`: `0`
- desktop/mobile console error: `0`
- representative triangle count: `1,632,856`
- NIGHT_EVENT saved frame triangle count: `1,663,228`

## 7. Data / privacy / fallback

- demo fixture임을 화면에 유지했다.
- Player `#8`, anonymous teammate `#4/#7/#11`만 유지했다.
- 없는 7명, 실제 선수 이름, avatar, production record를 만들지 않았다.
- Stadium fallback contract와 Builder save/validator fallback을 제거하지 않았다.
- Audio는 최초 LOCKED이며 user gesture 이전 AudioContext는 `NONE`이다.

## 8. Known gaps / non-claims

- 실제 production backend, tenant permission, authenticated cloud save는 검증하지 않았다.
- staging / production deployment를 실행하지 않았다.
- Firefox / WebKit cross-browser matrix를 이번 작업에서 실행하지 않았다.
- 실제 iOS / Android physical device를 실행하지 않았다.
- local Node `20.18.1`은 일부 ESLint dependency가 요청하는 `20.19+`보다 낮다. 현재 typecheck/lint/test/build는 실행 통과했다.
- 기존 `stadiumWebglPremium.ts`, `stadiumWebglPremiumV2.ts`의 unused eslint-disable warning 2개는 이번 scope 밖의 기존 경고다.
- Vite main chunk 500 kB warning은 남아 있다. Builder animation code는 lazy chunk로 분리했다.
- 이 문서는 `PRODUCTION_READY`, 배포 완료, 운영 데이터 연결 완료를 주장하지 않는다.

## 9. Final local status

- Stadium latest-head local matrix: **PASS_EXECUTED**
- Builder commercial visual / interaction local matrix: **PASS_EXECUTED**
- 3G local completion declaration: **PASS_EXECUTED within stated local scope**
- Production release: **NOT_EXECUTED**
