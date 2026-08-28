# SnapN Sports V2 Final Core UI Product Slice Implementation Plan

> **For agentic workers:** Execute inline, one task at a time, with a failing test before every behavioral change.

**Goal:** Apply the 11-file final Core UI contract to the existing V2 foundation as a fixture-only, locally runnable Core Product without production API, DB, deployment, V1, or user-data access.

**Architecture:** Preserve the React/Vite foundation and add typed, V2-owned Core Product contracts, fixture data, state boundaries, scene scaffolds, and route screens. `docs/canonical/core-ui/` is implementation input only; the runtime imports only `apps/web/src/**` and `update/` remains intake-only.

**Tech Stack:** React 18, TypeScript strict, React Router, Vitest, Testing Library, Vite PWA, CSS custom properties.

**Spec:** `docs/canonical/core-ui/README.md`, `SNAPN_SPORTS_V2_CORE_UI_IMPLEMENTATION_MASTER_KO.md`, `contracts.ts`, `routes.ts`, `state-machine.ts`, `component-contracts.ts`, `TEST_MATRIX_KO.md`, and `CORE_UI_ACCEPTANCE_CHECKLIST_KO.md`.

## Global Constraints

- Modify only `/Volumes/740GB/## APP/Sanpnsports v2_app`; V1 is read-only and is not built, installed, tested, or formatted.
- No production DB/API calls, secrets, actual user data, migration, deployment, or feature-flag activation.
- EPTS, CAMERA_AI, SPORTS_AI, AI scores, fabricated performance data, and Feed Intelligence remain absent from user-visible UI.
- Community uses fixture-local state only; there is no Legacy ownership transfer, API call, or production cutover.
- PUBLIC signup exposes only PLAYER and MANAGER; Guardian remains invite-only; RolePreference is never an authorization grant.
- Visual modes remain FULL → FAST → LIGHT → STATIC; the runtime uses a labeled development scene scaffold and static parity, never a fabricated completed stadium.
- Keep Korean UI copy, Graphite tokens, a 44px minimum target, and an accessible 320px layout.

---

### Task 1: Preserve canonical provenance and classify the F0 baseline

**Files:**
- Modify: `docs/canonical/CANONICAL_SOURCE_INDEX.md`
- Create: `docs/implementation/CORE_UI_F0_DELTA.md`
- Test: command-level byte comparison of all 11 source files

- [ ] Verify every requested `update/.../CORE_UI_IMPLEMENTATION_PACK_KO_FINAL` file equals `docs/canonical/core-ui/<file>` with `cmp -s`.
- [ ] Add one index row with status `ACTIVE_IMPLEMENTATION_CONTRACT`, source intake root, destination, and superseded note.
- [ ] Classify every existing foundation module as `KEEP`, `ADAPT`, `REPLACE`, or `MISSING`, including the accepted no-production boundary.

### Task 2: Add V2-owned Core Product contracts and fixture adapter

**Files:**
- Create: `apps/web/src/api/coreProductContracts.ts`
- Create: `apps/web/src/adapters/fixtureCoreProductAdapter.ts`
- Modify: `apps/web/src/lib/authorization.ts`
- Test: `apps/web/src/tests/coreProductAdapter.test.ts`, `apps/web/src/tests/corePermission.test.ts`

- [ ] Write tests for a fixture stadium home, privacy-safe formation, maximum five spatial anchors, media provenance, community audience filtering, and denied cross-team/cross-tenant/minor actions.
- [ ] Run the tests and observe missing-module failures.
- [ ] Implement immutable Core Product DTOs and fixture adapter methods without `fetch`, URLs, production configuration, or real values.
- [ ] Extend authorization to deny scope escalation while retaining existing guardian behavior.
- [ ] Run the targeted tests to green.

### Task 3: Build state and scene boundaries with STATIC parity

**Files:**
- Create: `apps/web/src/components/CoreStateBoundary.tsx`
- Create: `apps/web/src/three/stadiumScene.ts`
- Modify: `apps/web/src/features/core/coreUiState.ts`
- Test: `apps/web/src/tests/coreStateBoundary.test.tsx`, `apps/web/src/tests/stadiumScene.test.ts`

- [ ] Write tests for all six resource states, 401 login redirect, 403 content purge, and FULL→FAST→LIGHT→STATIC transitions preserving screen route.
- [ ] Run targeted tests and observe missing exports/components.
- [ ] Implement the Korean state boundary and a scene interface with a development-only scaffold plus a semantic 2D static projection.
- [ ] Run targeted tests to green.

### Task 4: Implement the Player Stadium and Spatial Home flow

**Files:**
- Create: `apps/web/src/features/stadium/PlayerStadiumPages.tsx`
- Create: `apps/web/src/features/stadium/playerStadium.css`
- Modify: `apps/web/src/app/AppShell.tsx`
- Modify: `apps/web/src/routes/coreRoutePolicy.ts`
- Test: `apps/web/src/tests/playerStadiumPages.test.tsx`

- [ ] Write route-render tests for Stadium Exterior, Zoom/Approach, Pitch Entry, My Position, My Team Formation, and Spatial Home.
- [ ] Include tests for the own-player double-ring label, teammate number/position-only labels, five or fewer anchors, and a Career route that is absent from the bottom nav.
- [ ] Run tests and observe missing player-page behavior.
- [ ] Implement the six-stage route flow with adapter data and static scene parity; retain HOME/TRAINING/COMMUNITY/VIDEO/MORE navigation.
- [ ] Run focused tests to green.

### Task 5: Implement the fixture-local Community product slice and safety layer

**Files:**
- Create: `apps/web/src/features/community/communityModel.ts`
- Create: `apps/web/src/features/community/CommunityPages.tsx`
- Create: `apps/web/src/features/community/community.css`
- Modify: `apps/web/src/app/AppShell.tsx`
- Test: `apps/web/src/tests/communityModel.test.ts`, `apps/web/src/tests/communityPages.test.tsx`

- [ ] Write tests for audience visibility, HTML/text sanitization, prohibited URL schemes, single-level comments, one like per fixture account, block/hide/report, and local-draft behavior.
- [ ] Run tests and observe missing Community model/pages.
- [ ] Implement an in-memory fixture store with public/member/team visibility and no external mutation endpoint.
- [ ] Implement feed, detail, composer, news, YouTube provenance, highlight unavailable state, prediction, leaderboard, and development-request views using only the safe fixture model.
- [ ] Run targeted tests to green.

### Task 6: Implement Training, Video, and Career read routes

**Files:**
- Create: `apps/web/src/features/player/PlayerReadPages.tsx`
- Modify: `apps/web/src/app/AppShell.tsx`
- Test: `apps/web/src/tests/playerReadPages.test.tsx`

- [ ] Write tests for fixture schedule labels, unavailable video/empty career states, and no synthetic statistics.
- [ ] Run tests and observe missing pages.
- [ ] Implement adapter-driven read surfaces with state boundary integration and media/source labels.
- [ ] Run targeted tests to green.

### Task 7: Apply responsive Graphite surfaces and accessibility checks

**Files:**
- Modify: `apps/web/src/styles/app.css`
- Modify: `apps/web/src/design-system/tokens.css`
- Test: `apps/web/src/tests/coreUiAccessibility.test.tsx`, `apps/web/src/tests/coreUiStyles.test.ts`

- [ ] Write tests for token-only color usage in new UI, visible focus, semantic navigation, 44px targets, and responsive viewport style rules.
- [ ] Run tests and observe missing style contract evidence.
- [ ] Add CSS custom-property surfaces, safe-area padding, narrow/standard/large/tablet breakpoints, orientation handling, and reduced-motion rules.
- [ ] Run targeted tests to green.

### Task 8: Update implementation maps and verify the complete slice

**Files:**
- Modify: `docs/implementation/ENGINE_TO_CODE_MAP.md`
- Modify: `docs/implementation/ALGORITHM_TO_CODE_MAP.md`
- Modify: `docs/implementation/API_TO_FRONTEND_BINDING_MAP.md`
- Test: existing mapping/unit tests plus full V2 commands

- [ ] Mark only code-backed E/A entries as `IMPLEMENTED`; retain unimplemented, reserved, and hard-disabled entries exactly.
- [ ] Record the fixture-only adapter boundary and no production binding.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm test -- --reporter=dot`, and `npm run build`.
- [ ] Capture local visual evidence at 320px, 390px, 430px, 768px, and desktop when a browser is available.
- [ ] Commit coherent docs, player, Community, read-route, and test batches; push only with explicit remote authorization.
