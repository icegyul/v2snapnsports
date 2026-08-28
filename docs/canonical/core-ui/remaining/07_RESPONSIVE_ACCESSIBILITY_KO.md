# RESPONSIVE / ACCESSIBILITY SPEC

## 1. Breakpoint philosophy

breakpoint는 특정 iPhone/Android 모델명이 아니라 **content pressure** 기준이다.

| Class | CSS width | 기본 |
|---|---:|---|
| SMALL_MOBILE | `<360` | 1 column, 12px edge padding |
| STANDARD_MOBILE | `360–419` | 1 column, 16px edge |
| LARGE_MOBILE | `420–599` | 1 column, 16–20px edge |
| TABLET | `600–1023` | centered content, selective 2-pane |
| DESKTOP | `>=1024` | max-width shell, keyboard-first |

`classifyViewport()` 계약이 `contracts.ts`에 있다.

## 2. content max width

- app shell desktop max: 1180px
- text/feed: 720px
- form/composer: 680px
- Career timeline: 760px
- modal: 560px 기본
- stadium scene: full available area, nav readability 우선

max-width는 디자인 토큰으로 옮겨도 된다. 숫자 변경은 UI density 변경이며 엔진 변경이 아니다.

## 3. Bottom navigation

- Player: HOME / TRAINING / COMMUNITY / VIDEO / MORE 고정.
- mobile/tablet 기본 fixed bottom.
- desktop은 동일 information architecture를 side/bottom navigation으로 표현 가능하나 tab 순서와 label을 바꾸지 않는다.
- 배경 투명도를 과하게 사용해 pitch/crowd가 글자 가독성을 해치지 않음.
- safe area bottom 포함.
- active는 green만이 아니라 indicator shape + text style.

## 4. Safe area

`padding-bottom: max(componentPadding, env(safe-area-inset-bottom))`

top notch/dynamic island 영역과 bottom home indicator를 피한다. modal/sheet action도 safe area를 포함한다.

## 5. Landscape

mobile landscape:
- 높이 500px 미만이면 compact header.
- bottom nav 유지.
- 3D scene에서 header/scoreboard가 pitch 핵심 정보를 가리지 않음.
- bottom sheet 최대 80dvh, 내부 scroll.
- keyboard open 시 composer는 full-height sheet로 전환 가능.

## 6. Keyboard / IME

- submit action이 iOS/Android Korean IME 뒤에 숨지 않음.
- textarea Enter는 newline; platform convention을 따르고 임의 submit 금지.
- focus된 field를 viewport로 scroll.
- modal close 후 opener에 focus restore.
- desktop은 Tab/Shift+Tab, Enter/Space 활성화.

## 7. Scroll restoration

- bottom tab 별 scroll position 기억.
- post detail에서 Back → feed card 위치 복원.
- filter 변경은 새로운 list state로 top reset.
- pagination append 중 route 이동/복귀 시 cursor+items 유지 가능.
- Career season detail Back → 선택 season card 복원.

## 8. Long Korean text

- detail 본문: hard truncation 금지, word-break/overflow-wrap 지원.
- feed title: 최대 2 lines.
- preview: 최대 3 lines.
- venue/team name: 필요 시 2 lines.
- critical time/participation/status: ellipsis로 의미 소실 금지.
- button label은 Dynamic Type에서 wrap 또는 control height 증가.

## 9. Modal / Bottom sheet

mobile은 bottom sheet 우선, desktop은 centered modal 가능. destructive action은 confirmation 필요. report/block sheet는 focus trap, escape close(웹), background inert.

## 10. Touch layout

- minimum touch target 44×44px.
- 현장(field mode) 주요 action 52px 권장.
- icon-only button도 hit box 44px.
- 인접 destructive/primary action 간 충분한 spacing.
- swipe-only action 금지; visible alternative 제공.

## 11. Semantic landmarks

- `<header>`
- `<nav aria-label="선수 주 메뉴">`
- `<main>`
- Community post `<article>`
- form은 `<form>`
- Career season은 section + heading

## 12. Heading hierarchy

page `<h1>` 1개. major section `<h2>`, card 내부 필요한 경우 `<h3>`. 시각 크기 때문에 heading level을 건너뛰지 않는다.

## 13. ARIA / naming

- icon-only button `aria-label`
- toggle/reaction `aria-pressed`
- current nav `aria-current="page"`
- loading은 필요 시 `aria-busy`
- stale/offline 상태는 live region 남발 없이 상태 영역에 텍스트
- video controls는 명시 naming
- hidden/moderation state는 읽을 수 있는 상태명

## 14. Focus

- visible focus outline.
- Graphite surface에서 focus가 border와 구별.
- route 전환 시 page heading/main으로 focus 이동 정책.
- modal open 시 첫 의미있는 control.
- modal close 시 trigger 복귀.

## 15. Reduced motion

`prefers-reduced-motion: reduce` 또는 앱 설정:
- stadium cinematic 자동 생략/STATIC 또는 최소 motion.
- parallax/zoom easing 제거.
- 기능 상태 변화는 instant/fade 수준.
- 중요한 정보가 animation completion에 의존하지 않음.

## 16. High contrast

표준 Graphite와 high contrast Graphite를 구분한다. high contrast에서:
- surface luminance step 증가
- border 강화
- secondary text 밝기 증가
- selected 상태 non-color cue 유지
- 정보 제거 금지

## 17. Dynamic Type

200% 수준 확대에서도 핵심 action이 사라지지 않는 방향. 고정 height card를 피하고 min-height 사용. text가 겹치면 2-column을 1-column으로 collapse.

## 18. VoiceOver / TalkBack

- 화면 진입 시 page title과 핵심 상태가 자연스럽게 읽힘.
- formation의 선수 marker는 시각 좌표뿐 아니라 "등번호, 포지션, 내 선수 여부"를 accessible name으로 제공.
- 다른 미성년자 이름이 permission상 숨김이면 accessibility tree에서도 노출 금지.
- 3D canvas만으로 navigation하지 않고 동등한 DOM action list 제공.

## 19. Low-brightness LCD QA

20% brightness, grayscale, high contrast profile에서:
- Surface1/Surface2/Elevated 경계
- bottom nav
- modal edge
- selected player/card
- error/forbidden state

를 수동 screenshot validation 한다.
