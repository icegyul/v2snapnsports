# Stadium Commercial Builder Finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the existing SnapN Sports V2 Stadium Builder as a commercially presentable, cinematic product surface and prove every visual-runtime distinction on the exact continuation source.

**Architecture:** Preserve the existing Three.js Stadium renderer and extend its optional Builder recipe path rather than replacing the engine. Motion 13.1.1 owns React layout/state transitions; Anime.js 4.5.0 owns the short imperative preview showcase orbit. The browser verifier captures the WebGL canvas itself, computes pixel metrics, watches context loss, and records desktop/mobile evidence.

**Tech Stack:** React 18.3, TypeScript 5.7, Vite 6.4, Three.js 0.185, Motion 13.1.1, Anime.js 4.5.0, Vitest 4.1, Playwright 1.55.

**Spec:** `docs/handoff/2026-08-30/SNAPN_STADIUM_V2_CONTINUATION_DIRECTIVE_KO.md`

## Global Constraints

- Continue from source HEAD `92f7d5211b2c44b17fb9ed71924c859a4f58fc33` on `feature/v2-stadium-first-screen-complete`; never overwrite the existing dirty integration checkout.
- Do not create a new product, replace Three.js, remove accepted deep links, or remove `STATIC` fallback.
- Preserve `FULL -> FAST/QUICK -> LIGHT -> STATIC`, minor-first privacy, anonymous teammate projection, and hard-disabled `EPTS/CAMERA_AI/SPORTS_AI`.
- Do not reproduce a famous real stadium, club identity, sponsor mark, or player identity.
- Motion controls React UI; Anime.js controls only the Builder preview showcase values passed to the existing renderer.
- `prefers-reduced-motion: reduce` disables spatial movement and uses opacity-only UI feedback.
- The commercial visual direction is a graphite architectural atelier: cinematic WebGL dominates, controls read as precision instruments, Korean copy is product copy rather than engineering notes, and no generic dashboard-card grid is introduced.
- No commit, push, merge, PR update, deployment, or production activation while any latest-head acceptance gate remains `BLOCKED`, `PARTIAL`, or `FAIL`.

---

### Task 1: Isolated exact-head baseline and evidence inventory

**Files:**
- Read: `SOURCE_HEAD.txt` from the handoff package
- Read: `docs/handoff/2026-08-30/SNAPN_STADIUM_V2_CONTINUATION_DIRECTIVE_KO.md`
- Generate: `output/stadium-commercial-baseline/**`

**Interfaces:**
- Consumes: exact continuation commit and existing capture scripts.
- Produces: baseline command logs and current desktop/mobile screenshots used for before/after review.

- [ ] **Step 1: Verify provenance before dependency installation**

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
```

Expected: clean isolated worktree, branch `codex/stadium-commercial-finish`, HEAD descended from exact source `92f7d5211b2c44b17fb9ed71924c859a4f58fc33`.

- [ ] **Step 2: Install the locked baseline and run the full non-browser gate**

Run:

```bash
npm ci
npm run typecheck
npm run lint
npm test -- --reporter=dot
npm run build
```

Expected: every command exits 0. Record the actual test count; do not reuse the historical 146 count.

- [ ] **Step 3: Capture the existing Builder before any visual change**

Run:

```bash
npm install --no-save --package-lock=false playwright@1.55.0
npx playwright install chromium
npx vite preview --host 127.0.0.1 --port 4173
```

In a second shell run:

```bash
STADIUM_BUILDER_EVIDENCE_DIR=output/stadium-commercial-baseline node tools/capture_stadium_builder.mjs
```

Expected: desktop and mobile evidence files exist. Their status remains `RECORDED_BASELINE`, not current completion evidence.

- [ ] **Step 4: Inspect both baseline screenshots at original resolution**

Check the exterior silhouette, bowl depth, seat legibility, facade differentiation, lighting, preview prominence, Korean hierarchy, touch density, and bottom-navigation clearance. Record defects in `output/stadium-commercial-baseline/visual-audit.md` with `PRODUCT`, `VERIFIER`, or `UNKNOWN` classification.

---

### Task 2: Add explicit Motion and Anime.js ownership with reduced-motion policy

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `apps/web/src/features/stadium-builder/stadiumBuilderMotion.ts`
- Create: `apps/web/src/tests/stadiumBuilderMotion.test.ts`

**Interfaces:**
- Consumes: browser reduced-motion preference and Builder step/preset changes.
- Produces: `getStadiumBuilderMotionProfile(reduced: boolean): StadiumBuilderMotionProfile` used by both React and Three.js preview layers.

- [ ] **Step 1: Write the failing motion-policy tests**

```ts
import { describe, expect, it } from "vitest";
import { getStadiumBuilderMotionProfile } from "../features/stadium-builder/stadiumBuilderMotion";

describe("Stadium Builder motion policy", () => {
  it("uses a restrained spring and one-shot showcase for standard motion", () => {
    expect(getStadiumBuilderMotionProfile(false)).toEqual({
      panel: { type: "spring", stiffness: 280, damping: 30, mass: 0.86 },
      panelOffset: 18,
      preview: { enabled: true, duration: 1650, fromOrbit: -7, toOrbit: 11, fromZoom: 0.96, toZoom: 1.025 },
    });
  });

  it("removes spatial movement when reduced motion is requested", () => {
    expect(getStadiumBuilderMotionProfile(true)).toEqual({
      panel: { duration: 0.16 },
      panelOffset: 0,
      preview: { enabled: false, duration: 0, fromOrbit: 0, toOrbit: 0, fromZoom: 1, toZoom: 1 },
    });
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run apps/web/src/tests/stadiumBuilderMotion.test.ts`

Expected: FAIL because `stadiumBuilderMotion.ts` does not exist.

- [ ] **Step 3: Install pinned stable packages**

Run: `npm install --save-exact motion@13.1.1 animejs@4.5.0`

Expected: `package.json` and `package-lock.json` contain exact non-beta versions. Both packages are MIT licensed.

- [ ] **Step 4: Implement the pure motion policy**

```ts
export interface StadiumBuilderMotionProfile {
  readonly panel: Readonly<Record<string, number | string>>;
  readonly panelOffset: number;
  readonly preview: Readonly<{
    enabled: boolean;
    duration: number;
    fromOrbit: number;
    toOrbit: number;
    fromZoom: number;
    toZoom: number;
  }>;
}

export function getStadiumBuilderMotionProfile(reduced: boolean): StadiumBuilderMotionProfile {
  return reduced
    ? {
        panel: { duration: 0.16 },
        panelOffset: 0,
        preview: { enabled: false, duration: 0, fromOrbit: 0, toOrbit: 0, fromZoom: 1, toZoom: 1 },
      }
    : {
        panel: { type: "spring", stiffness: 280, damping: 30, mass: 0.86 },
        panelOffset: 18,
        preview: { enabled: true, duration: 1650, fromOrbit: -7, toOrbit: 11, fromZoom: 0.96, toZoom: 1.025 },
      };
}
```

- [ ] **Step 5: Run the scoped test and full typecheck**

Run:

```bash
npx vitest run apps/web/src/tests/stadiumBuilderMotion.test.ts
npm run typecheck
```

Expected: both commands exit 0.

---

### Task 3: Make every Builder architecture profile visibly affect the existing renderer

**Files:**
- Create: `apps/web/src/three/stadiumVisualProfile.ts`
- Modify: `apps/web/src/three/stadiumWebglV14.ts`
- Modify: `apps/web/src/features/stadium-builder/stadiumBuilderModel.ts`
- Create: `apps/web/src/tests/stadiumVisualProfile.test.ts`
- Modify: `apps/web/src/tests/stadiumBuilderModel.test.ts`

**Interfaces:**
- Consumes: optional `bowlProfile`, `roofProfile`, `standProfile`, `seatPattern`, `facadeProfile`, `lightingProfile`, and `environmentProfile` on `StadiumRecipe`.
- Produces: `resolveStadiumVisualProfile(recipe)` and a renderer whose geometry, materials, lights, sky, and atmosphere differ deterministically while recipes without Builder fields retain the existing stadium.

- [ ] **Step 1: Write failing tests for architectural and atmosphere resolution**

```ts
import { describe, expect, it } from "vitest";
import { BASE_STADIUM_RECIPE } from "../three/stadiumWebglV14";
import { resolveStadiumVisualProfile } from "../three/stadiumVisualProfile";

describe("Stadium Builder visual profile", () => {
  it("keeps the canonical non-builder renderer neutral", () => {
    expect(resolveStadiumVisualProfile(BASE_STADIUM_RECIPE)).toMatchObject({
      builderVisuals: false,
      bowlRadiusScale: 1,
      tierRiseScale: 1,
      facadeRibCount: 64,
      clearAlpha: 0,
    });
  });

  it("resolves visibly distinct park daylight and night event art direction", () => {
    const park = resolveStadiumVisualProfile({
      ...BASE_STADIUM_RECIPE,
      bowlProfile: "BALANCED",
      roofProfile: "OPEN_RING",
      standProfile: "SINGLE_BOWL",
      lightingProfile: "DAYLIGHT",
      environmentProfile: "PARK",
      facadeProfile: "LIGHT_FRAME",
    });
    const night = resolveStadiumVisualProfile({
      ...BASE_STADIUM_RECIPE,
      bowlProfile: "STEEP",
      roofProfile: "FULL_CANOPY",
      standProfile: "TRIPLE_DECK",
      lightingProfile: "EVENT",
      environmentProfile: "NIGHT_EVENT",
      facadeProfile: "SOLID_RIB",
    });

    expect(park).toMatchObject({ builderVisuals: true, facadeRibCount: 32, clearAlpha: 1, keyIntensity: 1.52 });
    expect(night).toMatchObject({ builderVisuals: true, facadeRibCount: 80, clearAlpha: 1, keyIntensity: 0.88 });
    expect(park.skyTop).not.toBe(night.skyTop);
    expect(park.tierRiseScale).not.toBe(night.tierRiseScale);
  });
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npx vitest run apps/web/src/tests/stadiumVisualProfile.test.ts apps/web/src/tests/stadiumBuilderModel.test.ts`

Expected: FAIL because the resolver and Builder architecture fields are absent.

- [ ] **Step 3: Extend `StadiumRecipe` without changing the canonical default recipe**

Add optional fields:

```ts
bowlProfile?: "COMPACT" | "BALANCED" | "STEEP";
roofProfile?: "OPEN_RING" | "HALF_CANOPY" | "FULL_CANOPY";
standProfile?: "SINGLE_BOWL" | "DOUBLE_DECK" | "TRIPLE_DECK";
```

Update `stadiumBuilderDraftToRecipe()` to map all three fields directly from the draft. Do not add them to `BASE_STADIUM_RECIPE`.

- [ ] **Step 4: Implement deterministic visual resolution**

Implement `resolveStadiumVisualProfile()` with these exact mappings:

```ts
const bowlRadiusScale = recipe.bowlProfile === "COMPACT" ? 0.92 : recipe.bowlProfile === "STEEP" ? 0.97 : 1;
const tierRiseScale = recipe.bowlProfile === "COMPACT" ? 0.9 : recipe.bowlProfile === "STEEP" ? 1.12 : 1;
const roofLift = recipe.roofProfile === "OPEN_RING" ? 0 : recipe.roofProfile === "HALF_CANOPY" ? 1.4 : 2.2;
const facadeRibCount = recipe.facadeProfile === "LIGHT_FRAME" ? 32 : recipe.facadeProfile === "SOLID_RIB" ? 80 : 48;
const keyIntensity = recipe.lightingProfile === "DAYLIGHT" ? 1.52 : recipe.lightingProfile === "EVENT" ? 0.88 : 1.25;
```

Use fixed color tuples for URBAN, PARK, COASTAL, CIVIC, and NIGHT_EVENT sky top, sky horizon, ground, fog, and practical-light color. `builderVisuals` is true only when any Builder-only optional field is present.

- [ ] **Step 5: Apply the profile to real geometry and PBR results**

In `stadiumWebglV14.ts`:

- scale tier inner/outer radii and vertical rise from `bowlRadiusScale` and `tierRiseScale`;
- lift and reshape canopy geometry from `roofLift` and `roofProfile`;
- build 80 deep ribs for `SOLID_RIB`, a continuous reflective band plus 48 mullions for `GLASS_BAND`, and 32 emissive structural frames for `LIGHT_FRAME`;
- pass the recipe profile into `addLighting()` so DAYLIGHT, BALANCED, and EVENT modify key/fill/practical light color and intensity, not exposure alone;
- create a Builder-only sky gradient canvas texture and environment-specific horizon silhouettes; retain transparent clear color for the canonical recipe;
- keep all new geometries, materials, and textures in the existing disposal sets.

- [ ] **Step 6: Prove the recipe mapping and resolver are green**

Run:

```bash
npx vitest run apps/web/src/tests/stadiumVisualProfile.test.ts apps/web/src/tests/stadiumBuilderModel.test.ts
npm run typecheck
npm run lint
```

Expected: all commands exit 0 with zero lint warnings introduced by these files.

---

### Task 4: Recompose the Builder as a cinematic architectural atelier

**Files:**
- Create: `apps/web/src/features/stadium-builder/StadiumBuilderControls.tsx`
- Modify: `apps/web/src/features/stadium-builder/StadiumBuilderPage.tsx`
- Modify: `apps/web/src/features/stadium-builder/StadiumBuilderPreview.tsx`
- Modify: `apps/web/src/features/stadium-builder/stadiumBuilder.css`
- Create: `apps/web/src/tests/stadiumBuilderPage.test.tsx`

**Interfaces:**
- Consumes: existing seven-step draft, validator, storage functions, and `getStadiumBuilderMotionProfile()`.
- Produces: the same save/restore and route contract in a high-end responsive composition with Korean product copy.

- [ ] **Step 1: Write the failing UI contract test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { StadiumBuilderPage } from "../features/stadium-builder/StadiumBuilderPage";

vi.mock("../features/stadium-builder/StadiumBuilderPreview", () => ({
  StadiumBuilderPreview: () => <div aria-label="경기장 Builder 3D 미리보기" />,
}));

describe("Stadium Builder commercial workspace", () => {
  it("presents seven Korean creation stages and real visual controls", () => {
    render(<MemoryRouter><StadiumBuilderPage /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "나만의 스타디움 설계" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /단계/ })).toHaveLength(7);
    fireEvent.click(screen.getByRole("button", { name: /6단계 외관과 조명/ }));
    expect(screen.getByLabelText("외관 구조")).toBeInTheDocument();
    expect(screen.getByLabelText("조명 장면")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run apps/web/src/tests/stadiumBuilderPage.test.tsx`

Expected: FAIL because the new heading, accessible step names, and Korean control labels are absent.

- [ ] **Step 3: Extract focused controls and replace engineering copy**

Move `BuilderStepEditor` into `StadiumBuilderControls.tsx`. Use these visible Korean labels:

- `스타일 컬렉션`, `설계 프리셋`
- `보울 형태`, `관람석 단수`
- `지붕 형태`, `지붕 커버리지`
- `스탠드 구조`
- `좌석 패턴`, `기본 좌석색`, `강조 좌석색`, `좌석 밀도`
- `외관 구조`, `조명 장면`
- `주변 환경`

Remove statements saying facade or environment is only a future semantic adapter because the renderer now applies them.

- [ ] **Step 4: Implement Motion-driven state transitions**

Use `AnimatePresence mode="wait"`, `motion.section`, `motion.button`, and `useReducedMotion` from `motion/react`. Key the control body by `currentStep`; animate only opacity and transform. Standard motion enters from `y: 18` with the shared spring; reduced motion uses `y: 0` and 160ms opacity.

- [ ] **Step 5: Apply the commercial layout and material language**

Implement one dominant preview stage with a precision control rail rather than a dashboard grid:

- desktop: control rail `minmax(320px, 400px)` and preview `minmax(0, 1fr)`;
- preview height: `clamp(620px, calc(100dvh - 132px), 880px)`;
- graphite base `#070b0e`, deep metal `#11181d`, cold white `#eef7fa`, cyan accent `#72d7ff`, event amber `#f2b866`;
- concentric preview bezel with subtle inner highlight; no generic gray border or harsh shadow;
- readable 44px minimum controls and 12px minimum Korean helper copy;
- mobile below 760px: preview first, 54dvh minimum, horizontal step rail, control panel below, safe-area bottom padding;
- preserve focus-visible rings and native form semantics.

- [ ] **Step 6: Run UI, accessibility-adjacent, and static checks**

Run:

```bash
npx vitest run apps/web/src/tests/stadiumBuilderPage.test.tsx apps/web/src/tests/stadiumBuilderModel.test.ts
npm run typecheck
npm run lint
```

Expected: every command exits 0.

---

### Task 5: Add a one-shot Anime.js preview showcase without breaking renderer lifecycle

**Files:**
- Modify: `apps/web/src/features/stadium-builder/StadiumBuilderPreview.tsx`
- Create: `apps/web/src/tests/stadiumBuilderPreview.test.tsx`

**Interfaces:**
- Consumes: `getStadiumBuilderMotionProfile()`, existing `StadiumWebglRenderer.render(orbit, zoom)`, and settled debounced draft.
- Produces: one cancellable Anime.js animation per settled preset plus `data-render-revision`, visual-profile attributes, and renderer diagnostics for acceptance.

- [ ] **Step 1: Write a failing lifecycle test with mocked renderer and Anime.js**

The test must assert:

```ts
expect(animate).toHaveBeenCalledTimes(1);
expect(renderer.render).toHaveBeenCalled();
fireEvent.pointerDown(screen.getByLabelText("경기장 Builder 3D 미리보기"));
expect(animation.cancel).toHaveBeenCalledTimes(1);
unmount();
expect(renderer.destroy).toHaveBeenCalledTimes(1);
```

Add a reduced-motion case where `animate` is not called and `renderer.render(0, 1)` is called.

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run apps/web/src/tests/stadiumBuilderPreview.test.tsx`

Expected: FAIL because Anime.js is not connected.

- [ ] **Step 3: Implement the scoped showcase animation**

After renderer creation and resize, run:

```ts
const showcase = {
  orbit: motion.preview.fromOrbit,
  zoom: motion.preview.fromZoom,
};
showcaseAnimationRef.current = animate(showcase, {
  orbit: motion.preview.toOrbit,
  zoom: motion.preview.toZoom,
  duration: motion.preview.duration,
  ease: "out(3)",
  onUpdate: () => renderer?.render(showcase.orbit, showcase.zoom),
});
```

Cancel the animation on pointer down, renderer rebuild, component unmount, and reduced-motion preference change. Do not loop and do not animate while the user drags.

- [ ] **Step 4: Add verifier-readable state without using it as visual proof**

On `.stadium-builder-preview-panel`, expose:

```tsx
data-rendered-preset={renderDraft.selectedPresetId}
data-seat-pattern={renderDraft.seat.pattern}
data-facade-profile={renderDraft.facadeLight.facade}
data-lighting-profile={renderDraft.facadeLight.lighting}
data-environment-profile={renderDraft.environment.profile}
data-render-revision={renderRevision}
```

The browser verifier uses these attributes only to know when a requested frame has settled; PASS still requires pixel change.

- [ ] **Step 5: Run lifecycle and regression tests**

Run:

```bash
npx vitest run apps/web/src/tests/stadiumBuilderPreview.test.tsx apps/web/src/tests/stadiumBuilderMotion.test.ts
npm run typecheck
npm run lint
```

Expected: all commands exit 0 and cleanup assertions pass.

---

### Task 6: Replace whole-page byte comparison with canvas pixel evidence

**Files:**
- Create: `tools/stadium-frame-analysis.mjs`
- Create: `tools/stadium-frame-analysis.test.mjs`
- Modify: `tools/capture_stadium_builder.mjs`
- Modify: `.github/workflows/stadium-builder-browser.yml`

**Interfaces:**
- Consumes: decoded RGBA arrays from canvas-only Playwright screenshots.
- Produces: `summarizeFrame()`, `compareFrames()`, per-profile PNGs, pixel metrics, context-loss count, rebuild count, and final JSON verdict.

- [ ] **Step 1: Write failing Node tests for pixel metrics**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { compareFrames, summarizeFrame } from "./stadium-frame-analysis.mjs";

test("identical frames have zero visual delta", () => {
  const frame = new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255]);
  assert.deepEqual(compareFrames(frame, frame), {
    changedPixelRatio: 0,
    meanAbsoluteChannelDelta: 0,
  });
});

test("different luminance and colors produce measurable delta", () => {
  const a = new Uint8ClampedArray([0, 0, 0, 255, 20, 20, 20, 255]);
  const b = new Uint8ClampedArray([100, 30, 10, 255, 80, 100, 120, 255]);
  assert.ok(compareFrames(a, b).changedPixelRatio >= 1);
  assert.ok(summarizeFrame(b).meanLuminance > summarizeFrame(a).meanLuminance);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tools/stadium-frame-analysis.test.mjs`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement deterministic frame metrics**

`summarizeFrame(rgba)` returns mean luminance, mean RGB, 16-bin luminance histogram, dark-pixel ratio, and highlight ratio. `compareFrames(a, b)` returns changed-pixel ratio using per-pixel RGB delta greater than 18 and mean absolute channel delta.

- [ ] **Step 4: Capture isolated visual dimensions**

Enhance `capture_stadium_builder.mjs` to capture only `.stadium-builder-preview-canvas` after `data-rendered-preset` settles. Record:

- representative presets: `urban-compact-two`, `night-event-cyan`, `open-air-park`;
- seat-only sequence: MONO -> DUO -> GRADIENT;
- facade-only sequence: SOLID_RIB -> GLASS_BAND -> LIGHT_FRAME;
- lighting-only sequence: DAYLIGHT -> BALANCED -> EVENT;
- environment-only sequence: URBAN -> PARK -> COASTAL -> CIVIC -> NIGHT_EVENT;
- 30 rapid preset changes at 35ms intervals followed by one settled frame.

Listen for `webglcontextlost` and `webglcontextrestored` on the canvas before the rapid sequence.

- [ ] **Step 5: Enforce explicit visual thresholds**

Each isolated comparison must satisfy:

```js
changedPixelRatio >= 0.02
meanAbsoluteChannelDelta >= 2
```

Each representative family pair must also have 16-bin histogram distance at least `0.015`. DAYLIGHT and EVENT mean luminance must differ by at least `1.5`. Rapid switching must end `READY`, with context loss `0`, console errors `0`, and no more than `3` renderer revisions during the 30-click burst plus settle window.

- [ ] **Step 6: Run the metric tests and Builder browser verifier**

Run:

```bash
node --test tools/stadium-frame-analysis.test.mjs
STADIUM_BUILDER_EVIDENCE_DIR=output/stadium-builder-commercial node tools/capture_stadium_builder.mjs
```

Expected: Node tests pass and both desktop `1440x1000` and mobile `390x844@2x` evidence report every threshold, context loss 0, and console errors 0.

---

### Task 7: Fresh full matrix and truthful commercial visual closeout

**Files:**
- Create: `docs/implementation/STADIUM_COMMERCIAL_VISUAL_ACCEPTANCE_2026-08-30.md`
- Generate: `output/stadium-commercial-final/**`

**Interfaces:**
- Consumes: all production changes, test outputs, six existing browser verifiers, new canvas metrics, and original-resolution screenshots.
- Produces: one Korean closeout with exact `PASS_EXECUTED`, `BLOCKED`, `PARTIAL`, or `FAIL` labels.

- [ ] **Step 1: Run the complete non-browser gate fresh**

Run:

```bash
npm run typecheck
npm run lint
npm test -- --reporter=dot
npm run build
node --test tools/stadium-frame-analysis.test.mjs
```

Expected: every command exits 0 before any positive completion wording is written.

- [ ] **Step 2: Run all six browser verifiers against the same built source**

Run:

```bash
node tools/capture_stadium_visual.mjs
node tools/capture_full_stadium_journey.mjs
node tools/capture_digital_projection_3d.mjs
node tools/capture_stadium_audio.mjs
node tools/capture_default_full_entry.mjs
STADIUM_BUILDER_EVIDENCE_DIR=output/stadium-commercial-final node tools/capture_stadium_builder.mjs
```

Expected: each verifier returns exit 0 or is recorded with its exact failing assertion; verifier failures are not weakened before product/verifier root cause is established.

- [ ] **Step 3: Inspect final screenshots at original resolution**

Inspect desktop and mobile images for commercial visual quality. Reject the result if the stadium reads as a primitive bowl, if visual profiles are distinguishable only by text, if the control rail resembles a generic admin form, if motion obscures control, or if mobile crops the focal stadium.

- [ ] **Step 4: Write the Korean closeout with evidence boundaries**

The closeout must include source SHA, changed files, command outputs, actual test count, each route, browser/viewport, screenshot paths, canvas metric table, console error count, context loss count, reduced-motion result, fallback result, triangle/resource trend where available, and known gaps.

- [ ] **Step 5: Stop at local evidence**

Do not commit, push, merge, update PR #1, deploy, or add the Spatial Home Builder anchor. Report the local result and request a separate decision for integration only after all latest-head gates are `PASS_EXECUTED`.

---

## Self-review result

- Spec coverage: P0 full matrix is Task 1 and Task 7; P1 visual frame evidence is Task 6; P2 real editing UX and renderer effects are Tasks 3-5; P3 is intentionally gated after local acceptance.
- Placeholder scan: no deferred implementation markers remain.
- Type consistency: `StadiumBuilderMotionProfile`, `resolveStadiumVisualProfile()`, Builder recipe fields, preview data attributes, and frame metric names are consistent across tasks.
- Scope: no authentication, tenant cloud save, deployment, or unrelated PACK work is included.
