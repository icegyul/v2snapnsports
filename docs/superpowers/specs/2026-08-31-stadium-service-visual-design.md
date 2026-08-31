# Stadium Service Visual Design

Status: APPROVED DIRECTION — image-first visual source of truth  
Scope: Stadium Home desktop/mobile and Stadium Builder desktop  
Non-claim: this document does not establish backend, staging, device, or production readiness

## Visual source files

- `docs/visual-reference/stadium-service/01-stadium-home-desktop.png`
  - SHA-256 `8aba913b6d804299c4e6af077b32b15929489f004d511a459958ebb681100e7b`
- `docs/visual-reference/stadium-service/02-stadium-builder-desktop.png`
  - SHA-256 `6ba6f512af0c3fee630f9d63e047ff35d2e6588159b1f6de58bd32f7ffa7751e`
- `docs/visual-reference/stadium-service/03-stadium-home-mobile.png`
  - SHA-256 `9785a22661f5c9aa7d54da364f732bc28a4c80a1377a187ae9ba8da01c1c20e7`

The images are the visual specification. Code must translate them rather than reinterpret them as a generic dark dashboard.

## Core art direction

The product is an architectural sports experience. The stadium is the interface; HTML controls are a restrained overlay.

- Theme: deep graphite blue-hour architectural photography.
- Primary contrast: cold storm-blue exterior versus warm white interior concourse and bowl lights.
- Identity accent: narrow cyan hairlines used only for focus, selection, and the primary action edge.
- Surface character: wet mineral plaza, fine board-formed concrete, clear low-iron glass, brushed structural steel, ribbed roof metal.
- Spatial character: long approach axis, monumental entrance, real foreground reflection, readable roof aperture and truss depth.
- Typography: large Korean grotesk, short lines, quiet supporting text, no pseudo-technical labels.
- UI density: one title, one identity line, one primary action, one navigation system.

## Stadium Home — desktop

### Composition

- Full viewport, no outer card or rounded page wrapper.
- Stadium occupies about 78% of the frame.
- Camera is on the entrance axis at human approach height, slightly below the concourse datum.
- Main entrance sits near the horizontal center; the roof and illuminated bowl remain visible.
- Wet plaza begins at the bottom edge and leads the eye directly to the entrance.
- Text lives in the upper-left dark sky safe area.
- Primary CTA sits below identity text and never competes with the stadium.
- Bottom navigation is integrated into the dark lower edge, not placed in a separate opaque bar.

### Copy

- Heading: `나의 스타디움`
- Identity: `선수 #8 · 중앙 미드필더`
- Primary action: `경기장 입장`
- Navigation: `홈`, `훈련`, `팀`, `커리어`, `영상`

### UI treatment

- Heading: 64–76px at 1440px, weight 650–720, tight but not compressed.
- Supporting identity: 18–22px, cool off-white.
- CTA: dark translucent rectangular architectural control, 1px mineral edge, cyan right edge, quiet arrow.
- No avatar, player portrait, logo, crest, sponsor, stat chip, status pill, or floating dashboard element.

## Stadium Home — mobile

The mobile screen is independently composed, not a crop of desktop.

- Full first viewport fits heading, player identity, stadium, one CTA, and navigation without scrolling.
- Camera is lower and closer, aligned to the main entrance.
- Stadium roof begins around 30–36% of viewport height and the entrance remains centered.
- CTA occupies one clear 44px-plus touch row above navigation.
- Navigation uses five evenly spaced labels with only the active item receiving a cyan underline.
- No desktop side panel, cards, overlay metrics, or sound dock in the first view.

## Stadium Builder — desktop

### Composition

- Stadium preview occupies about 72% of width.
- Right tool rail occupies about 28% and is flush with the viewport edge.
- Preview uses an elevated three-quarter camera that reveals the full roof aperture, exterior structure, entrance, plaza, and illuminated seating.
- Tool rail is one open vertical system, not cards nested inside cards.
- Seven steps remain visible; only the active step has cyan focus.
- Active controls show visual options with simple icons and large targets.

### Copy

- Heading: `스타디움 설계`
- Steps: `스타일`, `보울`, `지붕`, `관람석`, `좌석`, `외관·조명`, `환경`
- Active section: `외관·조명`
- Controls: `외관 구조`, `조명 장면`
- Actions: `복구`, `저장`
- Dirty state: `저장하지 않은 변경이 있습니다.`

### Behavior

- Selecting a step changes the camera focus to the edited structure.
- The stadium remains visible throughout step changes.
- Save and restore do not cover or shift the preview.
- Validator errors appear inline near the affected control, not as a separate dashboard card.

## 3D architecture

The current elliptical bowl remains the foundation but its exterior must be rebuilt to match the source images.

### Required layers

1. Concrete plinth and monumental entrance stair.
2. Repeating tapered concrete buttresses with real depth and shadow.
3. Continuous glass concourse with mullions, interior slabs, warm occupied light, and entrance transparency.
4. Exposed diagonal steel structure between concourse and roof.
5. Broad cantilevered roof with visible underside truss and a clean elliptical aperture.
6. Illuminated seating bowl visible through the aperture and entrance axis.
7. Plaza slabs, drainage joints, planted islands, low bollard lights, and controlled tree silhouettes.

### Geometry discipline

- Use instancing for repeated buttresses, mullions, seats, trees, and bollards.
- Use profile-driven geometry rather than separate copied stadium engines.
- Remove primitive skyline boxes and simple cone/dodecahedron placeholder trees from the hero view.
- Do not fake structure with screen-space lines when actual geometry defines the silhouette.
- Preserve generic/original architecture; do not reproduce a real stadium.

## Materials

- Concrete: cool gray, high roughness, subtle normal variation, darkened rain absorption near ground.
- Glass: low-iron blue-gray reflection, visible interior parallax, moderate roughness, no flat cyan emissive sheet.
- Steel: brushed gunmetal, controlled edge highlights, no chrome.
- Roof: ribbed coated metal with broad specular response and visible structural underside.
- Plaza: dark mineral slabs with fine seams, rough wet reflection, shallow puddle variation.
- Seats: saturated only inside the bowl; patterns remain legible without turning the exterior neon.

## Lighting and atmosphere

- Key environment: storm-clearing blue hour.
- Exterior ambient remains cool and directional.
- Interior/concourse/floodlights use warm neutral white.
- Volumetric haze is restrained around roof and entrance; it must not wash out structure.
- Reflections are strongest on plaza and glass, not every surface.
- The sky has cloud depth and horizon variation; it cannot be a flat color fill.
- NIGHT_EVENT may intensify interior and roof-edge light but must preserve material readability.

## UI design tokens

- Background black: `#071018` family.
- Primary text: `#F2F5F6`.
- Secondary text: `#B0BAC0`.
- Mineral stroke: `rgba(210,225,232,.28)`.
- Focus cyan: `#12DFF3` used sparingly.
- Warm architecture light: `#F1D6A7` family.
- Corners: 0–4px for main actions and rails; avoid large friendly dashboard radii.
- Shadows: scene-derived; UI uses no heavy generic drop shadows.

## Motion choreography

### Motion library

- React layout, step presence, focus, tap, and navigation transitions use Motion.
- Use transform and opacity only for UI motion.
- Use `AnimatePresence`, scoped variants, and reduced-motion behavior.
- Builder animation code remains lazy-loaded with the Builder route.

### Anime.js v4

- Three.js camera and scene values use `animate()` or `createTimeline()` from Anime.js v4.
- Every animation is scoped to one component lifecycle and cancelled or reverted on route change, renderer rebuild, pointer takeover, and unmount.
- No infinite loops, decorative perpetual motion, or wall-clock-dependent acceptance.
- User drag interrupts the automatic camera transition immediately.

### Motion language

- Home entry: one slow cinematic camera push, then user control.
- Builder step change: short camera refocus plus quiet tool-rail content transition.
- Reduced motion: immediate camera state and opacity-only UI transition.

## Responsive and fallback behavior

- Desktop Home uses the exterior entrance camera.
- Mobile Home uses a lower entrance camera with a tighter vertical composition.
- Builder desktop uses aerial three-quarter framing.
- Builder mobile uses preview-first layout and a bottom control sheet only after the first visual frame is stable.
- FAST/LIGHT preserve architecture silhouette, entrance, roof aperture, glass band, and primary lighting.
- STATIC uses a deliberately rendered poster frame of the same architecture, not an unrelated CSS ellipse.

## Visual acceptance

Visual quality is decided by direct comparison with the three reference images.

The result fails if any of the following is true:

- stadium reads as a primitive bowl or black ring;
- exterior layers collapse into one dark material;
- skyline boxes or placeholder trees become visible focal objects;
- UI occupies more visual attention than the stadium;
- Home contains cards, metrics, technical labels, or fake identity imagery;
- mobile is a cropped desktop scene;
- Builder hides the stadium behind controls;
- lighting differences are visible only in labels;
- generated reference and implementation no longer look like the same product.

Performance metrics are a safety gate after visual approval. They do not determine whether the design looks good.

## Privacy and identity

- No real player names or faces.
- No generated avatar.
- No club crest, sponsor, or famous stadium likeness.
- Self identity may show only `#8` and position from the permitted player context.
- Teammates remain anonymous projections according to existing privacy contracts.

## Out of scope for this visual slice

- production account integration;
- tenant DB persistence;
- staging deployment;
- real-device release approval;
- marketing claims or public launch.

Those remain service gates after the visual implementation matches the reference set.
