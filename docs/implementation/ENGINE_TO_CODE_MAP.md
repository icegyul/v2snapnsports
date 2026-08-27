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
| E08 | My Football World | `stadium` | `features/stadium` | StadiumExperienceState | fallback/state-machine | PARTIAL |
| E09 | Formation & Position | `team`, `player` | `features/formation` | FormationSnapshot | slot mapping | PARTIAL |
| E10 | Home State & Primary Action | `schedule` | `features/home` | HomeState | priority state | PARTIAL |
| E11 | Stadium Style Composition | `stadium` | `three` | recipe contract only | no final renderer | PARTIAL |
| E12 | Spatial Navigation | `stadium` | `routes`, `three` | route descriptor | state transition | PARTIAL |
| E13 | Training/Schedule/Attendance | `training`, `schedule` | `features/training` | ScheduleItem | fixture schedule | PARTIAL |
| E14 | Tactical Board | `tactics` | reserved feature boundary | none active | mapping integrity | RESERVED |
| E15 | Community Compatibility | `community` | Community boundary | Legacy write owner | no-write route | PARTIAL |
| E16 | Community Safety | `safeguarding`, `community` | unavailable boundary | policy types | forbidden state | PARTIAL |
| E17 | Media & Video | `media` | `features/video` | disabled media seam | no media migration | NOT_IMPLEMENTED |
| E18 | Growth / Career | `career` | My Player route | CareerEvent DTO | provenance fixture | PARTIAL |
| E19 | Notification | `notification` | app state seam | Notification DTO | not implemented | NOT_IMPLEMENTED |
| E20 | Subscription/Entitlement | `feature_flags` | none | feature evaluation seam | hard-disabled coverage | RESERVED |
| E21 | Stadium Audio | `stadium` | none | capability descriptor | no render | RESERVED |
| E22 | EPTS | none | none | hard false | hard-disable test | HARD_DISABLED |
| E23 | Camera/Vision | none | none | hard false | hard-disable test | HARD_DISABLED |
| E24 | Evidence Sports AI | none | none | hard false | hard-disable test | HARD_DISABLED |
| E25 | Audit/Observability | `backend/src/shared/observability` | error boundary | request-id model | error normalization | PARTIAL |
| E26 | Role Verification | `role` | role state | VerifiedRoleGrant | preference deny | PARTIAL |
| E27 | Match & Competition | `match` | schedule projection | Match DTO | fixture match | PARTIAL |
| E28 | Agent Portfolio | `scouting`, `career` | none | ScoutingConsent | denied default | PARTIAL |
| E29 | Offline Sync | `sync` | offline banner | SyncState | offline/retry | PARTIAL |
| E30 | Data Lifecycle/Privacy | `privacy` | no UI surface | Consent state | revoked deny | PARTIAL |
| E31 | Product Analytics | `analytics` | none | event seam only | not activated | NOT_IMPLEMENTED |
| E32 | Permission-aware Search | `search` | none | AuthorizationDecision | cross-team deny | PARTIAL |
| E33 | Community Feed Intelligence | none | none | hard false | not rendered | HARD_DISABLED |
| E34 | 3D Asset Delivery/Cache | `stadium` | `three` | asset state | FULL/FAST/LIGHT/STATIC | PARTIAL |
| E35 | Earthus Context Adapter | `earthus` | schedule context | no-op adapter | soft failure | PARTIAL |
| E36 | Career Passport | `career` | My Player boundary | CareerPassport DTO | sourced-only fixture | PARTIAL |
| E37 | Scouting Consent | `scouting`, `guardian` | none | consent eligibility | guardian/agent deny | PARTIAL |
| E38 | Tournament/League Extension | none | none | none | none | RESERVED |
| E39 | Team Communication | `communication` | none | safeguarded boundary | not activated | PARTIAL |
| E40 | Safeguarding & Trust | `safeguarding` | forbidden state | policy decision | minor contact deny | PARTIAL |

`IMPLEMENTED` in F0 means a reusable foundation exists locally. It never means data ownership, production integration, or release clearance.
