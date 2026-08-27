# V1 to V2 Risk Register

Scale: severity and likelihood are `HIGH`, `MEDIUM`, or `LOW`. Gate status is based on this audit, not a production test.

| ID | Risk | Severity | Likelihood | Evidence | Required control | Gate |
|---|---|---|---|---|---|---|
| R-01 | Unknown current production schema and migration state | HIGH | HIGH | no live inventory/ledger | read-only inventory, checksums, backup, isolated restore | OPEN |
| R-02 | Runtime DDL makes request order alter schema | HIGH | HIGH | 58 API files, 126 matches | canonical additive migrations and fail-closed readiness checks | OPEN |
| R-03 | Incomplete base schema cannot reproduce core DB | HIGH | HIGH | core tables absent from complete migration baseline | production snapshot and clean restore rehearsal | OPEN |
| R-04 | Role names are confused with authority | HIGH | HIGH | account type/title/groups/team roles overlap | one scoped server policy and authenticated matrix | OPEN |
| R-05 | Cross-team or cross-tenant object access | HIGH | MEDIUM | several policies duplicated or unclear | player/guardian/staff/outsider and tenant deny tests | OPEN |
| R-06 | Public internal identifiers or sensitive fields | HIGH | MEDIUM | prior public field smoke found internal IDs | explicit response allowlists and old-client compatibility | OPEN |
| R-07 | JWT/session properties and revocation are unknown | HIGH | MEDIUM | server-only config absent | capture auth contract, rotate keys, revoke/deny tests | OPEN |
| R-08 | localStorage token exposure through XSS | HIGH | MEDIUM | token stored in localStorage; HTML rendering exists | sanitization/CSP review and approved V2 session design | OPEN |
| R-09 | Stored Community/news HTML is unsafe | HIGH | MEDIUM | `dangerouslySetInnerHTML`; complete historical sanitization unproven | sanitizer contract, fixtures, CSP, historical scan | OPEN |
| R-10 | Community feature loss during redesign | HIGH | HIGH | no V2 implementation/parity suite | parity fixtures and V1 write ownership through dual verify | OPEN |
| R-11 | Missing moderation, report, block, mute, visibility model | HIGH | HIGH | absent in audited Community paths | separately approved additive moderation design | OPEN |
| R-12 | Pagination/order/count drift | MEDIUM | HIGH | backend page/offset; UI first page only | concurrency-aware parity fixtures and reconciliation | OPEN |
| R-13 | Media files orphaned or lost outside DB backup | HIGH | MEDIUM | web-root `/files/` storage | hash manifest, DB/path reconciliation, binary restore rehearsal | OPEN |
| R-14 | Public minor/player media lacks explicit privacy lifecycle | HIGH | MEDIUM | direct public paths and incomplete retention policy | consent, classification, expiry/delete/legal-hold policy | OPEN |
| R-15 | Provider/API outage, cost, quota, or rights changes | MEDIUM | MEDIUM | multiple external providers, live use unmeasured | dependency inventory, rights/cost review, disable/fallback path | OPEN |
| R-16 | AI/sample behavior is presented as real analysis | HIGH | MEDIUM | AI prototypes and adjacent Community preview | hard-disable EPTS/CAMERA_AI/SPORTS_AI and remove UI exposure | CONTROL DEFINED |
| R-17 | PWA/service-worker rollout breaks old clients | HIGH | MEDIUM | live Capacitor shell loads `/app/` | old/new client overlap tests and atomic artifact rollback | OPEN |
| R-18 | API file rollback is mistaken for DB rollback | HIGH | MEDIUM | deploy script restores files only | pair every DB change with ledger/backup/restore/data plan | OPEN |
| R-19 | V1 dirty user work is overwritten | HIGH | MEDIUM | 1 tracked modification, 8 untracked entries | V1 read-only, no reset/clean/install/build | CONTROL ACTIVE |
| R-20 | Whole legacy UI/code is copied into V2 | HIGH | MEDIUM | large mixed source/staging/artifact tree | selective matrix and V2-only ownership | CONTROL ACTIVE |
| R-21 | Independent TACTICS or Shorts Factory boundaries collapse | HIGH | MEDIUM | separate code/DB/deploy paths | contract-only integration and separate ownership | OPEN |
| R-22 | Framework/runtime is chosen before Cafe24 evidence | MEDIUM | MEDIUM | V2 runtime decision absent | keep neutral scaffold; decide from deployment/security/ops evidence | OPEN |
| R-23 | Secrets leak from sample/server files | HIGH | MEDIUM | ignored live configs and secret-shaped sample fields | copy names only, secret scan, secure store provisioning | OPEN |
| R-24 | Organization/season/guardian mappings are inferred | HIGH | HIGH | canonical target relations absent | aggregate profiles, review IDs, `UNKNOWN/PENDING_REVIEW` states | OPEN |
| R-25 | 3D-only product paths fail on low-end/accessibility devices | HIGH | MEDIUM | V2 visual requirement | 2D/static functional equivalence and real-device QA | OPEN |

## Immediate blockers

R-01 through R-10, R-13, R-17, R-18, R-21, R-23, and R-24 block production implementation or cutover. R-19 and R-20 are currently controlled by the read-only/source-boundary policy but must be rechecked every work session.

## Review cadence

Update this register after production inventory, auth/permission fixtures, Community contract capture, media manifest, architecture decision, shadow-read pilot, and each cutover gate. A risk closes only with linked evidence, not a planned control.
