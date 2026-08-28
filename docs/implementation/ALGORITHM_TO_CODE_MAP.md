# Algorithm to Code Map

Source: `docs/canonical/algorithms/v1.3/SNAPN_SPORTS_V2_ALGORITHM_CATALOG_v1.3.md`.

| ID | Algorithm | F0 code target | Status |
|---|---|---|---|
| A01 | Public Signup Routing | `routes/routePolicy.ts` | PARTIAL |
| A02 | Manager Role Resolution | `lib/authorization.ts` | PARTIAL |
| A03 | Authorization/Data Scope Decision | `lib/authorization.ts` | PARTIAL |
| A04 | Guardian Invite & Consent Binding | `lib/authorization.ts` | PARTIAL |
| A05 | Formation Slot Mapping | `features/stadium/PlayerStadiumPages.tsx` | IMPLEMENTED (FIXTURE_LOCAL) |
| A06 | My Player Visual Priority | `features/stadium/PlayerStadiumPages.tsx` | IMPLEMENTED (FIXTURE_LOCAL) |
| A07 | Stadium Entry Mode Selection | `three/renderMode.ts`, `three/stadiumScene.ts` | IMPLEMENTED (SCAFFOLD_ONLY) |
| A08 | Home State Priority | `features/home/homeState.ts` | PARTIAL |
| A09 | Spatial Object Routing | `routes/coreRoutePolicy.ts`, `features/stadium/PlayerStadiumPages.tsx` | IMPLEMENTED (FIXTURE_LOCAL) |
| A10 | Stadium Recipe TotalScore | composition contract seam | RESERVED |
| A11 | Structural Compatibility Gate | composition contract seam | RESERVED |
| A12 | Stadium Auto Generate | none | NOT_IMPLEMENTED |
| A13 | Surprise Me Preference | none | NOT_IMPLEMENTED |
| A14 | Adaptive 3D Performance Budget | `three/renderMode.ts`, `features/core/coreUiState.ts` | IMPLEMENTED (SCAFFOLD_ONLY) |
| A15 | Tactical 2D→3D Playback | `packages/pack01/domain.ts`, `features/pack01/Pack01Pages.tsx` | IMPLEMENTED (LOCAL_DEV STATIC) |
| A16 | Training Session State Machine | `packages/pack01/domain.ts` | IMPLEMENTED (LOCAL_DEV) |
| A17 | Community Legacy Parity Resolver | `features/community/communityModel.ts` | IMPLEMENTED (FIXTURE_LOCAL) |
| A18 | Community Visibility Decision | `features/community/communityModel.ts` | IMPLEMENTED (FIXTURE_LOCAL) |
| A19 | Growth/Career Timeline Aggregation | `features/product/RemainingProductPages.tsx` | IMPLEMENTED (FIXTURE_LOCAL) |
| A20 | Notification Thread/Dedupe | none | NOT_IMPLEMENTED |
| A21 | Media Access Decision | `features/product/RemainingProductPages.tsx` | IMPLEMENTED (FIXTURE_LOCAL) |
| A22 | Feature Flag Resolution | `lib/featureFlags.ts` | IMPLEMENTED |
| A23 | Legacy Write Ownership/Idempotency | adapter disabled stub | PARTIAL |
| A24 | Stadium Audio Fit | none | RESERVED |
| A25 | EPTS Future Sync Pipeline | none | HARD_DISABLED |
| A26 | Evidence AI Confidence/Abstain | none | HARD_DISABLED |
| A27 | Role Credential Verification | `lib/authorization.ts` | PARTIAL |
| A28 | Match State Machine | `packages/pack01/domain.ts` | IMPLEMENTED (LOCAL_DEV) |
| A29 | Match Event Integrity/Ordering | `packages/pack01/domain.ts` | IMPLEMENTED (LOCAL_DEV) |
| A30 | Offline Sync/Conflict Resolution | `packages/pack01/domain.ts` | IMPLEMENTED (LOCAL_DEV) |
| A31 | Consent Revocation/Lifecycle Cascade | `lib/authorization.ts` | PARTIAL |
| A32 | Product Analytics Attribution | none | NOT_IMPLEMENTED |
| A33 | Permission-aware Search Filtering | `lib/authorization.ts` | PARTIAL |
| A34 | Community Feed Ranking | none | HARD_DISABLED |
| A35 | 3D Asset Bundle Selection/Cache | `three/renderMode.ts` | PARTIAL |
| A36 | Earthus Context Fetch/Fallback | `adapters/EarthusContextAdapter.ts` | PARTIAL |
| A37 | Earthus Context Projection | `api/contracts.ts` | PARTIAL |
| A38 | Career Passport Event Normalization | `api/contracts.ts` | PARTIAL |
| A39 | Career Chapter/Milestone Assembly | career fixture types | PARTIAL |
| A40 | Scouting Visibility/Consent Eligibility | `lib/authorization.ts` | PARTIAL |
| A41 | Opportunity Eligibility Matching | none | NOT_IMPLEMENTED |
| A42 | Communication Recipient Resolution | `lib/authorization.ts` | PARTIAL |
| A43 | Communication Delivery/Thread Dedupe | none | NOT_IMPLEMENTED |
| A44 | Safeguarding Interaction Gate | `lib/authorization.ts` | PARTIAL |
| A45 | Safety Incident Triage/Escalation | none | NOT_IMPLEMENTED |

Algorithms marked `RESERVED`, `NOT_IMPLEMENTED`, or `HARD_DISABLED` have no user-visible substitute or fabricated output.
