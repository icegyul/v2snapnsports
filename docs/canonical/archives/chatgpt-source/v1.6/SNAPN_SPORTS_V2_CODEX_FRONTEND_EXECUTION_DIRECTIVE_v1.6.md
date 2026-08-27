# SNAPN SPORTS V2 CODEX FRONTEND EXECUTION DIRECTIVE v1.6

## Mission
Implement V2 frontend against approved contracts without inventing legacy behavior, future sensor metrics, or unauthorized role access.

## Step 0 — READ-ONLY first
Do not edit application code. Produce:
1. FRONTEND_STACK_INVENTORY.md
2. FRONTEND_ROUTE_INVENTORY.md
3. FRONTEND_STATE_DATA_FLOW.md
4. FRONTEND_3D_ASSET_AUDIT.md
5. FRONTEND_COMMUNITY_PARITY_AUDIT.md
6. FRONTEND_GAP_ANALYSIS_v1.6.md
7. FRONTEND_STACK_BINDING_v1.6.md

Audit framework/version, mobile/web targets, router, auth/session restore, state/query libraries, local persistence, offline strategy, OpenAPI client, media upload, 3D runtime/asset pipeline, design system, tests, build/release.

## Hard rules
- Public signup = PLAYER / MANAGER only.
- Guardian is invite-only.
- Role preference never grants privileged workspace.
- Player bottom nav = HOME / TRAINING / COMMUNITY / VIDEO / MORE.
- Community behavior is legacy parity first.
- EPTS / Camera AI / Sports AI = NOT_RENDERED until release approval.
- No fake ratings, GPS, heart-rate, recovery, AI confidence or injury probability.
- No 3D-only core task; Static/2D equivalent mandatory.
- Do not replace the existing framework/router/state library merely because the reference scaffold differs.
- Do not claim completion without acceptance evidence.

## Phase F1 — Shell / Identity / Role Projection
Bind session restore, GET /v2/me, GET /v2/features, PLAYER/MANAGER signup, Guardian invite, Role preference, verification status and verified role switcher.

## Phase F2 — Community Parity
Bind existing/adapter community feed, post, comment, media, visibility, report and block behavior. Preserve ordering/pagination. Feed Intelligence remains OFF.

## Phase F3 — My Football World
Implement FULL/FAST/LIGHT/STATIC entry modes, asset loader, Pitch, My Position, Team Formation, Scoreboard, Spatial navigation bridge. Use server formation snapshot only.

## Phase F4 — Stadium Builder
Implement guided STYLE -> BOWL -> ROOF -> STAND -> SEAT -> FACADE/LIGHT -> ENVIRONMENT. Preserve draft on version conflict. Do not expose prohibited real-stadium assets.

## Phase F5 — Training / Match Field UX
Coach Session and Referee Match Center with durable offline event log and sync/batch recovery. Keep future device panels absent.

## Phase F6 — Manager Workspaces
Coach, Team Manager, Club Director, Referee, Agent, Analyst route shells only from verified grants. Deep links use same guards.

## Phase F7 — Football Life
Career Passport, Opportunity, Communication, Safeguarding projections. Minor direct contact must follow server gate and mediated route.

## Phase F8 — Hardening
Accessibility, dynamic type, reduce motion, responsive, error registry coverage, visual golden tests, performance, analytics privacy, release evidence.

## Completion evidence required per phase
- changed files
- routes/screens implemented
- API operationIds bound
- automated tests and results
- screenshots/golden diff when visual
- performance numbers where applicable
- known gaps / deferred items
- explicit proof future hard-disabled features are absent

## Stop conditions
Stop and report instead of guessing when:
- legacy community behavior is unknown,
- repository stack conflicts with a proposed scaffold,
- OpenAPI lacks required operation,
- role/consent/safeguarding capability is ambiguous,
- 3D asset licensing/source is unclear,
- an implementation would require synthetic EPTS/AI data.
