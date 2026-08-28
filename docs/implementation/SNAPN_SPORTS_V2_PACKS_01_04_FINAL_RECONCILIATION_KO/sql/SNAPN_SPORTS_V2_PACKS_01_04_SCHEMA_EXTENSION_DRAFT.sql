-- SNAPN SPORTS V2 PACKS 01~04 REAL_SCHEMA_EXTENSION DRAFT
-- DDL DRAFT ONLY. NOT A PRODUCTION MIGRATION.
-- Do not execute on staging/production without current schema diff, backup/restore rehearsal,
-- lock-time review, migration ID allocation, data backfill plan, and explicit approval.
-- Reconciled extensions: 4 candidates. PACK 04 adds no new physical table in this draft.

BEGIN;

-- RSE-001 / PACK01 PSE-001: Captain is lineup business truth.
ALTER TABLE football.match_lineups
  ADD COLUMN IF NOT EXISTS is_captain boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS ux_match_lineups_one_captain_per_team
  ON football.match_lineups (match_id, team_id)
  WHERE is_captain = true;

-- RSE-002 / PACK01 PSE-002: Security-critical exact-match official assignment.
CREATE TABLE IF NOT EXISTS football.match_official_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES football.matches(id) ON DELETE CASCADE,
  official_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  role_grant_id uuid NOT NULL REFERENCES core.role_grants(id) ON DELETE RESTRICT,
  assignment_type text NOT NULL DEFAULT 'REFEREE'
    CHECK (assignment_type IN ('REFEREE','ASSISTANT_REFEREE','FOURTH_OFFICIAL')),
  state text NOT NULL DEFAULT 'ACTIVE'
    CHECK (state IN ('ACTIVE','SUSPENDED','REVOKED','EXPIRED')),
  assigned_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_match_official_active_assignment
  ON football.match_official_assignments (match_id, official_user_id, assignment_type)
  WHERE state = 'ACTIVE';

CREATE INDEX IF NOT EXISTS ix_match_official_assignments_official
  ON football.match_official_assignments (official_user_id, state, match_id);

-- RSE-003 / PACK02 PSE-002: Reuse communication_members; store a per-member high-water mark.
ALTER TABLE football.communication_members
  ADD COLUMN IF NOT EXISTS last_read_message_id uuid
    REFERENCES football.communication_messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_read_at timestamptz;

-- Application/domain rule (must be enforced in service code):
-- 1) last_read_message_id.thread_id == communication_members.thread_id
-- 2) cursor only advances to a message visible to the member
-- 3) blocked/removed content never reveals hidden message existence through unread counts

-- RSE-004 / PACK02 PSE-003: Portfolio-level permission cannot be represented by asset_id-required media.share_grants.
CREATE TABLE IF NOT EXISTS football.portfolio_share_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  granted_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  grantee_type text NOT NULL
    CHECK (grantee_type IN ('USER','TEAM','ORGANIZATION','PUBLIC_LINK')),
  grantee_id text,
  scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  consent_record_id uuid REFERENCES core.consent_records(id) ON DELETE SET NULL,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at IS NULL OR expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS ix_portfolio_share_grants_athlete_active
  ON football.portfolio_share_grants (athlete_user_id, created_at DESC)
  WHERE revoked_at IS NULL;

COMMIT;

-- ============================================================
-- ROLLBACK NOTES (MANUAL / REVIEW REQUIRED)
-- ============================================================
-- Reverse dependency order:
--
-- DROP INDEX IF EXISTS football.ix_portfolio_share_grants_athlete_active;
-- DROP TABLE IF EXISTS football.portfolio_share_grants;
--
-- ALTER TABLE football.communication_members
--   DROP COLUMN IF EXISTS last_read_at,
--   DROP COLUMN IF EXISTS last_read_message_id;
--
-- DROP INDEX IF EXISTS football.ix_match_official_assignments_official;
-- DROP INDEX IF EXISTS football.ux_match_official_active_assignment;
-- DROP TABLE IF EXISTS football.match_official_assignments;
--
-- DROP INDEX IF EXISTS football.ux_match_lineups_one_captain_per_team;
-- ALTER TABLE football.match_lineups DROP COLUMN IF EXISTS is_captain;
--
-- Before rollback, verify no current API/authorization path depends on these fields/tables.
