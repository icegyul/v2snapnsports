# SNAPN SPORTS V2 — 3D STADIUM CURRENT STATUS

기준일: 2026-08-30
Repository: `icegyul/v2snapnsports`
Branch: `feature/v2-stadium-first-screen-complete`

## 1. 현재 결론

현재 Stadium 작업은 초기 프로토타입 단계가 아니다.

실제 Three.js Stadium, exterior approach, pitch entry, player position, team formation, Spatial Home, live scoreboard, Digital Projection, Full Entry, Stadium Builder까지 구현되어 있다.

다만 **최신 Builder visual runtime 확장 이후 모든 acceptance를 동일 HEAD에서 다시 닫기 전에는 최종 완료를 선언하지 않는다.**

## 2. 구현 상태

| 영역 | 현재 상태 |
|---|---|
| Stadium real 3D geometry/PBR | 구현 |
| Exterior facade | 구현 |
| Real approach camera | 구현 + 과거 browser PASS |
| Pitch entry camera | 구현 + 과거 browser PASS |
| My Player 3D position | 구현 + 과거 browser PASS |
| Team formation 3D | 구현 |
| Spatial Home | 구현 + 과거 browser PASS |
| Live 3D scoreboard texture | 구현 + 과거 browser PASS |
| Digital Projection | 구현 + browser PASS 이력 |
| Full Entry single-canvas continuity | 구현 + browser PASS 이력 |
| Default `/home` → `/home/full` | 구현 |
| Stadium Audio | 구현, Full Entry-aware verifier 수정 이력 |
| Builder engine | 구현 |
| Builder 10 families / 20 presets | 구현 |
| Builder validator | 구현 |
| Builder save/restore/revision conflict | 구현 |
| Builder live 3D preview | 구현 |
| Rapid preset switching debounce | 구현 + Builder Browser PASS 이력 |
| Builder visual profiles → Three.js | 최신 구현 |
| Latest HEAD full acceptance | **재실행 필요** |

## 3. 최근 검증 기준점

Builder Browser acceptance가 debounce 적용 후 성공한 검증 시점에서:

- typecheck PASS
- lint PASS
- tests `146/146 PASS`
- production build PASS
- desktop Builder browser PASS
- mobile Builder browser PASS
- 10 family / 20 preset semantic traversal
- Validator invalid → valid flow
- save revision / reload restore

이후 추가 변경:

1. Builder visual profile을 Three.js runtime에 실제 연결
2. seat pattern visual mapping
3. environment fog/intensity mapping
4. lighting exposure mapping
5. facade material mapping
6. environment / lighting semantic condition correction

따라서 위 PASS 숫자를 최신 HEAD의 최종 판정으로 재사용하지 않는다.

## 4. 최신 기능 baseline

Builder visual mapping 직전 functional baseline 중 중요한 SHA:

- `121f4a8c01f438524869998662c6c351deeecd9f`
  - Builder environment intensity와 lighting profile 의미 정합성 수정

이 패키지에는 documentation / packaging commits가 추가되므로 **정확한 패키지 SHA는 `SOURCE_HEAD.txt`가 최종 source-of-truth**다.

## 5. 현재 P0

최신 패키지 HEAD에서 아래를 다시 실행한다.

```bash
npm ci
npm run typecheck
npm run lint
npm test -- --reporter=dot
npm run build
```

그 다음:

- Stadium Visual Verify
- Full Entry Browser Verify
- Digital Projection Browser Verify
- Stadium Audio Browser Verify
- Default Entry Browser Verify
- Stadium Builder Browser Verify

## 6. P1

Builder visual runtime의 실제 차이를 evidence로 닫는다.

대표 비교:

- URBAN / DAY
- NIGHT_EVENT / EVENT
- PARK 또는 COASTAL

확인:

- actual frame difference
- seat MONO/DUO/GRADIENT difference
- facade profile difference
- exposure difference
- fog/background difference
- context loss 0
- console error 0

## 7. P2

Builder의 개별 편집 UX를 안전한 범위에서 확장한다.

- Bowl
- Roof
- Stand
- Seat
- Facade
- Lighting
- Environment

모든 변경은 semantic validator와 geometry budget guard를 통과해야 한다.

## 8. 데이터 원칙

현재 demo fixture의 연결된 teammate만 사용한다.

- Player #8
- anonymous teammate #4
- anonymous teammate #7
- anonymous teammate #11

없는 선수를 만들어 11명을 채우지 않는다.

## 9. 인수인계 판정

- SAFE TO CONTINUE LOCAL DEVELOPMENT: YES
- RESTART / REPLAN NEEDED: NO
- STADIUM FOUNDATION PRESENT: YES
- FULL ENTRY FOUNDATION PRESENT: YES
- BUILDER FOUNDATION PRESENT: YES
- LATEST HEAD FINAL ACCEPTANCE CLOSED: NO
- SAFE TO DECLARE 3G FINAL COMPLETE: NO, latest matrix first

## 10. 다음 개발자에게

`SNAPN_STADIUM_V2_CONTINUATION_DIRECTIVE_KO.md`를 먼저 읽고 현재 branch를 그대로 이어받는다.
