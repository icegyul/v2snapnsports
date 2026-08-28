# 04. ENGINE RECONCILIATION — KO

## 1. Accounting

- ENGINES ACCOUNTED: **40/40**
- `IMPLEMENTED`: **0**
- `PARTIAL`: **18**
- `READY_FOR_PACK`: **14**
- `HARD_DISABLED`: **3 (E22/E23/E24)**
- `RESERVED`: **1 (E38)**
- `NOT_REQUIRED_YET`: **4**

`IMPLEMENTED=0` means “no engine has complete canonical responsibility + backend + persistence + permission/safety + tests proven on the inspected current branch.” It does **not** mean F0 work is absent. F0 UI/adapters are recorded as `PARTIAL`.

## 2. Status rules

- `IMPLEMENTED`: canonical responsibility is end-to-end implemented and tested.
- `PARTIAL`: meaningful code exists, but the canonical engine is incomplete.
- `READY_FOR_PACK`: reconciliation/contract is complete and sequential apply can implement it.
- `HARD_DISABLED`: no UI/API/background activation allowed.
- `RESERVED`: semantics/code must not be invented.
- `NOT_REQUIRED_YET`: valid catalog engine, outside current sequential apply.

## 3. Engine matrix

| ID | Engine | Status | Code Location | PACK | Dependency | API | DB | Frontend | Backend | Tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E01 | Identity & Primary Experience Engine | PARTIAL | apps/web/src/app/AppShell.tsx; backend/src/modules/identity (skeleton) | SHARED/F0 | E03,E07 | /v2/signup, /v2/me | core.users,user_profiles | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E02 | Manager Role Experience Engine | PARTIAL | apps/web/src/routes + stores; backend/src/modules/role (skeleton) | SHARED/F0 | E03,E26 | /v2/me/role-preferences, /v2/manager/switch-role | core.role_preferences,role_grants | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E03 | Authorization & Data Scope Engine | PARTIAL | apps/web route/capability contracts; backend role/security module target | SHARED/F0 | E04,E05,E40 | all protected operations | core.role_grants + memberships/consents | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E04 | Guardian & Consent Engine | PARTIAL | backend/src/modules/guardian (skeleton); shared permission contracts | SHARED/F0 | E03,E40 | /v2/guardian-invites*, /v2/consents* | core.guardian_links,consent_records | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E05 | Organization / Team / Season Engine | PARTIAL | backend/src/modules/organization (skeleton); team adapters | SHARED/F0 | E03 | /v2/teams*, /v2/events | core.organizations,teams,seasons,memberships | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E06 | Legacy Adapter & Migration Engine | PARTIAL | apps/web/src/adapters/legacyAdapters.ts; ProductionLegacyAdapter disabled | SHARED/F0 | E03,E25,E29 | adapter/internal | legacy adapter evidence + ops.migration_checkpoints | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E07 | Feature Flag & Release Control Engine | PARTIAL | apps/web API/capability contracts; platform feature-flag adapter target | SHARED/F0 | E03,E25 | /v2/features, /v2/admin/feature-flags/{flag_key} | platform.feature_flags,feature_flag_rules | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E08 | My Football World / Stadium Experience Engine | PARTIAL | apps/web/src/features/stadium/* | SHARED/F0 | E09,E10,E12,E34 | /v2/stadium/* | world.* + stadium recipe data | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E09 | Formation & Position Engine | PARTIAL | apps/web/src/features/formation/formation.ts (fixture-only 4-3-3 slice) | SHARED/F0 | E05 | /v2/teams/{team_id}/squad, match lineup | world.formation_snapshots, football.match_lineups | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E10 | Home State & Primary Action Engine | PARTIAL | apps/web/src/features/home/homeState.ts | SHARED/F0 | E13,E19 | /v2/events + home projection | schedule/events + projection state | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E11 | Stadium Style Composition Engine | PARTIAL | apps/web/src/features/stadium/*; composition target | SHARED/F0 | E34 | /v2/stadium/recipe | world/stadium recipe storage | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E12 | Spatial Navigation Engine | PARTIAL | apps/web/src/routes + three runtime bridge | SHARED/F0 | E03,E07 | internal route registry | application state only | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E13 | Training / Schedule / Attendance Engine | READY_FOR_PACK | PACK01 target: backend training/schedule module + player/coach UI | PACK 01 | E03,E04,E05,E19,E29,E35,E40 | /v2/events, /v2/training-sessions*, /v2/training-plans* | football.schedule_events,training_*,attendance | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E14 | Tactical Board Engine | READY_FOR_PACK | PACK01 target: tactics module + 2D/3D playback projection | PACK 01 | E03,E09,E34 | /v2/tactics* | football.tactics,tactic_versions,formation_snapshots | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E15 | Community Compatibility Engine | PARTIAL | apps/web/src/features/community/communityModel.ts + legacy parity adapter | SHARED/COMMUNITY | E03,E16,E17 | /v2/community/* | community.* | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E16 | Community Safety & Moderation Engine | READY_FOR_PACK | PACK04 target: community safety/moderation shared policy | PACK 04 | E03,E04,E25,E40 | /v2/community/reports + moderation shared port | community.reports,blocks + audit | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E17 | Media & Video Engine | READY_FOR_PACK | shared media module target; existing media physical contract | SHARED/MEDIA | E03,E04,E30,E40 | /v2/media/*, /v2/videos/* | media.assets,asset_links,share_grants | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E18 | Growth / Football Career Engine | READY_FOR_PACK | PACK02 target: career projection | PACK 02 | E03,E17,E36 | /v2/athletes/{id}/career* | football.career_events + media links | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E19 | Notification Engine | READY_FOR_PACK | shared notification module target | SHARED/NOTIFICATION | E03,E29 | /v2/notifications* | platform.notification_threads,notifications,outbox_events | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E20 | Subscription / Entitlement Engine | NOT_REQUIRED_YET | PACK03 Club Director entitlement seam; not in current apply scope | PACK 03 | E03,E07 | internal entitlement/subscription seam | entitlement storage not physicalized in this reconciliation | NOT_REQUIRED_YET | NOT_REQUIRED_YET | cross-pack permission/integration + owner pack tests |
| E21 | Stadium Audio Recipe Engine | NOT_REQUIRED_YET | No current code owner; not required yet | RESERVED-FUTURE | E11 | none | none | NOT_REQUIRED_YET | NOT_REQUIRED_YET | cross-pack permission/integration + owner pack tests |
| E22 | EPTS Integration Engine | HARD_DISABLED | Disabled adapter only; no runtime integration allowed | HARD_DISABLED | HARD GATE E07 | none | none | HARD_DISABLED | HARD_DISABLED | cross-pack permission/integration + owner pack tests |
| E23 | Camera / Vision Integration Engine | HARD_DISABLED | Disabled adapter only; no runtime integration allowed | HARD_DISABLED | HARD GATE E07 | none | none | HARD_DISABLED | HARD_DISABLED | cross-pack permission/integration + owner pack tests |
| E24 | Evidence Sports AI Engine | HARD_DISABLED | Disabled adapter only; no runtime integration allowed | HARD_DISABLED | HARD GATE E07 + evidence gate | none | none | HARD_DISABLED | HARD_DISABLED | cross-pack permission/integration + owner pack tests |
| E25 | Audit / Observability Engine | PARTIAL | audit/observability shared service target + core.audit_events | SHARED/OPS | all mutation domains | audit read model/internal | core.audit_events + platform.outbox_events | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E26 | Role Verification & Credential Engine | PARTIAL | role verification/grant shared service target | SHARED/ROLE + PACK 04 | E03,E05,E25 | /v2/role-verifications*, manager role grants | core.role_verifications,role_grants | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E27 | Match & Competition Engine | READY_FOR_PACK | PACK01 match/competition module target | PACK 01 | E03,E05,E19,E29,E40 | /v2/competitions, /v2/matches* | football.competitions,matches,match_* | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E28 | Agent Portfolio & Opportunity Engine | READY_FOR_PACK | PACK02 portfolio/opportunity module target | PACK 02 | E03,E04,E17,E37,E40 | /v2/opportunities*, /v2/athletes/{id}/portfolio* | football.opportunities,opportunity_actions + portfolio_share_grants draft | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E29 | Offline Sync & Conflict Resolution Engine | PARTIAL | offline journal/sync target; physical sync contract exists | SHARED/OFFLINE + PACK 01 | E03,E25 | /v2/sync/batch | platform.sync_clients,sync_events,outbox_events | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E30 | Data Lifecycle & Privacy Operations Engine | READY_FOR_PACK | PACK04 privacy operations target | PACK 04 | E03,E04,E17,E25 | /v2/privacy*, /v2/consents* | platform.privacy_requests,privacy_request_items + consent_records | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E31 | Product Analytics & Retention Measurement Engine | NOT_REQUIRED_YET | analytics target; not required for Packs01-04 apply | SHARED/ANALYTICS | E07,E25 | analytics ingest/internal | platform.analytics_events | NOT_REQUIRED_YET | NOT_REQUIRED_YET | cross-pack permission/integration + owner pack tests |
| E32 | Permission-aware Search & Discovery Engine | READY_FOR_PACK | permission-aware search target; physical /v2/search exists | SHARED/SEARCH | E03,E30,E40 | /v2/search | search index adapter; source ACL remains canonical | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E33 | Community Feed Intelligence Engine | NOT_REQUIRED_YET | Community feed intelligence OFF; no active runtime owner | SHARED/COMMUNITY (OFF) | E15,E16,E31 (OFF) | /v2/community/feed (ranker OFF) | no new physical table in v2.0 OFF state | NOT_REQUIRED_YET | NOT_REQUIRED_YET | cross-pack permission/integration + owner pack tests |
| E34 | 3D Asset Delivery & Cache Engine | PARTIAL | apps/web stadium/asset runtime partial | SHARED/F0 ASSET | E07,E08 | asset manifest/internal | asset cache metadata/application cache | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E35 | Earthus Context Adapter Engine | PARTIAL | apps/web/src/adapters/EarthusContextAdapter.ts + backend earthus adapter target | SHARED/EARTHUS | soft-only; no hard dependency | Earthus context adapter/internal | platform.earthus_context_cache | PARTIAL F0 UI | Backend module skeleton/contract only | cross-pack permission/integration + owner pack tests |
| E36 | Football Career Passport Engine | READY_FOR_PACK | PACK02 Career Passport owner target | PACK 02 | E18,E17 | /v2/athletes/{id}/career* | football.career_events | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E37 | Scouting Consent & Opportunity Engine | READY_FOR_PACK | PACK02 scouting/opportunity owner target | PACK 02 | E04,E28,E40 | /v2/scouting/preferences, /v2/opportunities* | core.consent_records + opportunities | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E38 | RESERVED — Tournament & League Extension Engine | RESERVED | RESERVED — no code | RESERVED | none | none | none | RESERVED | RESERVED | cross-pack permission/integration + owner pack tests |
| E39 | Team Communication Engine | READY_FOR_PACK | PACK02 Team Communication owner target | PACK 02 | E03,E04,E19,E40 | /v2/communication/* | football.communication_* + last_read draft | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |
| E40 | Safeguarding & Trust Engine | READY_FOR_PACK | shared safeguarding hard-gate target | SHARED/SAFETY + PACK 04 | E03,E04,E16,E25 | /v2/safety/* + all sensitive gates | football.safeguarding_incidents + community.blocks + audit | PACK target / no current complete surface | PACK implementation pending | cross-pack permission/integration + owner pack tests |

## 4. Hard gates

- E22 EPTS: **HARD_DISABLED**
- E23 Camera/Vision: **HARD_DISABLED**
- E24 Evidence Sports AI: **HARD_DISABLED**
- E38: **RESERVED**
- E33 Community Feed Intelligence: `NOT_REQUIRED_YET`, release default OFF.
- E35 Earthus: soft dependency; stale/unavailable must not fail Schedule/Training/Match.
