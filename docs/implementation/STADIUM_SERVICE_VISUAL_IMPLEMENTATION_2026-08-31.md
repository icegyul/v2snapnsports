# SNAPN SPORTS V2 Stadium Service Visual Implementation

기준일: 2026-08-31 KST  
브랜치: `codex/stadium-commercial-finish`  
판정: **PARTIAL_EXECUTED — LOCAL VISUAL SURFACE**

이 문서는 기존 `STADIUM_COMMERCIAL_VISUAL_ACCEPTANCE_2026-08-31.md`의 과거 매트릭스를 현재 증거로 재사용하지 않는다. 이번 변경 이후 새로 실행한 화면과 명령만 기록한다.

## 1. 먼저 보는 비주얼 판정

### Stadium Home desktop

![Stadium Home desktop](../../output/stadium-service-visual-2026-08-31/01-home-desktop-1440x900.png)

- 첫 화면을 카드형 대시보드에서 전면형 건축 장면으로 교체했다.
- 제목, 선수 자기 식별, 입장 액션, 한국어 내비게이션만 남겼다.
- 차가운 블루아워 외관, 따뜻한 콘코스, 젖은 플라자, 중앙 진입축이 한 장면으로 읽힌다.
- 캡처 환경에서는 Home WebGL이 `FULL → FAST → LIGHT → STATIC`으로 폴백했다. 따라서 이 이미지는 **STATIC 폴백 실행 증거**이며 SERVICE_HOME WebGL의 현재 렌더 증거가 아니다.

### Stadium Home mobile

![Stadium Home mobile](../../output/stadium-service-visual-2026-08-31/02-home-mobile-390x844.png)

- 데스크톱 이미지를 자른 것이 아니라 모바일 전용 세로 포스터 프레임을 사용했다.
- 제목, 선수 식별, 경기장, 입장 액션, 내비게이션이 첫 뷰포트 안에 들어온다.
- 문서 높이와 뷰포트 높이가 같아 첫 화면 스크롤이 발생하지 않았다.
- 이 캡처도 **STATIC 폴백 실행 증거**다.

### Stadium Builder first frame

![Stadium Builder first frame](../../output/stadium-service-visual-2026-08-31/03-builder-first-frame-1440x900.png)

- 프리뷰와 도구 레일을 하나의 72/28 작업면으로 만들고 페이지 스크롤을 제거했다.
- 중첩 카드, 기술 메타 카드, 정상 상태 validator 카드를 첫 화면에서 제거했다.
- 첫 프레임은 고품질 설계 포스터이며 `3D로 둘러보기`를 눌러야 실제 WebGL 편집 렌더로 전환된다. 포스터를 3D라고 표시하지 않는다.

### Stadium Builder interactive WebGL

![Stadium Builder interactive WebGL](../../output/stadium-service-visual-2026-08-31/04-builder-interactive-webgl-1440x900.png)

- `3D로 둘러보기` 전환은 실행됐다.
- 서비스용 Builder 프로필에 입구, 유리 콘코스, 젖은 플라자, 반복 버트레스, 밝아진 PBR 재질, 근접 항공 카메라를 연결했다.
- 실제 WebGL 편집 장면은 이전 검은 링보다 구조가 읽히지만 포스터 프레임과 같은 상업 비주얼 수준으로 판정하지 않았다.
- 따라서 **Builder first frame은 실행 확인**, **Builder interactive WebGL visual parity는 NEEDS_REVALIDATION**이다.

## 2. 구현 범위

- SERVICE_HOME 데스크톱/모바일 진입 카메라 계약
- SERVICE_HOME / SERVICE_BUILDER 외부 건축 프로필
- 중앙 유리 입구, 내부 슬래브, mullion, 계단, 플라자 seam, bollard, 전면/주변 버트레스
- Home 전용 폭풍 전야 하늘과 데스크톱/모바일 poster fallback
- Home 상태 카드, 데모 badge, identity chip, 사운드 dock 제거
- 내비게이션 `홈 / 훈련 / 팀 / 커리어 / 영상` 정리
- Builder `스타디움 설계`, 7단계 open rail, `복구 / 저장`, dirty-state copy 정리
- Builder first-frame poster와 명시적 3D 전환
- Motion `LazyMotion + react-m`으로 Home 제목, 선수 정보, CTA, 활성 내비게이션의 one-shot presence transition
- Anime.js v4 동적 로딩으로 SERVICE_HOME camera orbit/zoom push, pointer/wheel/keyboard takeover cancel, reduced-motion disable
- 런타임 poster PNG를 JPEG로 최적화하고 고해상도 PNG 원본은 `docs/visual-reference/stadium-service/`에 보존

## 3. Fresh verification

| 항목 | 결과 |
|---|---|
| 전체 Vitest | 50 files / 168 tests PASS |
| TypeScript | PASS |
| Production build + PWA generateSW | PASS |
| ESLint | exit 0, error 0, 기존 warning 2 |
| `git diff --check` | PASS |
| Home desktop browser | STATIC / FALLBACK 실행 확인 |
| Home mobile browser | STATIC / FALLBACK 실행 확인, 첫 화면 무스크롤 |
| Home `경기장 입장` | `/v2/home/full` 주소 이동 실행 확인 |
| Builder first frame | poster 실행 확인 |
| Builder 3D 전환 | READY WebGL 전환 실행 확인 |
| Motion Home UI | initial → settled style browser 실행 확인 |
| Anime.js camera lifecycle | one-shot / pointer cancel / reduced-motion component test PASS |

Vite main chunk 500 kB 경고는 남아 있다. Builder는 lazy chunk로 분리되어 있다.

## 4. Evidence provenance

- `01-home-desktop-1440x900.png` — `12ab214c274bcd38a3740581bba1db7099bcf62cb5c961c64a7aadbbd6ee1ce5`
- `02-home-mobile-390x844.png` — `c43dbbadb6d99a27067cb65a9fc1d3ff67aa7b2eca3b49b74a9f51510e90455b`
- `03-builder-first-frame-1440x900.png` — `b6ca17b4968b3b274891d5f2d6589d471b896858a7c5c07619133b3716d05ffa`
- `04-builder-interactive-webgl-1440x900.png` — `752b8906a08e7d3de140a13204de3ff25b7d38bc252cbbe66906d0599d8fc63e`
- `motion-verification.json` — `19a0de61e3a1d9ed9cca3a2f8c99e45d4e31885180319e912d5334e01ecefab0`

## 5. Non-claims and remaining gates

- Home SERVICE_HOME WebGL은 이번 인앱 브라우저에서 실행되지 않았으므로 실제 canvas 비주얼은 **NOT_EXECUTED**다.
- 같은 이유로 Anime.js camera push의 실제 Home WebGL 시각 결과는 **NOT_EXECUTED**다. 렌더 호출, 사용자 조작 cancel, reduced-motion 경로는 component test로 실행 확인했다.
- Builder interactive WebGL은 실행했지만 poster visual parity는 **NEEDS_REVALIDATION**이다.
- 실제 iOS/Android 기기, Safari/WebKit, Firefox, 인증 계정, 운영 DB, staging, production은 **NOT_EXECUTED**다.
- 기존 dirty integration checkout에는 병합하지 않았다.
- commit, push, merge, deploy를 실행하지 않았다.
- 이 문서는 `PRODUCTION_READY`, 운영 데이터 연결 완료, 배포 완료를 주장하지 않는다.
