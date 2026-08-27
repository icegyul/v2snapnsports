# Legacy Database Map

## Status

- Repository schema evidence: available
- Current production DB connection: not performed
- Current production schema, engine, indexes, constraints, row counts: `PRODUCTION_UNVERIFIED`
- Applied migration ledger: not available
- Backup and isolated restore rehearsal: not performed

This document never treats a code reference as proof that a table exists in production.

## Schema families

| Prefix | Repository-observed purpose | V2 rule |
|---|---|---|
| `sn_*` | SnapN transactional and operational data | inventory, preserve IDs, map ownership before migration |
| `rx_*` | selected Rhymix/CMS legacy data | retain until every dependency is proven removed |
| `sf_*` | Shorts Factory subsystem | keep outside main V2 migration unless separately scoped |

## Current migration evidence

| Item | Result |
|---|---|
| Local SQL migration files | 29 |
| Complete canonical base schema | not found |
| Current production application evidence | not found |
| Down/rollback SQL set | not found |
| Main-app FK declarations in current migrations | not found |
| API files with runtime DDL terms | 58 |
| Runtime DDL term matches | 126 |

The file `2026-08-05_ax_permission_scope.sql` exists locally. Earlier documentation classified its application as handoff-reported; this audit did not verify production application or checksum history.

## Explicit table-reference candidates

The sanitized local inventory extracted these names from SQL contexts. They are `CODE_REFERENCE_ONLY`:

```text
sn_account_type
sn_ad_orders
sn_ai_previews
sn_bookings
sn_changelog
sn_club_members
sn_club_profile
sn_club_talk
sn_coach_notes
sn_comments
sn_community_likes
sn_condition_logs
sn_course_runs
sn_curricula
sn_dev_comments
sn_dev_requests
sn_goal_claims
sn_group_members
sn_group_sessions
sn_guardians
sn_kakao_link_states
sn_kakao_tokens
sn_kv
sn_league_players
sn_league_teams
sn_leagues
sn_mail_accounts
sn_match_ai
sn_match_applies
sn_match_checkins
sn_match_event_operations
sn_match_events
sn_match_plans
sn_match_posts
sn_match_predictions
sn_matches
sn_members
sn_merc_applies
sn_merc_posts
sn_minor_consent
sn_modules
sn_mom_votes
sn_notifications
sn_oauth_states
sn_org_features
sn_password_reset
sn_perm_group_members
sn_perm_groups
sn_play_testers
sn_player_profile
sn_player_qr
sn_player_ratings
sn_player_stats
sn_players
sn_posts
sn_program_feedback
sn_qr_tokens
sn_recruit_applies
sn_recruit_posts
sn_referee_profile
sn_reward_claims
sn_scout_offers
sn_self_training
sn_sequence
sn_settlement_members
sn_settlements
sn_skill_goals
sn_skill_records
sn_social_accounts
sn_student_profile
sn_tactics_ai
sn_tactics_sessions
sn_tactics_sso_codes
sn_team_goals
sn_team_invites
sn_team_notices
sn_teams
sn_training_attendance
sn_training_categories
sn_training_sessions
sn_user_consents
sn_venues
sn_wearable_daily
sn_wearable_keys
```

Dynamic names, server-only code, and tables absent from the checkout may not be captured.

## Code-joined relationships

These relationships are observed in queries and helpers. They are not asserted as declared foreign keys:

| From | To | Observed meaning |
|---|---|---|
| `sn_players.member_srl` | `sn_members.member_srl` | member to player identity |
| `sn_players.team_id` | `sn_teams.team_id` | current player team |
| `sn_club_members.member_srl` | `sn_members.member_srl` | team membership subject |
| `sn_club_members.team_id` | `sn_teams.team_id` | team-scoped role |
| `sn_guardians.guardian_srl` | `sn_members.member_srl` | guardian account |
| `sn_guardians.player_id` | `sn_players.player_id` | guardian-athlete link |
| `sn_matches.home_team_id/away_team_id` | `sn_teams.team_id` | match participants |
| `sn_match_events.match_id` | `sn_matches.match_id` | event membership |
| `sn_match_events.player_id` | `sn_players.player_id` | event athlete |
| `sn_training_sessions.team_id` | `sn_teams.team_id` | scheduled team training |
| `sn_training_attendance.session_id/player_id` | session/player candidates | attendance relation |
| `sn_notifications.member_srl` | member identity | notification recipient |

Current helpers also derive guardian approval into a `guardian` team-membership role. This coupling needs explicit policy before V2 migration.

## High-drift schema areas

- `sn_account_type`: historical and runtime shapes differ around `title`.
- `sn_club_profile`: base and runtime-altered shapes coexist.
- `sn_training_sessions`: migration and runtime assumptions differ.
- `sn_self_training` and `sn_coach_notes`: later code assumes fields not reproduced by one base definition.
- Program feedback, skills, settlement, match plan, and check-in include request-time schema creation or alteration.
- Core tables such as member, team, player, match, event, and stats lack a complete rebuildable baseline in the migration directory.

## Required production inventory before any V2 data work

1. Exact MariaDB server/database label and version.
2. Ordered `sn_*` table list and `SHOW CREATE TABLE` for every table.
3. Engine, charset, collation, columns, indexes, constraints, triggers, views, routines, and events.
4. Exact counts and aggregate-only null/duplicate/orphan profiles.
5. Current migration evidence with approved checksums.
6. Encrypted backup and isolated restore rehearsal.
7. Member-player-team, guardian, match provenance, attendance, and role-scope validation.

## Migration stance

Preserve existing member/player/team identifiers. Use additive expand, evidence-backed backfill, shadow read, limited dual write, dual verification, feature-controlled read switch, and a separate contract/removal phase. Unknown relationships remain `UNKNOWN` or `PENDING_REVIEW`; they are never inferred from names or UI labels.
