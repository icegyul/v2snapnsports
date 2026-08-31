# Stadium Service Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Stadium Home and Builder to match the approved image references so the stadium reads as a premium architectural service rather than a procedural demo.

**Architecture:** Keep `stadiumWebglV14.ts` as the geometry/PBR engine and add one `SERVICE_HOME` presentation profile plus focused architecture helpers. Import one final route-scoped CSS layer after the historical style stack. Motion handles React UI presence; Anime.js v4 handles cancellable camera transitions only.

**Tech Stack:** React 18.3, TypeScript 5.7, Three.js 0.185, Motion 13.1.1, Anime.js 4.5.0, Vitest 4.1, Vite 6.4.

**Spec:** `docs/superpowers/specs/2026-08-31-stadium-service-visual-design.md`

## Global Constraints

- The four files under `docs/visual-reference/stadium-service/` are the visual source of truth.
- Keep the existing Three.js renderer and accepted route contracts.
- Do not expose a real player face, generated avatar, club crest, sponsor, or famous stadium likeness.
- Preserve FULL → FAST → LIGHT → STATIC and all current privacy/accessibility contracts.
- Motion controls React UI only; Anime.js v4 controls cancellable camera values only.
- Do not commit, merge, push, or deploy in this slice.

---

### Task 1: Lock service presentation and camera contracts

**Files:**
- Create: `apps/web/src/three/stadiumServicePresentation.ts`
- Create: `apps/web/src/tests/stadiumServicePresentation.test.ts`
- Modify: `apps/web/src/three/stadiumWebglV14.ts`
- Modify: `apps/web/src/three/stadiumWebglV151.ts`

**Interfaces:**
- Produces: `resolveServiceCamera(viewport: "DESKTOP" | "MOBILE", orbit: number, zoom: number): ServiceCameraPose`
- Produces: `SERVICE_HOME` recipe presentation flag.

- [ ] Write failing tests asserting desktop uses a low entrance-axis camera, mobile uses a lower/tighter entrance camera, and both target the central glass concourse.
- [ ] Run `npx vitest run apps/web/src/tests/stadiumServicePresentation.test.ts` and confirm the missing-module failure.
- [ ] Implement literal camera poses and add `presentationProfile?: "SERVICE_HOME"` to `StadiumRecipe`.
- [ ] Set `BASE_STADIUM_ACCEPTANCE_RECIPE.presentationProfile = "SERVICE_HOME"`.
- [ ] Route the default `render()` path through `resolveServiceCamera()` only for SERVICE_HOME; preserve Builder and journey cameras.
- [ ] Run the scoped test and `npm run typecheck`.

---

### Task 2: Build the service exterior architecture

**Files:**
- Create: `apps/web/src/three/stadiumServiceArchitecture.ts`
- Create: `apps/web/src/tests/stadiumServiceArchitecture.test.ts`
- Modify: `apps/web/src/three/stadiumWebglV14.ts`

**Interfaces:**
- Produces: `resolveServiceArchitecture()` with entrance, buttress, concourse, stair, plaza, and lighting dimensions.
- Consumes: existing geometry/material/texture disposal sets.

- [ ] Write failing tests for a 45m central glass entrance, eight front-sector tapered buttresses, six entrance stair runs, 48 concourse mullions, and a wet plaza larger than the facade footprint.
- [ ] Run the test and verify RED.
- [ ] Implement `resolveServiceArchitecture()` as pure data.
- [ ] Add real entrance glass, interior slabs, mullions, tapered concrete buttresses, stair geometry, plaza seams, planted islands, and bollard lights to the existing scene.
- [ ] Keep repeated elements instanced and register every resource for disposal.
- [ ] Remove placeholder skyline blocks and primitive hero trees from SERVICE_HOME only.
- [ ] Run scoped tests, typecheck, and lint.

---

### Task 3: Apply the photographic environment and material hierarchy

**Files:**
- Modify: `apps/web/src/assets/stadium-service-sky.png`
- Create: `apps/web/src/features/stadium/stadiumServiceVisual.css`
- Modify: `apps/web/src/three/stadiumWebgl.ts`
- Modify: `apps/web/src/three/stadiumWebglV14.ts`

**Interfaces:**
- Consumes: `stadium-service-sky.png` and SERVICE_HOME presentation state.
- Produces: full-viewport sky/plaza composition and material separation matching reference 01/03.

- [ ] Add `stadiumServiceVisual.css` as the final imported Stadium style layer.
- [ ] Use the generated sky plate as the full-bleed SERVICE_HOME background; keep the WebGL canvas transparent around architecture.
- [ ] Tune concrete, glass, steel, roof, plaza, and warm interior light as separate PBR material families.
- [ ] Remove historical CSS transforms/filters from SERVICE_HOME with final route-specific overrides.
- [ ] Preserve non-home route styling and STATIC fallback.
- [ ] Run typecheck, lint, and production build.

---

### Task 4: Recompose Stadium Home as an open architectural interface

**Files:**
- Modify: `apps/web/src/features/stadium/PlayerStadiumPages.tsx`
- Modify: `apps/web/src/features/stadium/stadiumServiceVisual.css`
- Modify: `apps/web/src/tests/playerStadiumPages.test.tsx`
- Modify: `apps/web/src/tests/appShell.test.tsx`

**Interfaces:**
- Consumes: permitted self player number and primary position.
- Produces: heading `나의 스타디움`, identity `선수 #8 · 중앙 미드필더`, CTA `경기장 입장`, and five-item navigation.

- [ ] Write failing UI tests for exact copy, no avatar/logo/status cards, one primary entry action, and unchanged `/v2/home/full` navigation.
- [ ] Run scoped tests and verify RED.
- [ ] Replace team-state/demo-badge/identity-card/enter-cue/footer clutter with the open reference composition.
- [ ] Retain synthetic-data truth in an accessible non-hero note outside the first visual hierarchy.
- [ ] Implement independent desktop and mobile layouts matching references 01 and 03.
- [ ] Use Motion for restrained CTA/nav/heading presence with reduced-motion fallback.
- [ ] Run scoped tests, accessibility checks, and typecheck.

---

### Task 5: Flatten Builder UI and preserve stadium dominance

**Files:**
- Modify: `apps/web/src/features/stadium-builder/StadiumBuilderPage.tsx`
- Modify: `apps/web/src/features/stadium-builder/StadiumBuilderControls.tsx`
- Modify: `apps/web/src/features/stadium-builder/StadiumBuilderPreview.tsx`
- Modify: `apps/web/src/features/stadium-builder/stadiumBuilder.css`
- Modify: `apps/web/src/tests/stadiumBuilderPage.test.tsx`
- Modify: `apps/web/src/tests/stadiumBuilderPreview.test.tsx`

**Interfaces:**
- Produces: 72/28 desktop preview/tool layout, inline validation, and the exact step/copy system from reference 02.

- [ ] Write failing tests proving the preview precedes the tool rail, no separate validator panel exists, and save/restore remain accessible.
- [ ] Run scoped tests and verify RED.
- [ ] Flatten the tool rail, move validation beside affected controls, remove nested panels and metadata cards, and preserve all seven edit stages.
- [ ] Keep Anime.js v4 camera animation cancellable on pointer takeover/unmount and use the approved elevated three-quarter framing.
- [ ] Keep Motion transitions transform/opacity-only and reduced-motion safe.
- [ ] Run scoped tests, typecheck, lint, and build.

---

### Task 6: Visual implementation acceptance

**Files:**
- Create: `docs/implementation/STADIUM_SERVICE_VISUAL_IMPLEMENTATION_2026-08-31.md`
- Generate: `output/stadium-service-visual/**`

**Interfaces:**
- Consumes: reference images and current browser screenshots.
- Produces: side-by-side desktop Home, mobile Home, and desktop Builder evidence.

- [ ] Run the full 158-test suite, typecheck, lint, build, and diff check.
- [ ] Capture 1440×900 Stadium Home, 390×844 Stadium Home, and 1440×900 Builder at original resolution.
- [ ] Inspect references and implementation side-by-side for architecture, camera, material separation, sky, UI hierarchy, and mobile composition.
- [ ] Reject the result if it reads as a black ring, primitive bowl, dashboard, or cropped desktop mobile screen.
- [ ] Record visual findings before any performance numbers.
- [ ] Run existing Stadium Visual, Default Entry, Full Entry, Projection, Audio, and Builder browser contracts after visual approval.

## Self-review result

- Reference coverage: Home desktop/mobile and Builder desktop each have a dedicated task and screenshot gate.
- Architecture coverage: camera, exterior geometry, PBR materials, sky, Home UI, Builder UI, and motion lifecycle are explicit.
- Privacy coverage: no face, avatar, club identity, or invented teammate data.
- Scope: authenticated backend and deployment remain separate service gates after the visual slice.
