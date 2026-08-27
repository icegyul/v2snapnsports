# Legacy Role and Permission Map

## Role vocabularies currently in code

V1 has several overlapping role systems. They must not be collapsed by name during migration.

| Layer | Observed values | Authority level |
|---|---|---|
| App view mode | `admin`, `player`, `manager` | presentation only |
| Account type/title | player/manager plus self-selected job titles | presentation and onboarding hints only |
| Global groups | examples include `관리그룹`, `개발자`, and job-oriented groups | used by selected server endpoints |
| Member admin flag | `sn_members.is_admin` | server administrator signal |
| Team membership | `owner`, `coach`, `manager`, `player`, `guardian` | primary team-scoped server authority |
| Guardian link | pending/approved/rejected-style relationship state | player-scoped relationship authority |
| Minor consent | locked/consented-style state | account access constraint |

`account_type`, UI title, local view mode, and hidden routes are not authorization proof.

## Server permission helpers

| Helper family | Observed responsibility |
|---|---|
| `perm.php` | global group lookup, administrator check, allowed-group requirement |
| `clubperm.php` | fail-closed schema checks, team role lookup, team member/staff checks, manager resolution, match participant/staff checks, object-member checks |
| endpoint-local helpers | admin checks, guardian checks, staff checks, and resource rules duplicated by several endpoints |

Useful current patterns include team membership as the source of staff authority, match participant-team helpers, default-deny behavior when membership schema is missing, and selected player-detail checks for owner/guardian/team staff/admin.

## UI exposure map

- Administrator view exposes management, members, teams/centers, documents, manuals, updates, mail, Shorts Factory, and tactics entries.
- Manager view exposes team/coach/training/match operational paths according to title and server-resolved role state.
- Player view exposes home, player records, training, Community, and related personal flows.
- `App.jsx` calculates allowed slugs and navigation. This is convenience logic only.
- `StaffOnly.jsx` protects selected tools in the client, but the API must enforce the same restriction independently.

## Confirmed server-managed areas

- Admin members: list/search/detail and deny/allow controls.
- Admin teams: overall team/center management.
- Admin statistics and assistant: administrator-group checks.
- Mail: administrator-only.
- Development-request status changes: administrator-only.
- Team logo/profile, roster, staff assignment, match operations, and player records: varying team-scoped helper checks.

## Inconsistencies and gaps

1. Global groups, admin flags, self-selected titles, account type, and team roles use different vocabularies.
2. Some endpoints duplicate admin/staff logic instead of using one policy engine.
3. Approved guardians may also be inserted into `sn_club_members` as `guardian`, mixing relationship and team membership semantics.
4. Current code does not provide a canonical Organization/Season scoped role-assignment model.
5. Public player/team responses have previously exposed internal member identifiers; current live state was not rechecked.
6. Match-plan reads and match QR participant enforcement need authenticated object-level tests.
7. UI hiding does not prove API denial, and unauthenticated 401 does not prove cross-team denial.
8. Role expiry, revocation, multi-role precedence, tenant boundary, and audit logging are not uniformly implemented.

## V2 target permission contract

The repository contains a planned Player–Guardian–Team matrix, but its target entities and rules are not evidence of a deployed implementation. V2 should model:

- multi-role subjects;
- organization, team, and athlete scopes;
- validity and revocation windows;
- typed guardian relationships;
- versioned, scoped consent with evidence and revocation;
- default deny and server-side final decision;
- cross-team and cross-organization denial;
- audit records for allowed sensitive actions and every policy denial required by policy.

## Cutover gate

Before any endpoint becomes a V2 write owner, run an authenticated matrix for anonymous, unrelated player, owner player, primary guardian, co-guardian, emergency contact, coach, manager/recorder, organization admin, system admin, same role in another tenant, and expired/revoked relationships. The matrix must cover read/create/update/delete/export/share where applicable.
