# PACKS 01~04 CODE OWNERSHIP MAP

## Rule

Canonical domain truth has one owner. Workspaces and Admin panels may project/query it, but must not create a second state machine.

| Module | Canonical owner | PACK owner/consumer | Backend location | Frontend location | Shared dependency |
| --- | --- | --- | --- | --- | --- |
| identity | SHARED/F0 | SHARED/F0 | backend/src/modules/identity | apps/web/src/app + auth routes | Authorization, Audit |
| role | SHARED/ROLE | PACK03/04 consumer | backend/src/modules/role | manager role shell | Authorization, Verification, Audit |
| guardian | SHARED/GUARDIAN | all | backend/src/modules/guardian | guardian invite/consent surfaces | Authorization, Safeguarding |
| team | SHARED/ORG | PACK01/03 consumer | backend/src/modules/organization/team | team/squad selectors | Authorization |
| schedule | PACK 01 | PACK 01 | backend schedule/training module target | Schedule UI / Coach Ground | Authorization, Earthus, Notification |
| training | PACK 01 | PACK 01 | backend training module target | Player Training + Coach Session/Review | Authorization, Guardian, Offline, Audit, Earthus |
| match | PACK 01 | PACK 01 | backend match module target | Match + Referee Workspace projection | Authorization, Referee assignment, Offline, Audit, Earthus |
| tactics | PACK 01 | PACK 01 | backend tactics module target | Coach Tactics + Analyst read projection | Authorization, Formation, Asset Delivery |
| community | SHARED/COMMUNITY + PACK04 safety | PACK04 moderation projection | backend community/legacy adapter | Community parity UI | Safeguarding, Media, Audit |
| media | SHARED/MEDIA | PACK01/02/03/04 consumer | backend/src/modules/media | Video/portfolio/review surfaces | Authorization, Consent, Safeguarding |
| career | PACK 02 | PACK 02 | backend/src/modules/career target | Career Passport / portfolio source | Authorization, Media, Provenance |
| communication | PACK 02 | PACK 02; PACK03 consumes | backend/src/modules/communication target | Team Communication / TM workspace | Authorization, Safeguarding, Notification |
| scouting | PACK 02 | PACK 02; PACK03 Agent consumes | scouting policy in opportunity/career services | Scouting preferences / Agent projection | Consent, Search, Safeguarding |
| opportunity | PACK 02 | PACK 02; PACK03 Agent consumes | opportunity module target | Opportunity UI / Agent workspace | Authorization, Consent, Safeguarding |
| safeguarding | SHARED/SAFETY | PACK 04 ops owner | shared safety policy + incident service target | generic deny/mediated states; admin restricted projection | Authorization, Guardian, Audit |
| privacy | PACK 04 / SHARED PRIVACY | all consumers | backend/src/modules/privacy target | privacy request/admin projection | Authorization, Consent, Audit, Outbox |
| earthus | SHARED/EARTHUS | PACK01/03/04 consumer | backend/src/modules/earthus target | context badge/health projection | Soft dependency, Cache |
| admin | PACK 04 | PACK 04 | admin projection/application services | Admin/Ops console | Authorization, Audit, Role, Safety, Privacy |

## Write-owner constraints

- `training/match/tactics` → PACK01
- `career/communication/scouting/opportunity` → PACK02
- `workspace projection` → PACK03 only
- `admin/verification/moderation/safeguarding/privacy ops` → PACK04, but shared security services remain single owners
- `community` write owner remains Legacy until parity/cutover gate
- `identity/role/guardian/authorization/audit/feature flags/media/earthus/offline/outbox` → shared services
