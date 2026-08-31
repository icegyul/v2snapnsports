# Claude Code 인수인계 문서

## 1. 현재 결론

현재 source는 Stadium/Builder 기반과 상업용 poster/UI 개선을 포함하지만, 사용자가 요구한 기본 기능 경험은 미완료다.

```text
SAFE TO CONTINUE LOCAL DEVELOPMENT: YES
SAFE TO RESTART FROM CLEAN HEAD: NO
SAFE TO DECLARE SERVICE READY: NO
SAFE TO DECLARE PRODUCTION READY: NO
COMMIT / PUSH / MERGE / DEPLOY: NOT EXECUTED
```

## 2. Source 경계

### Stadium 개발본

```text
원본 작업 경로: /private/tmp/snapn-stadium-service-visual
branch: codex/stadium-commercial-finish
HEAD: 92f7d5211b2c44b17fb9ed71924c859a4f58fc33
remote: git@github.com:icegyul/v2snapnsports.git
상태: dirty, modified + untracked 포함
```

Claude Code의 Stadium 후속 개발 기준은 `ARCHIVES/STADIUM_CLAUDE_READY_REPO_FULL.tar.gz`다.

### 기존 통합 checkout

```text
원본 경로: /Volumes/700gb/## APP/Sanpnsports v2_app
branch: integration/v2-pack01-04-acceptance
HEAD: fc0753d282c43eac09760f9006ca05b5a7ee6b77
상태: 별도 dirty user work 포함
```

통합 checkout은 `ARCHIVES/INTEGRATION_DIRTY_CHECKOUT_FULL.tar.gz`에 별도 보존한다. 두 tree를 자동 overlay하거나 merge하지 않는다.

## 3. 이번 작업에서 추가·변경된 Stadium 범위

- Stadium Home full-viewport commercial composition
- desktop/mobile 별도 poster fallback
- storm-blue sky asset
- 한국어 Home navigation
- Home Motion presence transition
- Anime.js SERVICE_HOME camera lifecycle
- SERVICE_HOME / SERVICE_BUILDER camera·architecture profile
- central glass entrance, concourse mullion, stair, plaza, bollard, buttress
- Builder 72/28 workspace와 open tool rail
- Builder first-frame poster와 명시적 `3D로 둘러보기` 전환
- Builder visual recipe mapping과 tests
- visual reference, implementation plan, execution evidence

## 4. 마지막 fresh 검증

코드 변경 후 마지막 실행 기록:

```text
Vitest: 50 files / 168 tests PASS
TypeScript: PASS
Production Vite build: PASS
PWA generateSW: PASS
ESLint: exit 0, error 0, existing warning 2
git diff --check: PASS
```

이 기록 이후 제품 코드는 변경하지 않았고, 이관 문서만 추가됐다. Claude Code는 새 환경에서 다시 실행해야 한다.

## 5. 현재 브라우저 재현 결함

### `/v2/home`

```text
renderMode=STATIC
renderState=FALLBACK
poster transform=none
zoom interaction=불가
```

### `/v2/home/full`

```text
renderMode=STATIC
renderState=FALLBACK
stage=SPATIAL_HOME
progress=1.000
formation teammate count=3
전술 필드 marker=표시되지 않음
```

따라서 P0는 Home zoom과 immediate tactical field다.

## 6. 주요 코드 지도

### App / route

```text
apps/web/src/app/AppShell.tsx
apps/web/src/features/stadium/PlayerStadiumPages.tsx
apps/web/src/routes/routePolicy.ts
```

### Home / entry / formation

```text
apps/web/src/features/stadium/Stadium3DScene.tsx
apps/web/src/features/stadium/FullStadiumJourneyScene.tsx
apps/web/src/features/stadium/PlayerPosition3DScene.tsx
apps/web/src/features/stadium/TeamFormation3DScene.tsx
apps/web/src/features/stadium/fullStadiumJourney.css
apps/web/src/features/stadium/teamFormation3D.css
apps/web/src/features/stadium/stadiumServiceVisual.css
```

### Three.js

```text
apps/web/src/three/stadiumWebglV14.ts
apps/web/src/three/stadiumWebglV151.ts
apps/web/src/three/stadiumWebgl.ts
apps/web/src/three/stadiumScene.ts
apps/web/src/three/stadiumServiceArchitecture.ts
apps/web/src/three/stadiumServicePresentation.ts
apps/web/src/three/stadiumVisualProfile.ts
```

### Data

```text
apps/web/src/adapters/fixtureCoreProductAdapter.ts
apps/web/src/api/coreProductContracts.ts
```

### Builder

```text
apps/web/src/features/stadium-builder/StadiumBuilderPage.tsx
apps/web/src/features/stadium-builder/StadiumBuilderPreview.tsx
apps/web/src/features/stadium-builder/StadiumBuilderControls.tsx
apps/web/src/features/stadium-builder/stadiumBuilderModel.ts
apps/web/src/features/stadium-builder/stadiumBuilderMotion.ts
apps/web/src/features/stadium-builder/stadiumBuilderService.css
```

## 7. 데이터·개인정보 상태

현재 Stadium product data는 `SYNTHETIC_FIXTURE`다.

```text
player: #8 중앙 미드필더
team formation: 4-3-3
teammates:
  #4 DF
  #7 MF
  #11 FW
```

`publicName`과 `avatarUrl`은 null이다. 그대로 유지한다.

## 8. Archive 복구

### Stadium 개발 계속

```bash
tar -xzf ARCHIVES/STADIUM_CLAUDE_READY_REPO_FULL.tar.gz
cd snapn-stadium-claude-ready
git status --short
npm run typecheck
npm test -- --run
npm run build
```

이 archive에는 `.git`, `node_modules`, `dist`, `output`, modified/untracked 파일이 포함된다.

### Git bundle 사용

```bash
git clone GIT/SNAPN_SPORTS_ALL_REFS.bundle snapn-sports-git-history
cd snapn-sports-git-history
git branch -a
```

Git bundle은 committed history를 보존한다. 현재 uncommitted Stadium 변경은 Stadium full archive가 source-of-truth다.

### 통합 checkout 감사

```bash
tar -xzf ARCHIVES/INTEGRATION_DIRTY_CHECKOUT_FULL.tar.gz
cat STATE/INTEGRATION_GIT_STATUS.txt
```

두 snapshot의 파일을 자동으로 덮어쓰지 않는다. 먼저 diff와 ownership을 확인한다.

## 9. 남은 gate

- Home STATIC zoom: NOT IMPLEMENTED
- immediate tactical field: NOT IMPLEMENTED
- own/teammate marker default entry: NOT IMPLEMENTED
- Home real WebGL visual verification: NOT EXECUTED in current in-app browser
- Builder interactive WebGL poster parity: NEEDS_REVALIDATION
- authenticated account: NOT EXECUTED
- real API/DB: NOT CONNECTED
- staging/production: NOT EXECUTED
- physical iOS/Android: NOT EXECUTED

## 10. 다음 Claude Code의 첫 작업

`HANDOFF/CLAUDE_CODE_DEVELOPMENT_DIRECTIVE_KO.md`의 P0-A와 P0-B를 TDD로 구현하고, 실제 브라우저에서 Home zoom과 tactical field를 실행 검증한다.
