-- SNAPN SPORTS V2 PHYSICAL DATABASE SCHEMA v1.4
-- PostgreSQL 15+ target. Canonical V2 schema. Legacy table names are intentionally NOT assumed.
-- Community cutover tables must not become write owners until LEGACY parity audit passes.

BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS football;
CREATE SCHEMA IF NOT EXISTS world;
CREATE SCHEMA IF NOT EXISTS community;
CREATE SCHEMA IF NOT EXISTS media;
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS ops;

-- ---------- CORE ----------
CREATE TABLE IF NOT EXISTS core.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_type text NOT NULL CHECK (account_type IN ('PLAYER','MANAGER','GUARDIAN','SYSTEM')),
  email text,
  phone_e164 text,
  auth_subject text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','DELETED_PENDING','DELETED')),
  locale text NOT NULL DEFAULT 'ko-KR',
  timezone text NOT NULL DEFAULT 'Asia/Seoul',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_lower ON core.users ((lower(email))) WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS core.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES core.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_media_id uuid,
  birth_date date,
  native_name text,
  romanized_name text,
  preferred_call_name text,
  pronunciation_hint text,
  profile_version bigint NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  organization_type text NOT NULL CHECK (organization_type IN ('CLUB','ACADEMY','SCHOOL','LEAGUE','OTHER')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','ARCHIVED')),
  legacy_source_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES core.organizations(id) ON DELETE RESTRICT,
  name text NOT NULL,
  age_group text,
  gender_category text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ARCHIVED')),
  legacy_source_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);
CREATE INDEX IF NOT EXISTS ix_teams_org ON core.teams(organization_id, status);

CREATE TABLE IF NOT EXISTS core.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES core.organizations(id) ON DELETE RESTRICT,
  name text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  status text NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED','ACTIVE','ENDED','ARCHIVED')),
  CHECK (ends_on >= starts_on),
  UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS core.organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  membership_type text NOT NULL CHECK (membership_type IN ('ATHLETE','GUARDIAN','STAFF','EXTERNAL')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('INVITED','ACTIVE','SUSPENDED','ENDED')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  legacy_source_ref text,
  UNIQUE (organization_id, user_id, membership_type, starts_at)
);
CREATE INDEX IF NOT EXISTS ix_org_membership_user ON core.organization_memberships(user_id, status);

CREATE TABLE IF NOT EXISTS core.team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES core.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  season_id uuid REFERENCES core.seasons(id) ON DELETE SET NULL,
  team_role text NOT NULL CHECK (team_role IN ('PLAYER','COACH','TEAM_MANAGER','ANALYST','OTHER_STAFF')),
  shirt_number integer CHECK (shirt_number IS NULL OR (shirt_number BETWEEN 0 AND 999)),
  primary_position text,
  secondary_positions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','ENDED')),
  starts_on date,
  ends_on date,
  legacy_source_ref text
);
CREATE INDEX IF NOT EXISTS ix_team_membership_team ON core.team_memberships(team_id, status);
CREATE INDEX IF NOT EXISTS ix_team_membership_user ON core.team_memberships(user_id, status);

CREATE TABLE IF NOT EXISTS core.athlete_profiles (
  user_id uuid PRIMARY KEY REFERENCES core.users(id) ON DELETE CASCADE,
  athlete_code text UNIQUE,
  dominant_foot text CHECK (dominant_foot IN ('LEFT','RIGHT','BOTH') OR dominant_foot IS NULL),
  current_primary_position text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','RETIRED')),
  profile_visibility text NOT NULL DEFAULT 'PRIVATE' CHECK (profile_visibility IN ('PRIVATE','TEAM','CLUB','CONSENTED_PORTFOLIO')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.guardian_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  guardian_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  relation_type text NOT NULL CHECK (relation_type IN ('PRIMARY_GUARDIAN','CO_GUARDIAN','EMERGENCY_CONTACT')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACTIVE','REVOKED','ENDED')),
  can_manage_consent boolean NOT NULL DEFAULT false,
  can_manage_payment boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  revoked_at timestamptz,
  UNIQUE (athlete_user_id, guardian_user_id, relation_type)
);
CREATE INDEX IF NOT EXISTS ix_guardian_athlete ON core.guardian_links(athlete_user_id, status);

CREATE TABLE IF NOT EXISTS core.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  guardian_user_id uuid REFERENCES core.users(id) ON DELETE SET NULL,
  consent_type text NOT NULL CHECK (consent_type IN ('SERVICE','VIDEO','AI_ANALYSIS','WEARABLE','RESEARCH','MARKETING','SCOUTING_PORTFOLIO','DIRECT_CONTACT')),
  version text NOT NULL,
  scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  state text NOT NULL CHECK (state IN ('GRANTED','REVOKED','EXPIRED')),
  evidence_ref text,
  granted_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_consent_subject ON core.consent_records(athlete_user_id, consent_type, state);

CREATE TABLE IF NOT EXISTS core.role_preferences (
  user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('COACH','TEAM_MANAGER','CLUB_DIRECTOR','REFEREE','AGENT','ANALYST')),
  is_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE IF NOT EXISTS core.role_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  requested_role text NOT NULL CHECK (requested_role IN ('COACH','TEAM_MANAGER','CLUB_DIRECTOR','REFEREE','AGENT','ANALYST')),
  organization_id uuid REFERENCES core.organizations(id) ON DELETE SET NULL,
  team_id uuid REFERENCES core.teams(id) ON DELETE SET NULL,
  state text NOT NULL DEFAULT 'PENDING' CHECK (state IN ('PENDING','NEEDS_EVIDENCE','APPROVED','REJECTED','EXPIRED','REVOKED')),
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  reviewed_by uuid REFERENCES core.users(id) ON DELETE SET NULL,
  review_reason text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_role_verification_user ON core.role_verifications(user_id, state);

CREATE TABLE IF NOT EXISTS core.role_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('COACH','TEAM_MANAGER','CLUB_DIRECTOR','REFEREE','AGENT','ANALYST','SYSTEM_ADMIN')),
  organization_id uuid REFERENCES core.organizations(id) ON DELETE CASCADE,
  team_id uuid REFERENCES core.teams(id) ON DELETE CASCADE,
  capabilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_verification_id uuid REFERENCES core.role_verifications(id) ON DELETE SET NULL,
  state text NOT NULL DEFAULT 'ACTIVE' CHECK (state IN ('ACTIVE','SUSPENDED','EXPIRED','REVOKED')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_role_grant_user ON core.role_grants(user_id, state);
CREATE INDEX IF NOT EXISTS ix_role_grant_scope ON core.role_grants(organization_id, team_id, role, state);

-- ---------- FOOTBALL ----------
CREATE TABLE IF NOT EXISTS football.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES core.organizations(id) ON DELETE SET NULL,
  name text NOT NULL,
  address_text text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  timezone text NOT NULL DEFAULT 'Asia/Seoul',
  earthus_location_key text,
  legacy_source_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_venues_geo ON football.venues(latitude, longitude);

CREATE TABLE IF NOT EXISTS football.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_organization_id uuid REFERENCES core.organizations(id) ON DELETE SET NULL,
  name text NOT NULL,
  competition_type text NOT NULL DEFAULT 'FRIENDLY' CHECK (competition_type IN ('LEAGUE','TOURNAMENT','FRIENDLY','CUP','INTERNAL')),
  season_id uuid REFERENCES core.seasons(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED','ACTIVE','COMPLETED','ARCHIVED')),
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS football.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES football.competitions(id) ON DELETE SET NULL,
  home_team_id uuid REFERENCES core.teams(id) ON DELETE RESTRICT,
  away_team_id uuid REFERENCES core.teams(id) ON DELETE RESTRICT,
  venue_id uuid REFERENCES football.venues(id) ON DELETE SET NULL,
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz,
  state text NOT NULL DEFAULT 'SCHEDULED' CHECK (state IN ('DRAFT','SCHEDULED','CHECK_IN','LIVE','HALFTIME','ENDED','FINALIZED','CANCELLED','POSTPONED')),
  home_score integer NOT NULL DEFAULT 0 CHECK (home_score >= 0),
  away_score integer NOT NULL DEFAULT 0 CHECK (away_score >= 0),
  version bigint NOT NULL DEFAULT 1,
  legacy_source_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (home_team_id IS NULL OR away_team_id IS NULL OR home_team_id <> away_team_id)
);
CREATE INDEX IF NOT EXISTS ix_matches_time ON football.matches(scheduled_start, state);
CREATE INDEX IF NOT EXISTS ix_matches_home ON football.matches(home_team_id, scheduled_start);
CREATE INDEX IF NOT EXISTS ix_matches_away ON football.matches(away_team_id, scheduled_start);

CREATE TABLE IF NOT EXISTS football.match_rosters (
  match_id uuid NOT NULL REFERENCES football.matches(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES core.teams(id) ON DELETE CASCADE,
  athlete_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  shirt_number integer,
  status text NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','STARTER','SUBSTITUTE','UNAVAILABLE','REMOVED')),
  source_membership_id uuid REFERENCES core.team_memberships(id) ON DELETE SET NULL,
  PRIMARY KEY (match_id, team_id, athlete_user_id)
);

CREATE TABLE IF NOT EXISTS football.match_lineups (
  match_id uuid NOT NULL REFERENCES football.matches(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES core.teams(id) ON DELETE CASCADE,
  athlete_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  position_code text,
  formation_slot text,
  starter boolean NOT NULL DEFAULT false,
  version bigint NOT NULL DEFAULT 1,
  PRIMARY KEY (match_id, team_id, athlete_user_id)
);

CREATE TABLE IF NOT EXISTS football.match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES football.matches(id) ON DELETE CASCADE,
  event_seq bigint NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('MATCH_START','PERIOD_START','PERIOD_END','GOAL','OWN_GOAL','SUBSTITUTION','YELLOW_CARD','RED_CARD','INCIDENT','ADDED_TIME','MATCH_END','CORRECTION')),
  team_id uuid REFERENCES core.teams(id) ON DELETE SET NULL,
  athlete_user_id uuid REFERENCES core.users(id) ON DELETE SET NULL,
  related_athlete_user_id uuid REFERENCES core.users(id) ON DELETE SET NULL,
  event_time_seconds integer,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, event_seq),
  UNIQUE (match_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS football.match_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES football.matches(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('REFEREE','TEAM','OFFICIAL')),
  author_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  state text NOT NULL DEFAULT 'DRAFT' CHECK (state IN ('DRAFT','SUBMITTED','FINALIZED','CORRECTED')),
  body jsonb NOT NULL DEFAULT '{}'::jsonb,
  version bigint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  finalized_at timestamptz
);

CREATE TABLE IF NOT EXISTS football.schedule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES core.organizations(id) ON DELETE CASCADE,
  team_id uuid REFERENCES core.teams(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('TRAINING','MATCH','MEETING','EVENT')),
  source_match_id uuid REFERENCES football.matches(id) ON DELETE SET NULL,
  venue_id uuid REFERENCES football.venues(id) ON DELETE SET NULL,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  state text NOT NULL DEFAULT 'SCHEDULED' CHECK (state IN ('SCHEDULED','CANCELLED','COMPLETED','POSTPONED')),
  visibility text NOT NULL DEFAULT 'TEAM' CHECK (visibility IN ('PRIVATE','TEAM','CLUB','PUBLIC')),
  version bigint NOT NULL DEFAULT 1,
  legacy_source_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_schedule_team_time ON football.schedule_events(team_id, starts_at);

CREATE TABLE IF NOT EXISTS football.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_event_id uuid REFERENCES football.schedule_events(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL REFERENCES core.organizations(id) ON DELETE RESTRICT,
  team_id uuid NOT NULL REFERENCES core.teams(id) ON DELETE RESTRICT,
  venue_id uuid REFERENCES football.venues(id) ON DELETE SET NULL,
  objective text,
  plan_version bigint NOT NULL DEFAULT 1,
  state text NOT NULL DEFAULT 'DRAFT' CHECK (state IN ('DRAFT','READY','CHECK_IN','LIVE','ENDED','PROCESSING','REVIEW','PUBLISHED','ARCHIVED','CANCELLED','FAILED_PARTIAL')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  version bigint NOT NULL DEFAULT 1,
  legacy_source_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_training_team_state ON football.training_sessions(team_id, state, starts_at);

CREATE TABLE IF NOT EXISTS football.attendance (
  training_session_id uuid NOT NULL REFERENCES football.training_sessions(id) ON DELETE CASCADE,
  athlete_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  response text CHECK (response IN ('YES','NO','LATE','UNKNOWN')),
  check_in_state text NOT NULL DEFAULT 'NOT_CHECKED' CHECK (check_in_state IN ('NOT_CHECKED','PRESENT','ABSENT','LATE','EXCUSED')),
  check_in_at timestamptz,
  updated_by uuid REFERENCES core.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (training_session_id, athlete_user_id)
);

CREATE TABLE IF NOT EXISTS football.training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_session_id uuid NOT NULL REFERENCES football.training_sessions(id) ON DELETE CASCADE,
  current_revision integer NOT NULL DEFAULT 1,
  state text NOT NULL DEFAULT 'DRAFT' CHECK (state IN ('DRAFT','READY','LOCKED')),
  objective jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (training_session_id)
);

CREATE TABLE IF NOT EXISTS football.training_plan_revisions (
  training_plan_id uuid NOT NULL REFERENCES football.training_plans(id) ON DELETE CASCADE,
  revision integer NOT NULL,
  plan jsonb NOT NULL,
  created_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (training_plan_id, revision)
);

CREATE TABLE IF NOT EXISTS football.training_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_session_id uuid NOT NULL REFERENCES football.training_sessions(id) ON DELETE CASCADE,
  local_event_id text,
  event_seq bigint,
  event_type text NOT NULL CHECK (event_type IN ('DRILL_START','DRILL_END','SET_START','SET_END','REST_START','REST_END','PLAYER_OUT','TACTIC_REVISION','VIDEO_MARK','COACH_NOTE','SESSION_END','SYNC_CORRECTION')),
  athlete_user_id uuid REFERENCES core.users(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  event_time timestamptz NOT NULL,
  created_by uuid REFERENCES core.users(id) ON DELETE SET NULL,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (training_session_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS ix_training_events_session_time ON football.training_events(training_session_id, event_time);

CREATE TABLE IF NOT EXISTS football.tactics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES core.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  state text NOT NULL DEFAULT 'DRAFT' CHECK (state IN ('DRAFT','ACTIVE','ARCHIVED')),
  current_version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS football.tactic_versions (
  tactic_id uuid NOT NULL REFERENCES football.tactics(id) ON DELETE CASCADE,
  version integer NOT NULL,
  formation_code text,
  tactical_data jsonb NOT NULL,
  player_share_data jsonb,
  created_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tactic_id, version)
);

CREATE TABLE IF NOT EXISTS football.career_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('JOINED_TEAM','LEFT_TEAM','PROMOTED','POSITION_CHANGED','SEASON_STARTED','SEASON_ENDED','TRAINING_MILESTONE','MATCH_MILESTONE','COACH_REVIEW','REPRESENTATIVE_VIDEO','ACHIEVEMENT')),
  occurred_at timestamptz NOT NULL,
  organization_id uuid REFERENCES core.organizations(id) ON DELETE SET NULL,
  team_id uuid REFERENCES core.teams(id) ON DELETE SET NULL,
  season_id uuid REFERENCES core.seasons(id) ON DELETE SET NULL,
  source_type text NOT NULL,
  source_id text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility text NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PRIVATE','GUARDIAN','TEAM','CLUB','CONSENTED_PORTFOLIO')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (athlete_user_id, source_type, source_id, event_type)
);
CREATE INDEX IF NOT EXISTS ix_career_athlete_time ON football.career_events(athlete_user_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS football.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES core.organizations(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  opportunity_type text NOT NULL CHECK (opportunity_type IN ('TRYOUT','TRIAL','CONSULTATION','CAMP','SCOUTING_INTEREST')),
  title text NOT NULL,
  eligibility jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility text NOT NULL DEFAULT 'CONSENTED' CHECK (visibility IN ('PRIVATE','CONSENTED','PUBLIC')),
  state text NOT NULL DEFAULT 'DRAFT' CHECK (state IN ('DRAFT','OPEN','CLOSED','CANCELLED','COMPLETED')),
  opens_at timestamptz,
  closes_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS football.opportunity_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES football.opportunities(id) ON DELETE CASCADE,
  athlete_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  action_type text NOT NULL CHECK (action_type IN ('INVITED','INTERESTED','DECLINED','GUARDIAN_APPROVED','CLUB_APPROVED','SCHEDULED','COMPLETED','CANCELLED')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS football.communication_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES core.organizations(id) ON DELETE CASCADE,
  team_id uuid REFERENCES core.teams(id) ON DELETE CASCADE,
  context_type text NOT NULL CHECK (context_type IN ('GENERAL','SCHEDULE','TRAINING','MATCH','PLAYER_SUPPORT','OPPORTUNITY')),
  context_id text,
  title text,
  state text NOT NULL DEFAULT 'ACTIVE' CHECK (state IN ('ACTIVE','LOCKED','ARCHIVED')),
  created_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS football.communication_members (
  thread_id uuid NOT NULL REFERENCES football.communication_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  member_role text NOT NULL,
  can_post boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);
CREATE TABLE IF NOT EXISTS football.communication_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES football.communication_threads(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  body text NOT NULL,
  media_asset_id uuid,
  moderation_state text NOT NULL DEFAULT 'VISIBLE' CHECK (moderation_state IN ('VISIBLE','HIDDEN','REMOVED','REVIEW')),
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_comm_messages_thread_time ON football.communication_messages(thread_id, created_at DESC);

CREATE TABLE IF NOT EXISTS football.safeguarding_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id uuid REFERENCES core.users(id) ON DELETE SET NULL,
  reported_by uuid REFERENCES core.users(id) ON DELETE SET NULL,
  incident_type text NOT NULL CHECK (incident_type IN ('PROHIBITED_CONTACT','HARASSMENT','PRIVACY','IMPERSONATION','CONTENT','OTHER')),
  severity text NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  state text NOT NULL DEFAULT 'OPEN' CHECK (state IN ('OPEN','TRIAGED','INVESTIGATING','ACTIONED','CLOSED')),
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

-- ---------- WORLD ----------
CREATE TABLE IF NOT EXISTS world.stadium_style_families (
  id text PRIMARY KEY,
  name text NOT NULL,
  target_tags jsonb NOT NULL,
  constraints jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS world.stadium_modules (
  id text PRIMARY KEY,
  module_type text NOT NULL CHECK (module_type IN ('BOWL','STAND','ROOF','FACADE','SEAT','LIGHTING','PITCH','ENVIRONMENT','SCOREBOARD','DECOR')),
  style_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  structural_constraints jsonb NOT NULL DEFAULT '{}'::jsonb,
  poly_cost integer NOT NULL DEFAULT 0,
  device_tiers jsonb NOT NULL DEFAULT '["LOW","MID","HIGH"]'::jsonb,
  asset_bundle_key text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS world.stadium_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES core.users(id) ON DELETE CASCADE,
  owner_organization_id uuid REFERENCES core.organizations(id) ON DELETE CASCADE,
  style_family_id text NOT NULL REFERENCES world.stadium_style_families(id),
  modules jsonb NOT NULL,
  palette jsonb NOT NULL DEFAULT '{}'::jsonb,
  decor_seed bigint NOT NULL,
  score_breakdown jsonb NOT NULL,
  total_score numeric(5,4) NOT NULL CHECK (total_score BETWEEN 0 AND 1),
  version integer NOT NULL DEFAULT 1,
  state text NOT NULL DEFAULT 'ACTIVE' CHECK (state IN ('ACTIVE','ARCHIVED','BLOCKED_IP','BLOCKED_PERFORMANCE')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_stadium_recipe_owner ON world.stadium_recipes(owner_user_id, state);
CREATE TABLE IF NOT EXISTS world.formation_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES core.teams(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('CURRENT_TEAM','MATCH_LINEUP','TACTIC')),
  source_id text,
  formation_code text NOT NULL,
  player_position_map jsonb NOT NULL,
  version bigint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS world.stadium_states (
  user_id uuid PRIMARY KEY REFERENCES core.users(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES world.stadium_recipes(id) ON DELETE SET NULL,
  home_state text NOT NULL DEFAULT 'NORMAL',
  next_event_id uuid REFERENCES football.schedule_events(id) ON DELETE SET NULL,
  report_state text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- COMMUNITY (cutover write ownership requires parity gate) ----------
CREATE TABLE IF NOT EXISTS community.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  organization_id uuid REFERENCES core.organizations(id) ON DELETE CASCADE,
  team_id uuid REFERENCES core.teams(id) ON DELETE CASCADE,
  visibility text NOT NULL DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC','CLUB','TEAM','FOLLOWERS','PRIVATE')),
  body text NOT NULL,
  legacy_source_ref text,
  moderation_state text NOT NULL DEFAULT 'VISIBLE' CHECK (moderation_state IN ('VISIBLE','HIDDEN','REMOVED','REVIEW')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_posts_feed ON community.posts(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_posts_team ON community.posts(team_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS community.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community.posts(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES community.comments(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  body text NOT NULL,
  legacy_source_ref text,
  moderation_state text NOT NULL DEFAULT 'VISIBLE' CHECK (moderation_state IN ('VISIBLE','HIDDEN','REMOVED','REVIEW')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_comments_post_time ON community.comments(post_id, created_at);
CREATE TABLE IF NOT EXISTS community.reactions (
  post_id uuid NOT NULL REFERENCES community.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id, reaction_type)
);
CREATE TABLE IF NOT EXISTS community.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  target_type text NOT NULL CHECK (target_type IN ('POST','COMMENT','USER','MESSAGE')),
  target_id text NOT NULL,
  reason_code text NOT NULL,
  detail text,
  state text NOT NULL DEFAULT 'OPEN' CHECK (state IN ('OPEN','TRIAGED','ACTIONED','CLOSED','DISMISSED')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS community.blocks (
  blocker_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  blocked_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_user_id, blocked_user_id),
  CHECK (blocker_user_id <> blocked_user_id)
);

-- ---------- MEDIA ----------
CREATE TABLE IF NOT EXISTS media.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES core.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES core.organizations(id) ON DELETE CASCADE,
  asset_type text NOT NULL CHECK (asset_type IN ('IMAGE','VIDEO','AUDIO','DOCUMENT','THUMBNAIL','PROXY')),
  storage_key text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  checksum_sha256 text,
  visibility text NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PRIVATE','TEAM','CLUB','CONSENTED','PUBLIC')),
  lifecycle_state text NOT NULL DEFAULT 'ACTIVE' CHECK (lifecycle_state IN ('UPLOADING','ACTIVE','QUARANTINED','DELETING','DELETED')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_media_org_created ON media.assets(organization_id, created_at DESC);
CREATE TABLE IF NOT EXISTS media.asset_links (
  asset_id uuid NOT NULL REFERENCES media.assets(id) ON DELETE CASCADE,
  subject_type text NOT NULL CHECK (subject_type IN ('POST','COMMENT','ATHLETE','MATCH','TRAINING_SESSION','CAREER_EVENT','MESSAGE')),
  subject_id text NOT NULL,
  athlete_user_id uuid REFERENCES core.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (asset_id, subject_type, subject_id)
);
CREATE TABLE IF NOT EXISTS media.share_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES media.assets(id) ON DELETE CASCADE,
  granted_by uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  grantee_type text NOT NULL CHECK (grantee_type IN ('USER','TEAM','ORGANIZATION','PUBLIC_LINK')),
  grantee_id text,
  scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- PLATFORM ----------
CREATE TABLE IF NOT EXISTS platform.feature_flags (
  key text PRIMARY KEY,
  default_enabled boolean NOT NULL DEFAULT false,
  hard_gate boolean NOT NULL DEFAULT false,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO platform.feature_flags(key, default_enabled, hard_gate, description) VALUES
('EPTS', false, true, 'Hardware not released'),
('CAMERA_AI', false, true, 'Future PoC/release gate'),
('SPORTS_AI', false, true, 'Evidence AI release gate'),
('COMMUNITY_FEED_INTELLIGENCE', false, false, 'Legacy parity first'),
('EARTHUS_CONTEXT', true, false, 'Soft dependency context only')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS platform.feature_flag_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key text NOT NULL REFERENCES platform.feature_flags(key) ON DELETE CASCADE,
  scope_type text NOT NULL CHECK (scope_type IN ('GLOBAL','ORGANIZATION','TEAM','USER','BETA_GROUP','PLATFORM','APP_VERSION')),
  scope_value text,
  enabled boolean NOT NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid REFERENCES core.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.notification_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type text NOT NULL,
  context_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (context_type, context_id)
);
CREATE TABLE IF NOT EXISTS platform.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  thread_id uuid REFERENCES platform.notification_threads(id) ON DELETE SET NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  body text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  state text NOT NULL DEFAULT 'UNREAD' CHECK (state IN ('UNREAD','READ','ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_notifications_user ON platform.notifications(user_id, state, created_at DESC);

CREATE TABLE IF NOT EXISTS platform.sync_clients (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  last_cursor text,
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS platform.sync_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL REFERENCES platform.sync_clients(id) ON DELETE CASCADE,
  local_event_id text NOT NULL,
  local_seq bigint NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  idempotency_key text NOT NULL,
  server_state text NOT NULL DEFAULT 'RECEIVED' CHECK (server_state IN ('RECEIVED','ACCEPTED','REJECTED','CONFLICT','APPLIED')),
  conflict_detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, local_event_id),
  UNIQUE(idempotency_key)
);

CREATE TABLE IF NOT EXISTS platform.privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  subject_user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE RESTRICT,
  request_type text NOT NULL CHECK (request_type IN ('EXPORT','DELETE','CONSENT_REVOCATION')),
  state text NOT NULL DEFAULT 'QUEUED' CHECK (state IN ('QUEUED','VALIDATING','PROCESSING','BLOCKED','COMPLETED','FAILED','CANCELLED')),
  scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE TABLE IF NOT EXISTS platform.privacy_request_items (
  request_id uuid NOT NULL REFERENCES platform.privacy_requests(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_key text NOT NULL,
  state text NOT NULL DEFAULT 'PENDING' CHECK (state IN ('PENDING','PROCESSING','COMPLETED','FAILED','SKIPPED_LEGAL_HOLD')),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (request_id, item_type, item_key)
);

CREATE TABLE IF NOT EXISTS platform.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  user_id uuid REFERENCES core.users(id) ON DELETE SET NULL,
  anonymous_session_id text,
  organization_id uuid REFERENCES core.organizations(id) ON DELETE SET NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_analytics_name_time ON platform.analytics_events(event_name, occurred_at DESC);

CREATE TABLE IF NOT EXISTS platform.earthus_context_cache (
  cache_key text PRIMARY KEY,
  venue_id uuid REFERENCES football.venues(id) ON DELETE CASCADE,
  valid_for timestamptz NOT NULL,
  fetched_at timestamptz NOT NULL,
  source_status text NOT NULL CHECK (source_status IN ('FRESH','STALE','ERROR_FALLBACK')),
  context jsonb NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS platform.outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_outbox_unpublished ON platform.outbox_events(created_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS platform.asset_bundles (
  bundle_key text NOT NULL,
  version integer NOT NULL,
  device_tier text NOT NULL CHECK (device_tier IN ('LOW','MID','HIGH')),
  manifest jsonb NOT NULL,
  checksum text NOT NULL,
  state text NOT NULL DEFAULT 'ACTIVE' CHECK (state IN ('ACTIVE','DEPRECATED','BLOCKED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(bundle_key, version, device_tier)
);

CREATE TABLE IF NOT EXISTS core.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES core.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  organization_id uuid REFERENCES core.organizations(id) ON DELETE SET NULL,
  request_id text,
  ip_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_audit_resource ON core.audit_events(resource_type, resource_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ix_audit_actor ON core.audit_events(actor_user_id, occurred_at DESC);

-- ---------- OPS ----------
CREATE TABLE IF NOT EXISTS ops.migration_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  stage text NOT NULL CHECK (stage IN ('INVENTORY','ADAPTER_READ','SHADOW_WRITE','DUAL_VERIFY','CUTOVER','ROLLBACK_READY','DECOMMISSIONED')),
  source_evidence_ref text NOT NULL,
  last_legacy_cursor text,
  last_v2_cursor text,
  parity_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  state text NOT NULL DEFAULT 'OPEN' CHECK (state IN ('OPEN','PASS','FAIL','ROLLED_BACK')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(domain, stage)
);
CREATE TABLE IF NOT EXISTS ops.admin_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_type text NOT NULL CHECK (case_type IN ('ROLE_VERIFICATION','COMMUNITY_MODERATION','SAFEGUARDING','PRIVACY','MIGRATION','SUPPORT')),
  subject_ref text,
  priority text NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','CRITICAL')),
  state text NOT NULL DEFAULT 'OPEN' CHECK (state IN ('OPEN','ASSIGNED','WAITING','RESOLVED','CLOSED')),
  assigned_to uuid REFERENCES core.users(id) ON DELETE SET NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

-- Implementation notes:
-- 1) Application authorization must always apply tenant/data-scope prefilter + post-check. RLS may be added as defense-in-depth after audit.
-- 2) Legacy Community remains source-of-truth until parity gate authorizes write cutover.
-- 3) EPTS/CAMERA_AI/SPORTS_AI hard flags cannot be enabled by ordinary organization/user rules.
-- 4) All destructive privacy workflows must write audit events and preserve legal-hold exceptions explicitly.
