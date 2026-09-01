# Stadium 게임형 프레젠테이션 인수 기록 — 2026-09-01

기준 HEAD: `6aa5a4e` (branch `codex/stadium-commercial-finish`)
검증 환경: Windows 11 / Chromium(Playwright, `--use-angle=d3d11` 실GPU) / 프로덕션 빌드(`vite preview`, 127.0.0.1:4173)

계속지시서(§16) 요구에 따라 렌더러 변경 HEAD에서 전체 인수 매트릭스를 재실행하고 그 결과를 기록한다.
상태 구분은 지시서 §11 규율을 따른다: CODE_EXISTS ≠ TEST_PASS_EXECUTED ≠ BROWSER_PASS_EXECUTED.

## 1. 이번 사이클에서 추가된 범위

| 항목 | 내용 | 상태 |
|---|---|---|
| 홈 내부 카메라 | `/home` 기본 뷰를 FIFA식 관중석 내부 시점으로 전환. 드래그=보울 궤도, 상하=티어 승강, 줌=피치 돌리. `resolveInteriorCamera`가 보울 지오메트리 안전 범위를 보장 | BROWSER_PASS_EXECUTED |
| 경기장 프리셋 8종 + 등급 | `stadiumSelection.ts` — FREE/PREMIUM 티어 메타데이터(향후 아이템 마켓 대비, 현재 전량 무료 표기) | TEST_PASS_EXECUTED + BROWSER_PASS_EXECUTED |
| DIY 적용 (지시서 P3) | Builder "이 경기장 사용" → 검증·저장 후 커스텀 recipe로 홈 적용, 선택 화면에 "나의 DIY 경기장" 노출 | BROWSER_PASS_EXECUTED |
| FC식 전술 카드 | `/home/full` 전술 필드: 원근 필드 + 스탠딩 카드(레이팅·포지션 컬러) + 선수 상세 스탯 패널. P0-B/C 마커·접근성 계약 전부 유지 | TEST_PASS_EXECUTED + BROWSER_PASS_EXECUTED |
| 데모 능력치 | `teamTacticsCards.ts` — 등번호+포지션 결정론 생성, 화면에 "데모 능력치 · 실데이터 연동 전" 명시(§11 합성데이터 규율 준수) | CODE_EXISTS + TEST_PASS_EXECUTED |
| present() 버그 수정 | FAST/LIGHT 모드 무한 재귀 → `renderer.render` 폴백 | CODE_EXISTS (FULL 경로는 브라우저 검증됨) |

## 2. 전체 매트릭스 재실행 결과 (이 HEAD 기준)

| 검증 도구 | 결과 |
|---|---|
| `tools/capture_default_full_entry.mjs` (P0 zoom·전술 즉시 진입·시네마틱·Spatial Home) | PASS (exit 0) |
| `tools/capture_full_stadium_journey.mjs` | PASS (exit 0) |
| `tools/capture_stadium_audio.mjs` | PASS (exit 0) |
| `tools/capture_digital_projection_3d.mjs` | PASS (exit 0) |
| `tools/capture_stadium_builder.mjs` (데스크톱+모바일) | PASS (exit 0) |
| `tools/capture_stadium_select.mjs` | PASS 10/10 |
| `tools/capture_stadium_interior.mjs` (데스크톱 기본/코스탈·모바일 나이트) | PASS 9/9 |
| `tools/capture_tactics_diy.mjs` (전술 카드 데스크톱+모바일, DIY 왕복) | PASS 15/15 |
| 단위 테스트 | 232/232 |
| typecheck / lint / production build | PASS / 0 error / PASS |

증거 스크린샷: `output/stadium-interior-evidence/`, `output/stadium-select-evidence/`, `output/stadium-tactics-diy-evidence/`.

## 3. 알려진 한계 (서비스 판단용)

- 능력치·팀·일정은 전부 SYNTHETIC_FIXTURE 데모 데이터이며 화면에 명시된다. 실계정/실API 연동은 지시서상 별도 게이트(§9 잔여 게이트)로 남아 있다.
- 전술 카드가 원근상 겹칠 때 가까운 카드가 앞에 온다(게임과 동일). 가려진 카드는 보이는 상단부를 탭해 선택한다.
- `snapnsports.com/v2/` 공개 접속은 Cafe24 리버스 프록시 예외 처리 대기(문의 접수됨). 업로드 파이프라인 자체는 정상.
- GitHub Pages 프리뷰는 저장소 Settings→Pages 1회 활성화 대기.
- 마켓 결제/소유권은 범위 외 — 티어 메타데이터와 UI 표기만 준비됨.

## 4. 추가 사이클 — 포메이션 선택 (HEAD f9e88ab)

| 항목 | 내용 | 상태 |
|---|---|---|
| 포메이션 4종 | 4-3-3 / 4-4-2 / 3-5-2 / 4-2-3-1 — `teamFormationShapes.ts`의 11슬롯 모델 | TEST_PASS_EXECUTED |
| 정직한 배치 | 실제 연결된 인원만 자기 포지션에 가장 가까운 슬롯을 차지하고, 나머지는 점선 "빈 자리"로 표시. 가상의 선수는 생성하지 않음 | TEST_PASS_EXECUTED + BROWSER_PASS_EXECUTED |
| 선택 유지 | localStorage `snapn:v2:tactics-formation` | BROWSER_PASS_EXECUTED |
| P0-B/C 계약 유지 | 실제 마커 4개, 내 카드 기본 선택, 연결선·스탯 패널 동작 | TEST_PASS_EXECUTED |
| 사운드 독 제거 | 정우님 지시로 전 화면에서 삭제, 앱 완전 무음 | BROWSER_PASS_EXECUTED |

브라우저에서 잡은 실제 레이아웃 결함 2건(기울어진 필드의 카드가 칩을 덮음 / 모바일에서 칩이 시네마틱 버튼과 충돌하고 화면 밖에 위치)은 푸터 바 배치와 모바일 순서 조정으로 수정했다.

재실행 결과: 단위 232→251, tactics+DIY 15→21/21, interior 9/9, select 10/10, default entry·journey·builder·projection 전부 PASS.

주의(도구 환경): Windows 경로의 `#` 때문에 `npm run build`는 스테이징 폴더에 산출물을 쓴다. 로컬 프리뷰 검증 시 `vite preview --outDir <staging>/dist --host 127.0.0.1`로 띄워야 최신 번들을 본다. 저장소의 `dist/`만 보고 검증하면 옛 번들을 검증하게 된다.

## 5. 추가 사이클 — 살아있는 관중 (HEAD 3d5f056)

| 항목 | 내용 | 상태 |
|---|---|---|
| 관중 모션 | 보울을 도는 파도 응원 + 상시 미세 흔들림. 관중 인스턴스의 버텍스 셰이더로 처리 | BROWSER_PASS_EXECUTED |
| 성능 설계 | CPU로 하면 프레임마다 약 4만 개 인스턴스 행렬을 다시 써야 한다. 셰이더 처리로 한 프레임 비용은 uniform 1회 갱신 + 기존 드로우 | CODE_EXISTS |
| 프레임 정책 | 30fps 상한, 탭이 숨겨지면 정지, `prefers-reduced-motion`이면 루프 자체를 시작하지 않음 | TEST_PASS_EXECUTED + BROWSER_PASS_EXECUTED |

측정 증거(`tools/capture_crowd_motion.mjs`, 11/11): 같은 카메라에서 700ms 간격 두 프레임을 비교해 관중석 픽셀 변화율 — 홈 2.52%, 전술 화면 뒤 1.23%, 저감 모션 0.000%. 동시에 페이지는 60~61 rAF/s를 유지해 다른 애니메이션을 굶기지 않음을 확인했다.

단위 251→258. 전체 매트릭스(기본 진입·전술+DIY 21/21·내부뷰 9/9·선택 10/10·빌더·저니·프로젝션) 이 HEAD에서 재실행 PASS.
