# PLAYER END-TO-END FLOW

## 1. Canonical E2E

```text
Login
  ↓
/home [EXTERIOR]
  ↓
/home/approach [APPROACH]
  ↓
/home/enter [PITCH_ENTRY]
  ↓
/home/position [MY_POSITION]
  ↓
/home/formation [TEAM_REVEAL]
  ↓
/home/team [SPATIAL_HOME]
  ↓
HOME / TRAINING / COMMUNITY / VIDEO / MORE
```

Career:
`My Player Card → /player/me/career`

## 2. Scene state와 route state 분리

- business data: query/cache + adapter
- scene state: ephemeral `StadiumExperienceState`
- router: deep link와 history
- renderer: FULL/FAST/LIGHT/STATIC
- 3D 실패는 renderer state만 downgrade
- `PlayerHomeProjection`은 renderer와 무관하게 유지

## 3. Direct URL contract

각 scene route를 직접 열었을 때:
1. session restore
2. `getStadiumHome`
3. permission/feature evaluation
4. 필요한 이전 animation은 생략 가능
5. 해당 stage 또는 더 안전한 STATIC stage로 진입

direct URL이 이전 cinematic을 반드시 재생해야 하는 것은 아니다.

## 4. refresh

refresh 후 scene runtime은 재생성되지만:
- active route
- player/team/formation/next event
- bottom nav
- user visual-mode preference

는 복구된다.

## 5. back/forward

브라우저/웹뷰 history가 각 child route를 추적할 경우 back/forward는 stage를 이동한다. 구현이 `/home` 단일 route + scene internal state로 이미 F0에 고정돼 있다면 F0를 깨지 말고 scene route를 alias/deep-link intent로 ADAPT한다.

## 6. invalid route

unknown player route → 마지막 safe tab 또는 `/home`. 숨겨진 resource route는 `/home`으로 무조건 redirect하기 전에 FORBIDDEN/NOT_FOUND policy를 적용해 정보 leak을 방지한다.

## 7. forbidden route

`TENANT_SCOPE_DENIED`, `TEAM_SCOPE_DENIED`, `SUBJECT_SCOPE_DENIED`, `MEDIA_ACCESS_DENIED` 등은 generic forbidden. 요청한 대상의 실제 이름, 팀, 소유자 정보 표시 금지.

## 8. offline

- cached `PlayerHomeProjection`이 있으면 HOME/STATIC 유지
- cache 없으면 navigation shell + offline empty
- Community/Training cached read 허용
- mutation은 local journal 정책이 정의된 것만 queue
- signed media source는 만료 검증

## 9. stale

stale은 앱 장애가 아니다. 마지막 업데이트 텍스트와 source freshness를 표시한다. Earthus stale은 Training core stale과 분리한다.

## 10. performance fallback

우선순위:
`FULL → FAST → LIGHT → STATIC`

A07/A14/A35 기준:
- WebGL 없음/repeated 3D crash/reduced-motion static preference → STATIC
- LOW/thermal/low power → LIGHT
- FULL core asset 미준비 → FAST/LIGHT, 로드 대기 때문에 navigation block 금지
- renderer context lost → 한 단계 즉시 downgrade
- repeated failure → STATIC

## 11. STATIC parity

필수:
- Player identity
- Team
- Formation
- Next training
- Next match
- Bottom navigation
- Core actions
- My Player/Card → Career Passport

## 12. canonical E2E acceptance

- login restore
- direct `/home/team`
- refresh `/home/position`
- back/forward
- invalid route
- forbidden direct route
- offline cache yes/no
- stale home
- renderer failure FULL→FAST
- low performance LIGHT
- STATIC parity
- hard-disabled features not present
