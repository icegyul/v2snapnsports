# 03. SCHEMA RECONCILIATION — KO

## 1. Summary

| Decision | Candidates |
| --- | --- |
| DEFERRED | 2 |
| EVENT/AUDIT_ONLY | 4 |
| EXISTING_COLUMN | 1 |
| EXISTING_JSON/METADATA | 5 |
| EXISTING_RELATION | 1 |
| EXISTING_TABLE | 7 |
| READ_MODEL_ONLY | 2 |
| REAL_SCHEMA_EXTENSION | 4 |

- TOTAL SCHEMA CANDIDATES: **26**
- REUSED EXISTING SCHEMA / READ MODEL / AUDIT: **20**
- REAL SCHEMA EXTENSIONS: **4**
- DEFERRED: **2**
- PACK04 REAL SCHEMA EXTENSIONS: **0**

## 2. Reconciliation decisions

| ID | PACK | Domain | Original Proposal | Canonical Evidence | Decision | Final Shape | Reason | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PSE-001 | PACK 01 | Match | Captain persistence on football.match_lineups | Physical match_lineups has no metadata/captain; PACK01 explicitly forbids hiding captain in JSON/position_code | REAL_SCHEMA_EXTENSION | ALTER football.match_lineups ADD is_captain boolean + partial unique index | Captain is lineup business truth and requires one-per-match/team invariant; existing columns cannot express it without semantic abuse | Drop index then drop column; only local/staging draft after data scan |
| PSE-002 | PACK 01 | Referee | Exact-match referee assignment relation | core.role_grants scopes org/team but not exact match; capabilities JSON is unsuitable as sole security relation for assignment | REAL_SCHEMA_EXTENSION | CREATE football.match_official_assignments | Security-critical exact assignment deserves an explicit FK relation; safety/authorization priority outranks schema minimization | Drop table after verifying no authorization code depends on it |
| P2-PSE-001 | PACK 02 | Scouting | football.scouting_preferences | core.athlete_profiles.profile_visibility includes CONSENTED_PORTFOLIO; core.consent_records has SCOUTING_PORTFOLIO and scope jsonb | EXISTING_JSON/METADATA | Reuse athlete_profiles.profile_visibility + versioned consent_records.scope | Allowed fields/channels/expiry can live in consent scope; separate mutable preference table would duplicate consent truth | No DDL |
| P2-PSE-002 | PACK 02 | Communication | football.communication_message_receipts | communication_members already defines per-thread/per-user membership; MarkRead only needs durable high-water mark | REAL_SCHEMA_EXTENSION | ALTER football.communication_members ADD last_read_message_id, last_read_at | Avoid per-message receipt table explosion while preserving canonical unread/read cursor. Application validates same-thread and monotonic advance. | Drop columns after disabling MarkRead and verifying unread projections |
| P2-PSE-003 | PACK 02 | Portfolio | football.portfolio_share_grants | media.share_grants is asset_id NOT NULL and cannot authorize non-media career/profile projection | REAL_SCHEMA_EXTENSION | CREATE football.portfolio_share_grants with athlete/grantor/grantee/scope/consent/expiry/revoke | A portfolio grant spans career fields plus optional assets; media.share_grants remains a narrower child asset gate | Drop table only after revoking active grants and removing public-link resolvers |
| P4-S01 | PACK 04 | Admin Roles | admin_role_assignments | core.role_grants | EXISTING_TABLE | core.role_grants | RoleGrant already carries role/org/team/state | No DDL |
| P4-S02 | PACK 04 | Admin Roles | admin_scope_bindings | role_grants.organization_id/team_id/capabilities | EXISTING_COLUMN | core.role_grants org/team + capabilities JSON | Dedicated scope table duplicates authority object | No DDL |
| P4-S03 | PACK 04 | Verification | role_credentials | core.role_verifications.evidence jsonb | EXISTING_JSON/METADATA | role_verifications.evidence | Credential payload remains evidence attached to verification | No DDL |
| P4-S04 | PACK 04 | Verification | verification_cases | core.role_verifications + ops.admin_cases | EXISTING_RELATION | role_verifications as domain truth; admin_cases as ops projection | No second verification state machine | No DDL |
| P4-S05 | PACK 04 | Verification | credential_evidence | role_verifications.evidence jsonb + evidence_ref conventions | EXISTING_JSON/METADATA | role_verifications.evidence | Separate table unnecessary before evidence volume/storage requirements prove it | No DDL |
| P4-S06 | PACK 04 | Verification | verification_audit | core.audit_events | EVENT/AUDIT_ONLY | core.audit_events | Audit is immutable event trail, not domain table | No DDL |
| P4-S07 | PACK 04 | Moderation | moderation_reports | community.reports | EXISTING_TABLE | community.reports | Existing report lifecycle covers OPEN/TRIAGED/ACTIONED/CLOSED/DISMISSED | No DDL |
| P4-S08 | PACK 04 | Moderation | moderation_actions | community state + core.audit_events + ops.admin_cases.detail | EVENT/AUDIT_ONLY | audit event + reversible moderation state | Action table duplicates audit/event truth | No DDL |
| P4-S09 | PACK 04 | Moderation | moderation_appeals | ops.admin_cases.detail | EXISTING_JSON/METADATA | admin_cases case_type COMMUNITY_MODERATION + detail.stage=APPEAL | Appeal is case stage until evidence shows independent lifecycle required | No DDL |
| P4-S10 | PACK 04 | Safeguarding | safeguarding_incidents | football.safeguarding_incidents | EXISTING_TABLE | football.safeguarding_incidents | Already physical | No DDL |
| P4-S11 | PACK 04 | Safeguarding | safeguarding_actions | safeguarding_incidents.context + core.audit_events | EVENT/AUDIT_ONLY | action event + incident state/context | No second action table before workflow semantics require it | No DDL |
| P4-S12 | PACK 04 | Privacy | privacy_requests | platform.privacy_requests + privacy_request_items | EXISTING_TABLE | platform.privacy_requests | Already physical | No DDL |
| P4-S13 | PACK 04 | Privacy | lifecycle_jobs | outbox_events + privacy request lifecycle; destructive processing gated | DEFERRED | future worker/job persistence after production infra gate | Backend v1.5 intent exists but physical schema intentionally does not; do not pre-create infra table | N/A until future approval |
| P4-S14 | PACK 04 | Feature Flags | feature_flag_rules | platform.feature_flag_rules | EXISTING_TABLE | platform.feature_flag_rules | Already physical | No DDL |
| P4-S15 | PACK 04 | Migration | migration_domain_status | ops.migration_checkpoints | EXISTING_TABLE | ops.migration_checkpoints | Domain/stage/parity status already physical | No DDL |
| P4-S16 | PACK 04 | Migration | migration_evidence | migration_checkpoints.parity_summary/source_evidence_ref + audit | EXISTING_JSON/METADATA | checkpoint evidence refs + audit | No evidence table without storage/retention need | No DDL |
| P4-S17 | PACK 04 | Jobs | ops_jobs | platform.outbox_events + runtime worker projection | READ_MODEL_ONLY | permission-scoped jobs projection | Do not duplicate outbox/job truth | No DDL |
| P4-S18 | PACK 04 | Jobs | ops_dead_letters | provider-specific DLQ/dead-letter persistence unresolved | DEFERRED | future infra binding | Queue provider and retention strategy are production infra concerns | N/A until future approval |
| P4-S19 | PACK 04 | Jobs | job_retry_attempts | outbox_events.attempt_count + core.audit_events | EVENT/AUDIT_ONLY | attempt_count + audit event | Separate retry table unnecessary | No DDL |
| P4-S20 | PACK 04 | Audit | audit_events | core.audit_events | EXISTING_TABLE | core.audit_events | Already physical | No DDL |
| P4-S21 | PACK 04 | Earthus | earthus_health_snapshots | platform.earthus_context_cache + adapter circuit/last-good state | READ_MODEL_ONLY | derived health projection; no snapshot business table | Earthus is soft dependency; persistent snapshot table would conflate cache/ops telemetry | No DDL |

## 3. Why the four extensions survive

1. **Captain**: the physical lineup has no field that can express captain without semantic abuse. The Pack itself forbids hiding it in `position_code`/arbitrary JSON.
2. **Exact referee assignment**: a security-critical exact `match_id` relation cannot safely rely on org/team RoleGrant or free-form capabilities JSON alone.
3. **Communication read cursor**: reuse `communication_members`, adding only a durable high-water mark rather than a per-message receipt table.
4. **Portfolio ShareGrant**: `media.share_grants.asset_id` is mandatory, so it cannot authorize non-media Career Passport fields.

## 4. DDL

`sql/SNAPN_SPORTS_V2_PACKS_01_04_SCHEMA_EXTENSION_DRAFT.sql`

This is a **DDL draft only**, not a migration. No staging/production execution is authorized.
