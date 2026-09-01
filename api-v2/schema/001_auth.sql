-- V2 authentication schema.
--
-- Every table is prefixed `snapn_v2_` and lives alongside the existing `sn_*`
-- application tables in the same MariaDB database. V2 code never reads or
-- writes anything outside this prefix, so the two datasets stay separable and
-- V2 can be lifted into its own database later without untangling joins.
--
-- Run once, by hand, by the owner. Nothing in the deploy pipeline executes
-- DDL: the existing V1 endpoints alter schema at request time and that is
-- precisely the habit this service does not copy.

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `snapn_v2_accounts` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Stored lowercased and trimmed; uniqueness is enforced on this column.
  `email`             VARCHAR(190) NOT NULL,
  `password_hash`     VARCHAR(255) NOT NULL,
  `display_name`      VARCHAR(60)  NOT NULL,
  -- What the person signed up as. GUARDIAN is never self-selected; a guardian
  -- account is only created by accepting a player's invitation.
  `account_type`      ENUM('PLAYER','GUARDIAN','MANAGER','ADMIN') NOT NULL DEFAULT 'PLAYER',
  -- PENDING_GUARDIAN_CONSENT: a young minor may hold an account but gets no
  -- session until a guardian confirms. SUSPENDED denies immediately.
  `account_state`     ENUM('ACTIVE','PENDING_GUARDIAN_CONSENT','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  -- Birth date drives the minor rules. Nullable so an adult manager account
  -- is not forced to disclose it.
  `birth_date`        DATE NULL,
  `is_minor`          TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`        DATETIME NOT NULL,
  `updated_at`        DATETIME NOT NULL,
  `last_login_at`     DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_snapn_v2_accounts_email` (`email`),
  KEY `ix_snapn_v2_accounts_state` (`account_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Sessions
--
-- Opaque tokens, not JWTs. The server keeps only a SHA-256 of the token, so a
-- database read cannot impersonate anyone, and a session can be revoked the
-- instant an account is suspended — which a self-contained token cannot be.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `snapn_v2_sessions` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id`    BIGINT UNSIGNED NOT NULL,
  `token_hash`    CHAR(64) NOT NULL,
  `issued_at`     DATETIME NOT NULL,
  `expires_at`    DATETIME NOT NULL,
  `last_seen_at`  DATETIME NOT NULL,
  `revoked_at`    DATETIME NULL,
  -- Kept short and coarse: enough to spot a stolen session, not a tracking log.
  `user_agent`    VARCHAR(190) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_snapn_v2_sessions_token` (`token_hash`),
  KEY `ix_snapn_v2_sessions_account` (`account_id`),
  KEY `ix_snapn_v2_sessions_expiry` (`expires_at`),
  CONSTRAINT `fk_snapn_v2_sessions_account`
    FOREIGN KEY (`account_id`) REFERENCES `snapn_v2_accounts` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Verified role grants
--
-- The only source of manager permission. A role preference chosen at sign-up
-- never lands here; a grant is written when a club or coach confirms someone,
-- and revoking it takes effect on the next request.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `snapn_v2_role_grants` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id`  BIGINT UNSIGNED NOT NULL,
  `role`        ENUM('COACH','TEAM_MANAGER','CLUB_DIRECTOR','REFEREE','AGENT','ANALYST') NOT NULL,
  `tenant_id`   VARCHAR(64) NOT NULL,
  `team_id`     VARCHAR(64) NULL,
  `status`      ENUM('VERIFIED','REVOKED','EXPIRED') NOT NULL DEFAULT 'VERIFIED',
  `granted_at`  DATETIME NOT NULL,
  `revoked_at`  DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_snapn_v2_grant` (`account_id`, `role`, `tenant_id`, `team_id`),
  KEY `ix_snapn_v2_grants_account_status` (`account_id`, `status`),
  CONSTRAINT `fk_snapn_v2_grants_account`
    FOREIGN KEY (`account_id`) REFERENCES `snapn_v2_accounts` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Sign-in attempts
--
-- Enough to rate-limit brute force. Keyed by email and by client address so
-- one attacker cannot lock out every account, and one account cannot be
-- hammered from many addresses.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `snapn_v2_login_attempts` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`        VARCHAR(190) NOT NULL,
  -- Hashed, not stored raw: this is a security control, not an audience log.
  `client_hash`  CHAR(64) NOT NULL,
  `succeeded`    TINYINT(1) NOT NULL DEFAULT 0,
  `attempted_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_snapn_v2_attempts_email_time` (`email`, `attempted_at`),
  KEY `ix_snapn_v2_attempts_client_time` (`client_hash`, `attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
