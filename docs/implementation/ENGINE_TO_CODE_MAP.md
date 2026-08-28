# Engine to Code Map

Source: `docs/canonical/engines/v1.3/SNAPN_SPORTS_V2_ENGINE_CATALOG_v1.3.md` and active v1.4–v1.7 locks. Status means this V2 foundation branch only; it is not a production claim.

| ID | Engine | Backend module | Frontend feature | API/DB/Event | Tests | Status |
|---|---|---|---|---|---|---|
| E01 | Identity & Primary Experience | `backend/src/modules/identity` | `features/auth` | `/v2/me` seam | fixture identity | PARTIAL |
| E02 | Manager Role Experience | `role` | `features/role` | role preference DTO | role visibility | PARTIAL |
| E03 | Authorization & Data Scope | `role`, `organization` | route guard | AuthorizationDecision | escalation/cross-team | PARTIAL |
| E04 | Guardian & Consent | `guardian`, `privacy` | guardian state | GuardianRelationship | guardian isolation | PARTIAL |
| E05 | Organization/Team/Season | `organization`, `team` | team projection | TenantScope/TeamScope | scope contract | PARTIAL |
| E06 | Legacy Adapter & Migration | `backend/src/modules/legacy` | `adapters` | disabled production seam | fixture adapter | PARTIAL |
| E07 | Feature Flag & Release Control | `feature_flags` | `lib/featureFlags` | FeatureFlagSet | hard-disable test | IMPLEMENTED |
| E08 | My Football World | `stadium` | `features/stadium/PlayerStadiumPages.tsx` | fixture stadium projection | player flow/static tests | IMPLEMENTED (FIXTURE_LOCAL) |
| E09 | Formation & Position | `team`, `player` | `features/stadium/PlayerStadiumPages.tsx` | privacy-safe fixture formation | formation/position tests | IMPLEMENTED (FIXTURE_LOCAL) |
| E10 | Home State & Primary Action | `schedule` | `features/home` | HomeState | priority state | PARTIAL |
| E11 | Stadium Style Composition | `stadium` | `three` | recipe contract only | no final renderer | PARTIAL |
| E12 | Spatial Navigation | `stadium` | `routes`, `features/stadium` | route descriptor | player-flow tests | IMPLEMENTED (FIXTURE_LOCAL) |
| E13 | Training/Schedule/Attendance | `training`, `schedule` | `packages/pack01/domain.ts`, `features/pack01/Pack01Pages.tsx` | local session/plan/participation/attendance | pack01 domain/lifecycle/browser tests | IMPLEMENTED (LOCAL_DEV) |
| E14 | Tactical Board | `tactics` | `packages/pack01/domain.ts`, `features/pack01/Pack01Pages.tsx` | local tactic versions/static playback | pack01 domain/lifecycle/browser tests | IMPLEMENTED (LOCAL_DEV) |
| E15 | Community Compatibility | `community` | `features/community/communityModel.ts` | fixture-local Legacy-order seam | community safety tests | IMPLEMENTED (FIXTURE_LOCAL) |
| E16 | Community Safety | `safeguarding`, `community` | `features/community/communityModel.ts` | sanitize/hide/block seam | community safety tests | IMPLEMENTED (FIXTURE_LOCAL) |
| E17 | Media & Video | `media` | `features/product/RemainingProductPages.tsx` | unavailable fixture media projection | product-page tests | IMPLEMENTED (FIXTURE_LOCAL) |
| E18 | Growth / Career | `career` | `features/product/RemainingProductPages.tsx` | provenance-backed fixture event | product-page tests | IMPLEMENTED (FIXTURE_LOCAL) |
| E19 | Notification | `notification` | app state seam | Notification DTO | not implemented | NOT_IMPLEMENTED |
| E20 | Subscription/Entitlement | `feature_flags` | none | feature evaluation seam | hard-disabled coverage | RESERVED |
| E21 | Stadium Audio | `stadium` | none | capability descriptor | no render | RESERVED |
| E22 | EPTS | none | none | hard false | hard-disable test | HARD_DISABLED |
| E23 | Camera/Vision | none | none | hard false | hard-disable test | HARD_DISABLED |
| E24 | Evidence Sports AI | none | none | hard false | hard-disable test | HARD_DISABLED |
| E25 | Audit/Observability | `backend/src/shared/audit/index.ts` | local PACK 01 mutation seam | safe audit event | pack01 gap-closure tests | IMPLEMENTED (LOCAL_DEV) |
| E26 | Role Verification | `role` | role state | VerifiedRoleGrant | preference deny | PARTIAL |
| E27 | Match & Competition | `match` | `packages/pack01/domain.ts`, `features/pack01/Pack01Pages.tsx` | local match/roster/lineup/events/report seam | pack01 domain/lifecycle/browser tests | IMPLEMENTED (LOCAL_DEV) |
| E28 | Agent Portfolio | `scouting`, `career` | none | ScoutingConsent | denied default | PARTIAL |
| E29 | Offline Sync | `sync` | fixture-local draft seam | local draft state | community model tests | IMPLEMENTED (FIXTURE_LOCAL) |
| E30 | Data Lifecycle/Privacy | `privacy` | no UI surface | Consent state | revoked deny | PARTIAL |
| E31 | Product Analytics | `analytics` | none | event seam only | not activated | NOT_IMPLEMENTED |
| E32 | Permission-aware Search | `search` | none | AuthorizationDecision | cross-team deny | PARTIAL |
| E33 | Community Feed Intelligence | none | none | hard false | not rendered | HARD_DISABLED |
| E34 | 3D Asset Delivery/Cache | `stadium` | `three/stadiumScene.ts` | asset state | FULL/FAST/LIGHT/STATIC tests | IMPLEMENTED (SCAFFOLD_ONLY) |
| E35 | Earthus Context Adapter | `earthus` | schedule context | no-op adapter | soft failure | PARTIAL |
| E36 | Career Passport | `career` | My Player boundary | CareerPassport DTO | sourced-only fixture | PARTIAL |
| E37 | Scouting Consent | `scouting`, `guardian` | none | consent eligibility | guardian/agent deny | PARTIAL |
| E38 | Tournament/League Extension | none | none | none | none | RESERVED |
| E39 | Team Communication | `communication` | none | safeguarded boundary | not activated | PARTIAL |
| E40 | Safeguarding & Trust | `safeguarding` | forbidden state | policy decision | minor contact deny | PARTIAL |

`IMPLEMENTED` in F0 means a reusable foundation exists locally. It never means data ownership, production integration, or release clearance.
