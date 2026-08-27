# Legacy System Inventory

## Audit boundary

- Snapshot: `2026-08-27T13:35:07Z`
- V1 path: `/Volumes/740GB/웹/스냅엔스포츠cafe24-deploy`
- Branch: `codex/player-spatial-home-slice1`
- HEAD: `2cc39d25fa69a32e883cea63328964991f49c7bd`
- V1 policy: `READ_ONLY`
- Production access during this audit: none

Evidence labels used here:

- `REPOSITORY_CONFIRMED`: observed in the audited local checkout.
- `CODE_REFERENCE_ONLY`: code names a table, route, or behavior; production existence is not proven.
- `HANDOFF_REPORTED`: prior project documentation reports an outcome; this audit did not revalidate it live.
- `PRODUCTION_UNVERIFIED`: requires current server, DB, authenticated, or browser evidence.
- `ABSENT_IN_AUDITED_PATHS`: no implementation was found in the scoped V1 paths; not proof that no external system exists.

## Repository state

| Item | Result |
|---|---|
| Tracked modified entries | 1: `snapn-handoff/snapn-app/src/screens/ManualHub.jsx` |
| Untracked status entries | 8 |
| PHP API files | 105 |
| Migration SQL files | 29 |
| Registered route matches | 63 across the main and custom registries |
| API files containing runtime DDL terms | 58 |
| Runtime DDL term matches | 126 |

The dirty tree is user-owned legacy work. Nothing was reset, formatted, installed, built, copied back, or modified.

## Canonical source boundaries

| Area | Canonical V1 path | Classification |
|---|---|---|
| React authoring frontend | `snapn-handoff/snapn-app` | `REPOSITORY_CONFIRMED` |
| PHP/API deployment staging | `snapn-handoff/cafe24-deploy/api` | `REPOSITORY_CONFIRMED` |
| SQL migration candidates | `snapn-handoff/cafe24-deploy/migrations` | `REPOSITORY_CONFIRMED`, production application unverified |
| App deployment | `snapn-handoff/deploy_app.sh` | `REPOSITORY_CONFIRMED` |
| API deployment | `snapn-handoff/deploy_api.sh` | `REPOSITORY_CONFIRMED` |
| Generated root `app/` and staging `cafe24-deploy/app/` | deployment artifacts, not authoring source | `REPOSITORY_CONFIRMED` |
| Independent TACTICS product | `snapn-tactics` | separate API/DB/deployment boundary; not a V2 app source copy |
| Legacy tactics inside the app | `snapn-app/src/features/tactics-*` | `LEGACY_TACTICS_V1`; do not merge with independent TACTICS by assumption |

## Technology inventory

The authoring app is JavaScript/JSX using React 18, React Router 6, Vite 5, Vite PWA/Workbox, and Capacitor 7. The backend is action-oriented PHP with mysqli and JWT helpers supplied by a server-only configuration. MariaDB and selected Rhymix-derived tables are referenced. npm with `package-lock.json` is the confirmed frontend package manager.

## Authentication and account inventory

- Password login and token validation: `auth.php?action=login|me`.
- Registration: `register.php`, including required agreements, bcrypt hashing, group assignment, birth-date banding, and minor-consent records.
- Social OAuth: Kakao and Naver paths plus common OAuth-state handling.
- Password recovery/reset: `find_password.php` and reset-token references.
- Profile and password change: `profile.php`.
- Client token storage: `localStorage` key `snapn.token`.
- Auth headers: `Authorization: Bearer` plus `X-Auth-Token` compatibility header.
- UI role bootstrap: `onboarding.php`/`useRole.js`/`App.jsx`.
- Server authorization sources: administrator flag/groups plus team-scoped membership helpers.

JWT algorithm, lifetime, rotation, issuer/audience, active-member recheck, and the current server secret are `PRODUCTION_UNVERIFIED` because `api/config.php` is intentionally absent from Git.

## Core data and operations inventory

| Domain | Repository-confirmed capability | Main evidence |
|---|---|---|
| Organization/academy | academy CRM, custom team feature toggles, multi-branch UI | `academy.php`, `org_features.php`, `AcademyPricingTiers.jsx`, `MultiBranchDashboard.jsx` |
| Team/club | create/join/leave, roster, staff roles, invitations, logo/region/location | `club.php`, `clubperm.php`, `roster.php`, `join.php`, `club_logo.php` |
| Player | player profile, public search/detail, stats, ratings, QR, photo, team membership | `players.php`, `my_player.php`, `player_stats.php`, `player_eval.php`, `player_qr.php`, `player_photo.php` |
| Guardian/minor | link request, pending/approve/reject, children/notes, minor consent | `guardian.php`, `minor_consent.php`, `register.php` |
| Manager/coach | team-scoped owner/coach/manager roles and operational workspaces | `clubperm.php`, `CoachDashboard.jsx`, `OpsHub.jsx` |
| Schedule/match | match creation/list/detail, plans, roster, events, score finish, report | `matches.php`, `match_admin.php`, `matchplan.php`, `match_events.php` |
| Training/attendance | sessions, categories, curricula, courses, periodization, QR attendance | `training.php`, `train_cats.php`, `curriculum.php`, `course.php`, `checkin.php` |
| Notification | list/count/read/clear and server notification helper | `notifications.php`, `notify_lib.php` |
| Recruiting/scouting | recruit posts/applications, offers, match/mercenary discovery | `recruit.php`, `scout_offers.php`, `matchfinder.php`, `mercenary.php` |
| Booking/settlement | venues/referee booking and Dutch-pay settlement | `booking.php`, `settlement.php` |
| Wearable | daily summary records and native health connector dependency | `wearable.php`, `WearableConnect.jsx` |

The operational completeness of each domain remains `PRODUCTION_UNVERIFIED`. Code existence does not prove current tables, permissions, data quality, or live end-to-end behavior.

## Community inventory summary

Repository-confirmed Community behavior includes public post list/detail, authenticated post creation, flat comments, likes, shared player-card posts, news, YouTube cards, match highlights, prediction blocks, leaderboard cards, professional match comments, and a logged-in development-request board. Pagination is page/offset based in the backend, but the audited main Community UI currently loads the default first page only.

No Community implementation was found for threaded replies, post/comment delete or hidden states, user report/moderation queues, block, mute, or audience visibility controls. These are `ABSENT_IN_AUDITED_PATHS` and block parity claims. See `LEGACY_COMMUNITY_PARITY_INVENTORY.md`.

## Media inventory summary

- Player photos: local web-root files under `/files/snapn_photos/`.
- Team logos: local web-root files under `/files/snapn_logos/`.
- Shared player cards: PNG files under `/files/snapn_cards/`.
- YouTube: remote thumbnails and links/embeds.
- Highlight trimming UI: visual prototype; no repository-confirmed upload/transcode/export backend.
- Shorts Factory: separate `ss/` subsystem with `sf_*` data and external generation/publishing providers.

There is no repository-confirmed general object storage, CDN upload pipeline, signed URL model, thumbnail worker, or media retention policy for the main app.

## Admin and operations inventory

- Admin dashboard statistics, member management/denial, team/center management.
- Changelog management, manuals/documents, mail client, admin assistant, development-request status handling.
- Team/organization feature toggles.
- Guarded SFTP app/API deployment scripts with locks, backups, byte comparison, smoke checks, atomic rename, and rollback behavior.

Menu visibility is presentation logic. Server endpoints must continue enforcing permissions independently.

## Hard-disabled areas for V2

Although V1 contains wearable and AI prototypes, V2 must keep `EPTS`, `CAMERA_AI`, and `SPORTS_AI` hidden and inactive. Their V1 code and sample outputs are not production evidence and are not migration candidates in this phase.
