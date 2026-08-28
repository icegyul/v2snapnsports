# COMMUNITY UI SPEC

## 1. 목표

V2 Community는 신규 SNS 재설계가 아니라 **V1 observed parity + V2 safety hardening**이다. Feed Intelligence는 OFF이며 Team Communication과 저장/권한/IA를 합치지 않는다.

## 2. 화면 및 route

| 화면 | Canonical route | 핵심 |
|---|---|---|
| Community Home | `/community` | Legacy order feed, type filter, create CTA |
| Post Detail | `/community/post/:post_id` | sanitized body, media, likes, single-level comments |
| Composer | `/community/compose` | local draft, allowed visibility만 |
| Report Flow | action sheet | POST/COMMENT/USER 신고 |
| Block Confirmation | action sheet | block 후 즉시 local projection hide |
| Hidden State | detail/card replacement | UNDER_REVIEW/HIDDEN/REMOVED |
| Empty | same route | zero visible content |
| Offline | same route | cache + stale / local draft |
| Forbidden | same route | generic message, metadata leak 금지 |

요청에 있던 `/community/posts/:postId`, `/community/new`는 v1.7 canonical과 다르므로 route alias/redirect로만 유지한다.

## 3. Component tree

```text
CommunityRoute
└─ CommunityHome
   ├─ CommunityHeader
   ├─ CommunityTypeFilter
   ├─ AsyncStateBoundary
   ├─ CommunityFeed
   │  └─ CommunityPostCard[]
   ├─ LoadMoreSentinel
   └─ PlayerBottomNavigation

CommunityPostRoute
└─ CommunityPostDetail
   ├─ PostHeader
   ├─ SanitizedPostBody
   ├─ PermissionAwareMedia
   ├─ ReactionBar
   ├─ CommunityCommentSection
   └─ SafetyActionSheet
      ├─ CommunityReportFlow
      └─ CommunityBlockConfirmation

CommunityComposeRoute
└─ CommunityComposer
   ├─ ContentTypeControl
   ├─ TextEditor
   ├─ MediaPicker
   ├─ VisibilityPicker
   ├─ DraftStatus
   └─ SubmitBar
```

## 4. State

- LOADING: feed skeleton / detail shell.
- READY: visible data.
- EMPTY: feed 0건 또는 filter 결과 0건.
- ERROR: retryable 여부에 따라 CTA.
- OFFLINE: cached feed read, composer local draft 가능; 서버 mutation은 queued 정책이 확인된 경우만.
- FORBIDDEN: resource 존재 여부를 추가 설명하지 않는다.
- STALE: cache/legacy timestamp와 "마지막 업데이트" 텍스트.
- SAVING: local draft 저장.
- SYNCING: offline journal 재전송.
- READ_ONLY: Legacy write ownership 또는 moderation hold.

## 5. DTO

정본 DTO는 `src-contracts/contracts.ts`의:

- `CommunityPost`
- `CommunityComment`
- `CommunityVisibility`
- `CommunityModerationState`
- `CommunityFeedPage`
- `CommunityPostDetail`

single-level comment이므로 `parentCommentId`는 `null`로 고정한다.

## 6. Adapter

`CommunityAdapter`만 React data layer가 본다. raw legacy payload 직접 접근 금지.

Operation:
- `listFeed` → v1.4 `getCommunityFeed`
- `getPost` → v1.3 canonical `GET /v2/community/posts/{id}`를 physical OpenAPI로 승격
- `createPost` → v1.4 `createCommunityPost`
- `addComment` → v1.4 `addCommunityComment`, parent null
- `toggleReaction` → v1.3 canonical reaction operation 승격
- `report` → v1.3 Community/Safety contract 승격
- `block` → v1.3 Community/Safety contract 승격

새 endpoint를 임의 설계하지 않는다.

## 7. Safety

### sanitize
- raw HTML을 React `dangerouslySetInnerHTML`에 직접 전달 금지.
- sanitizer dependency를 adapter 경계에서 적용.
- text-only legacy field라면 React text node로 렌더.
- external link는 `http:`/`https:` 또는 안전한 relative route만.
- `javascript:`, `data:`, `file:`, `vbscript:`, protocol-relative `//` 차단.
- 새 창 링크는 `rel="noopener noreferrer"`.

### visibility / moderation
순서:
1. E03/A03 authorization
2. E16/A18 visibility/moderation
3. E40/A44 safeguarding
4. render
5. E15/A17 legacy ordering/parity

Feed Intelligence E33/A34는 OFF. A34는 OFF 상태에서 legacy order 반환만 검증한다.

## 8. Permission negative cases

- cross-tenant post: deny
- cross-team TEAM post: deny
- hidden/removed post direct URL: generic hidden/forbidden
- blocked relationship: 서로의 post/action 제거
- unrelated guardian: minor private/community media deny
- revoked guardian: cached data 즉시 invalidation 대상
- unverified manager: role preference만으로 moderate 금지
- forged role escalation: server 403 존중
- foreign athlete media: A21/E17 권한 통과 전 렌더 금지

## 9. Loading/Error/Offline

오프라인 feed cache가 있으면 body를 보여주되 stale 텍스트를 표시한다. cache가 없으면 Empty가 아니라 Offline Empty를 표시한다. report/block/create mutation은 서버 권한 재검증이 필요한 작업이므로 네트워크 복구 전 성공으로 확정하지 않는다.

## 10. Responsive

- small mobile: 1 column, edge padding 12~16px, card media full width.
- standard/large mobile: 1 column, max content 680px.
- tablet: feed 680px centered; composer modal/bottom-sheet 상황에 따라 side panel 가능.
- desktop: feed max 720px, surrounding surface는 비어 있어도 채우기용 가짜 column 금지.
- keyboard open: composer submit bar가 IME 뒤에 숨지 않음.
- long Korean title: 최대 2 line preview, detail은 전체 wrap.
- touch target 최소 44px.

## 11. Accessibility

`main`, `nav`, `article`, `form` landmark를 사용한다. Post card는 `<article>`, 작성자와 작성 시각을 screen reader가 읽을 수 있게 한다. Like 상태는 `aria-pressed`, modal/report sheet는 focus trap/return focus. Hidden state는 색만으로 표시하지 않고 텍스트를 포함한다.

## 12. Tests

- legacy ordering flag OFF
- unsafe URL scheme block
- hidden post route
- blocked author
- single-level comment
- local draft survive remount
- offline cached feed
- forbidden generic copy
- report submit idempotency seam
- unverified manager moderation deny
