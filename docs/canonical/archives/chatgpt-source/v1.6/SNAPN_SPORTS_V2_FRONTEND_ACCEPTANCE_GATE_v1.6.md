# SNAPN SPORTS V2 FRONTEND ACCEPTANCE GATE v1.6

Frontend is NOT COMPLETE until all release blockers below are evidenced.

## F0 Audit Gate
- Current frontend framework, router, state/query libraries, 3D runtime, build, test stack and existing routes inventoried.
- No framework migration before approved Gap Analysis.

## F1 Shell / Identity Gate
- Public signup renders PLAYER and MANAGER only.
- Guardian route works only through invite flow.
- Role preference cannot unlock privileged workspace.
- All privileged manager routes use verified RoleGrant projection.

## F2 Community Gate
- Existing feed ordering, pagination, post/comment/reaction/media, visibility, report/block behavior pass parity fixtures.
- Community stays in the player bottom nav; not hidden under More.

## F3 My Football World Gate
- Normal entry FAST target 0.8-1.5s; My Position + Next Event intelligible within 3 seconds in target test set.
- FULL/LIGHT/STATIC all preserve the same business data and routes.
- Formation uses server snapshot; 2D and 3D positions match.
- Asset failure never blocks Home/Training/Community/Video/More.

## F4 Activity / Offline Gate
- Coach Session and Referee Match Center operate during network loss and recover through sync/batch.
- Conflicts preserve local draft/event evidence; no silent data overwrite.

## F5 Safety / Future Gate
- EPTS / Camera AI / Sports AI components/routes/placeholder metrics are absent for normal users.
- Minor direct-contact blocks and consent failures project safe UX without leaking restricted subject metadata.

## F6 Accessibility / Responsive Gate
- Touch targets, dynamic type, screen-reader labels, focus order, reduce motion and static fallback verified.
- Phone, tablet and desktop/admin target layouts pass golden visual tests.

## F7 Contract / Error Gate
- Every OpenAPI operation used by frontend has a binding owner.
- Every backend v1.5 error code has an explicit UI projection or safe fallback.

## F8 Performance Gate
- App shell usable p75 <= 2.5s.
- 3D first frame p75 <= 4.0s on target tier with progressive loading.
- Panel open/background throttling and asset budgets verified.
