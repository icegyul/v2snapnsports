# TEST MATRIX

## 1. Test files

| File | Primary coverage |
|---|---|
| `community-ui.test.tsx` | feed/detail state + single level |
| `community-safety.test.ts` | URL scheme, sanitize boundary, hidden/block |
| `training-ui.test.tsx` | allowed player data only |
| `video-permission.test.tsx` | private minor media deny |
| `career-passport.test.tsx` | provenance + no synthetic score |
| `player-flow.test.tsx` | scene transitions/routes |
| `responsive-smoke.test.tsx` | viewport classes + long text shell |
| `accessibility-smoke.test.tsx` | 44px/aria/nav/focus semantics |
| `static-parity.test.tsx` | STATIC required projection |
| `feature-visibility.test.tsx` | EPTS/CAMERA_AI/SPORTS_AI hidden |

## 2. Mandatory scenario matrix

### Community
- happy feed
- empty filter
- offline cached
- error no cache
- forbidden direct URL
- blocked relationship
- hidden moderation
- unsafe URL
- single-level comment
- legacy order while flag OFF

### Training
- upcoming session
- no session
- offline cached
- stale Earthus badge
- Earthus unavailable but core ready
- cross-team detail deny
- participation saving/error
- forbidden metric text absent

### Video
- own private video
- guardian own child allowed projection
- unrelated guardian deny
- team video with scope
- foreign minor private deny
- playback unavailable
- representative selection permission

### Career
- current season
- season transfer
- position change
- representative video
- source removed
- missing provenance fails validation
- share visibility restriction
- no ability/pro potential score

### Player E2E
- full stage sequence
- skip → spatial home
- direct route
- refresh state rehydrate
- invalid route safe home
- FULL failure downgrade
- LOW tier LIGHT
- no WebGL STATIC
- bottom tabs preserved

## 3. Test philosophy

이 pack의 test 파일은 **contract acceptance skeleton**이다. F0 실제 컴포넌트 경로는 저장소 audit 전 임의로 추정할 수 없기 때문에 각 test 안의 `Reference*` harness는 Codex가 현재 implementation import로 교체한다. assertion은 삭제하지 않고 실제 컴포넌트에 연결한다.

Codex는 다음 순서로 이관한다.

1. test가 의도한 DTO/state를 유지.
2. `Reference*`를 실제 page/component import로 교체.
3. fixture adapter를 기존 F0 fixture provider로 연결.
4. negative assertion을 유지.
5. screenshot/e2e와 병행.
