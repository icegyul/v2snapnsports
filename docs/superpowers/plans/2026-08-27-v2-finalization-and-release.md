# SnapN Sports V2 Finalization and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a committed and deployed V2 without copying Legacy source, changing production data before its gates close, or transferring a write owner before rollback is proven.

**Architecture:** Ship two separately approved releases. Release A is a V2 read-only web shell at `/v2/` with an allowlisted GET adapter under `/api/v1/`; V1 keeps every write. Release B is the final domain-by-domain writer cutover only after DB/media restore, authorization, Community safety, migration, and rollback evidence pass.

**Tech Stack:** React, Vite, TypeScript, React Router, TanStack Query, PHP compatibility adapter, V1 HTTPS read contracts, later PostgreSQL canonical store, later S3-compatible private media storage.

**Spec:** `docs/audit-live/IMPLEMENTATION_READINESS_REPORT.md`, `docs/audit-live/V2_RUNTIME_DECISION.md`, `docs/audit-live/FIRST_READ_ONLY_ADAPTER_SLICE.md`, `docs/audit-live/PRE_IMPLEMENTATION_FAILING_TEST_MATRIX.md`

## Global Constraints

- Modify only `/Volumes/740GB/## APP/Sanpnsports v2_app`.
- Legacy `/Volumes/740GB/웹/스냅엔스포츠cafe24-deploy` remains read-only; never build, install, deploy, format, move, or edit it.
- Do not send production `INSERT`, `UPDATE`, `DELETE`, DDL, migration, restore, deploy, or data-copy commands without the specific approval gate below.
- Do not call production runtime endpoints as “read-only” while they can execute request-time DDL. Use approved direct read-only DB inventory or a non-production replica instead.
- Keep credentials, dumps, media binaries, production rows, and `.env` values out of V2, Git, logs, chat, and test fixtures.
- V1 remains the write owner through Release A. `Feed Intelligence`, `EPTS`, `CAMERA_AI`, and `SPORTS_AI` remain off.
- Commit only V2 files with explicit paths. Never commit from the Legacy checkout.

---

## Milestone map

```text
M0 Operational proof + V2 Git boundary
  -> M1 Read-only adapter foundation
  -> M2 Staging + Release A commit/deploy
  -> M3 Auth/Community/Media/DB cutover preparation
  -> M4 Domain-by-domain writer transfer
  -> M5 Release B final commit/deploy and observation
```

`M2` is a safe V2 public release. `M5` is the final V2 ownership release. Never call M2 “final cutover.”

### Task 0: Establish the V2 source-control boundary

**Files:**
- Create after owner approval: V2 `.git/` metadata and scoped remote configuration
- Commit first: existing V2 `README.md`, `.gitignore`, `docs/audit/`, `docs/audit-live/`, and this plan

**Interfaces:**
- Consumes: product owner’s exact V2 remote URL, default branch name, and branch-protection rule
- Produces: V2-only repository, protected release branch, reproducible commit history

- [ ] **Step 1: Record the exact repository decision**

Record the remote URL, default branch, release-approval identity, and whether existing V2 files form the initial commit. Do not infer a GitHub organization, remote, or branch from Legacy.

- [ ] **Step 2: Initialize or attach V2 Git only after that decision**

Run only in V2 and verify the top level equals `/Volumes/740GB/## APP/Sanpnsports v2_app`. Stop if the directory is already attached to an unexpected repository.

- [ ] **Step 3: Verify initial tracked scope**

Confirm secrets, build output, `legacy/`, `v1/`, dumps, `files/`, and backups are ignored. Confirm all tracked paths are V2 files.

- [ ] **Step 4: Create the audit-baseline commit**

Stage only the V2 README, ignore rules, baseline audit, live audit, and plan directories. Commit message: `docs(v2): record pre-implementation readiness gates`.

- [ ] **Step 5: Push and protect the baseline**

Push the approved branch and confirm branch-protection/review policy. This is the point at which the V2 audit becomes recoverable history.

**Acceptance:** V2 has a known remote and protected branch; Legacy has no changed Git status; the baseline commit contains no secret or production data.

### Task 1: Close the operational evidence gate before feature work

**Files:**
- Update V2 only: `docs/audit-live/PROD_DB_*.md`, `BACKUP_CURRENT_STATE.md`, `RESTORE_REHEARSAL_REPORT.md`, `ROLLBACK_READINESS_REPORT.md`, `IMPLEMENTATION_READINESS_REPORT.md`
- Evidence location outside repository: operator-approved restricted evidence store

**Interfaces:**
- Consumes: named source DB label, DB operator, reviewer, read-only account through secure channel, backup window, encrypted evidence store, named isolated restore target
- Produces: sanitized production inventory, backup acceptance, restore comparison, migration ledger reconciliation

- [ ] **Step 1: Approve the D-12 operational window**

The product owner and DB operator must name the source label, table scope, backup window, evidence-store owner, retention, restore target, and reviewer. Stop immediately if any value is absent.

- [ ] **Step 2: Capture a direct read-only production inventory**

Use only the reviewed collector with `SELECT`, `information_schema`, `COUNT(*)`, and `SHOW CREATE TABLE`. Capture server version, schema/table list, columns, defaults, engines, collations, indexes, constraints, triggers, views, routines, events, and aggregate counts. Do not capture rows or credential values.

- [ ] **Step 3: Reconcile runtime DDL and local migrations**

For every one of the 29 migration checksums and every runtime-DDL site, classify production state as `APPLIED_EVIDENCE`, `PARTIAL`, `NOT_FOUND`, or `UNKNOWN`. Preserve unknowns; do not repair them in production.

- [ ] **Step 4: Capture encrypted DB and media backups**

Capture consistent DB schema/data backup and paired media manifest/binary backup outside the repository. Verify hashes before and after encryption. Record source labels, times, bytes, encryption owner, and retention without writing secret values to V2.

- [ ] **Step 5: Rehearse restore into the named isolated target**

The DB operator and reviewer independently verify non-production identity before restore. Compare normalized schema, table counts, aggregate profiles, media hashes, and representative decodes. Any unexplained mismatch is a gate failure.

- [ ] **Step 6: Commit the sanitized evidence verdict**

Commit only aggregate summaries and hashes to V2. Commit message: `docs(v2): record approved production readiness evidence`.

**Acceptance:** Production DB, backup, restore, migration ledger, media manifest, and rollback readiness are `PASS` with linked restricted evidence. Otherwise stop before Task 2.

### Task 2: Freeze runtime, security, and release operations

**Files:**
- Create: `infrastructure/v2-release-contract.md`
- Create: `infrastructure/v2-secrets-contract.md`
- Create: `scripts/verify_v2_release.*`
- Create: `scripts/deploy_v2_*`
- Update: `docs/audit-live/V2_DEPLOYMENT_TARGET.md`, `V2_STORAGE_DECISION.md`

**Interfaces:**
- Consumes: verified Cafe24 PHP/version/extensions, web-root paths, secure config method, logs/monitoring owner, `/v2/` and `/api/v1/` allocation, SFTP host-key verification
- Produces: deployable V2 target with explicit rollback and security headers

- [ ] **Step 1: Verify the physical runtime against Release A requirements**

Record PHP version/extensions, TLS behavior, document-root mapping, writable/log paths, disk quota, process limits, and server security-header capability. Fail if `/v2/` cannot have a distinct service-worker scope or `/api/v1/` cannot be isolated from Legacy files.

- [ ] **Step 2: Provision a V2-only secure configuration contract**

Use a server-side protected configuration path outside web root. Define only variable names and owners in Git: V1 base URL, allowed adapter paths, timeout, log path, and release flag. Do not copy V1 DB/JWT/OAuth values.

- [ ] **Step 3: Define mandatory response headers**

Require CSP, HSTS, `X-Content-Type-Options`, frame policy, referrer policy, permissions policy, cache control, and API no-store/private behavior. Add a verification script that fails release if a required header is absent.

- [ ] **Step 4: Implement V2 deployment/rollback scripts**

The scripts must use verified host keys, an exclusive V2 lock, temporary upload names, byte/hash round-trip validation, asset-first deployment, atomic entry switch, service worker last, persistent backup, and explicit rollback. Their input allowlist must reject V1 paths and secret/config files.

- [ ] **Step 5: Test scripts only against a non-production target**

Test successful deploy, bad hash, lock collision, missing header, malformed artifact, rollback, and no V1 path access. Record test result in V2.

- [ ] **Step 6: Commit the release tooling**

Commit message: `build(v2): add isolated release and rollback controls`.

**Acceptance:** A V2-only deployment can be verified and rolled back without touching V1, and the exact runtime/security facts are recorded.

### Task 3: Build the read-only adapter by test-first development

**Files:**
- Create: `backend/php/public/index.php`
- Create: `backend/php/src/AllowedReadRoute.php`
- Create: `backend/php/src/LegacyHttpClient.php`
- Create: `backend/php/src/CanonicalDtoMapper.php`
- Create: `backend/php/src/AdapterError.php`
- Create: `backend/php/src/ResponseHeaders.php`
- Create: `backend/php/tests/AllowedReadRouteTest.php`
- Create: `backend/php/tests/LegacyHttpClientTest.php`
- Create: `backend/php/tests/CanonicalDtoMapperTest.php`
- Create: `backend/php/tests/AdapterErrorTest.php`

**Interfaces:**
- Consumes: `Authorization` or compatibility auth header, one allowlisted read route, V1 `{success,data}` envelope
- Produces: canonical JSON envelope `{data, provenance, requestId}` or stable safe error

- [ ] **Step 1: Write failing route-allowlist tests**

Cover allowed GET routes for current user, player, team, guardian, and schedule. Cover rejection of every write method, Community detail, arbitrary URL, path traversal, foreign host, and unexpected query key.

- [ ] **Step 2: Run route tests and confirm initial failure**

Expected result: classes/routes do not exist or every request is rejected.

- [ ] **Step 3: Implement the minimum allowlist**

Map each V2 route to one fixed V1 HTTPS GET path and typed query schema. Do not accept a caller-supplied destination. Exclude Community detail because its Legacy GET increments views.

- [ ] **Step 4: Write failing legacy-client tests**

Fixtures must cover success envelope, 401, 403, 404, 409, 422, timeout, 500, HTML/non-JSON, malformed JSON, and extra fields. Fixtures contain no real member, player, media, or token values.

- [ ] **Step 5: Implement error translation and forwarding**

Forward auth proof only to the fixed V1 origin, never persist it, and emit `AUTH_REQUIRED`, `LEGACY_SCOPE_DENIED`, `LEGACY_UNAVAILABLE`, or `LEGACY_CONTRACT_INVALID` exactly as defined in `ADAPTER_ERROR_POLICY.md`.

- [ ] **Step 6: Write failing DTO mapper tests**

Test `CanonicalUser`, `CanonicalPlayer`, `CanonicalTeamMembership`, `CanonicalGuardianLink`, and `CanonicalScheduleItem`. Test null/zero/absent distinction, source IDs, schedule ID prefixing, unknown guardian type, and sensitive-field exclusion.

- [ ] **Step 7: Implement DTO validators/mappers**

Return mapping version, source system, source ID, captured time, source update time when known, and explicit missing field state. Never create a V2 role grant from a legacy role label.

- [ ] **Step 8: Run all adapter tests**

Expected result: route, client, mapper, and error suites pass; coverage includes every `ADAPTER-*` row in the matrix.

- [ ] **Step 9: Commit the adapter foundation**

Commit message: `feat(v2): add read-only legacy adapter contracts`.

**Acceptance:** The adapter has no DB client, no write method, no runtime DDL, no secret file, and no reachable unallowlisted upstream route.

### Task 4: Build the V2 read-only web shell by test-first development

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/lib/apiClient.ts`
- Create: `apps/web/src/lib/queryClient.ts`
- Create: `apps/web/src/features/profile/ProfileReadModel.tsx`
- Create: `apps/web/src/features/schedule/ScheduleReadModel.tsx`
- Create: `apps/web/src/features/provenance/SourceStatus.tsx`
- Create: `apps/web/src/styles/app.css`
- Create: `tests/web/apiClient.test.ts`
- Create: `tests/web/ProfileReadModel.test.tsx`
- Create: `tests/web/ScheduleReadModel.test.tsx`
- Create: `tests/web/SourceStatus.test.tsx`

**Interfaces:**
- Consumes: Task 3 canonical adapter envelope
- Produces: `/v2/` UI for the read-only first slice, explicit loading/error/permission/stale/provenance states

- [ ] **Step 1: Write failing API-client and cache-policy tests**

Verify only `/api/v1/` routes are called, private queries are not persisted, 401/403 clears private cache, public data has the approved TTL, and stale public data receives a visible label.

- [ ] **Step 2: Implement the typed API client and query client**

Use a single API client. Set private queries to no shared/server cache and no stale fallback. Disable service-worker caching of authenticated API responses.

- [ ] **Step 3: Write failing UI tests**

Cover: authenticated user with no player, unknown guardian type, unavailable Legacy endpoint, denied scope, schedule missing time zone, stale public result, and full safe read model. Assert no write controls exist.

- [ ] **Step 4: Implement the smallest read-only screens**

Render identity summary, own player, observed team memberships, guardian-link status, and schedules. Show source/captured time/missing state. Use no Community write, media upload, role management, or AI feature.

- [ ] **Step 5: Add `/v2/` PWA isolation**

Set the Vite base, manifest start URL, navigation fallback, and service-worker scope to `/v2/`. Verify it cannot claim `/app/` clients.

- [ ] **Step 6: Run unit, interaction, type, and production-build checks**

Expected result: no TypeScript error, all tests pass, build emits only V2 assets, and no V1 asset/path is included.

- [ ] **Step 7: Commit the shell**

Commit message: `feat(v2): add read-only profile and schedule shell`.

**Acceptance:** The UI cannot initiate a Legacy write and accurately labels unavailable/unknown/stale data.

### Task 5: Stage real authorization and adapter behavior

**Files:**
- Create: `tests/staging/auth-matrix.md`
- Create: `tests/staging/adapter-smoke.sh`
- Create: `docs/audit-live/RELEASE_A_STAGING_REPORT.md`

**Interfaces:**
- Consumes: isolated staging DB, sanitized seed identities, staged V1-compatible API, adapter and web artifacts
- Produces: evidence for auth, guardian, scope, error, PWA, and rollback gates

- [ ] **Step 1: Create non-production test identities and fixtures**

Create exactly the actors in the test matrix: anonymous, player A, player B, primary/co/emergency guardian, coach A, manager A, revoked guardian, suspended user, org-A admin, org-B admin, referee, and agent. Use synthetic names/media only.

- [ ] **Step 2: Execute every AUTH and GUARD test**

Run `AUTH-001` through `AUTH-008` and `GUARD-001` through `GUARD-004`. Capture status, stable error code, audit event existence, and cache invalidation result.

- [ ] **Step 3: Execute adapter and UI tests against staging**

Run `ADAPTER-001` through `ADAPTER-005`, then verify no adapter route performs a write or direct DB action. Run browser checks for `/app/` plus `/v2/` overlap and service-worker scope separation.

- [ ] **Step 4: Exercise deploy and rollback on staging**

Deploy V2, verify headers/hashes/routes, simulate a verified rollback, and confirm V1 application files/hashes were untouched.

- [ ] **Step 5: Publish the staging report**

Commit only synthetic results and aggregate assertions. Commit message: `test(v2): record read-only release staging gate`.

**Acceptance:** All Auth/Guardian/Adapter tests pass, no security event is unresolved, `/app/` remains healthy, and staged rollback passes.

### Task 6: Release A — commit, review, canary deploy, and observation

**Files:**
- Create: `docs/releases/RELEASE_A_READ_ONLY.md`
- Create: `docs/releases/RELEASE_A_ROLLBACK.md`
- Update: `docs/audit-live/IMPLEMENTATION_READINESS_REPORT.md`

**Interfaces:**
- Consumes: reviewed Task 0–5 commits, signed staging report, approved production deployment window, release/rollback operator
- Produces: V2 read-only route deployed at `/v2/` with V1 write ownership unchanged

- [ ] **Step 1: Assemble a scoped Release A commit**

Include only V2 adapter/web/infrastructure/tests/docs. Run diff review for secrets, V1 paths, write-capable routes, generated output, and unsafe cache configuration.

- [ ] **Step 2: Create the release commit and tag**

Commit message: `release(v2): read-only adapter and web shell`. Tag the approved release version after the commit hash is verified.

- [ ] **Step 3: Obtain production-window approval**

Name the deploy operator, observer, exact artifacts, rollback command, observation period, and stop conditions. Do not deploy if any item is missing.

- [ ] **Step 4: Deploy only `/v2/` and `/api/v1/`**

Run the isolated V2 deployment flow. Do not upload to `/app/` or replace Legacy API files.

- [ ] **Step 5: Run the canary checklist**

Verify route load, required headers, hashes, anonymous 401 behavior, signed-in read, cross-team denial, Legacy-unavailable state, no write route, V1 `/app/` health, and service-worker isolation.

- [ ] **Step 6: Observe and decide**

During the approved observation window, monitor sanitized error/mismatch/latency signals. If any stop condition fires, disable the V2 route and roll back V2 artifacts; V1 remains untouched.

**Acceptance:** Release A is live, reversible, read-only, and explicitly not a writer cutover.

### Task 7: Prepare final writer cutover domains separately

**Files:**
- Create: `docs/plans/identity-auth-cutover.md`
- Create: `docs/plans/team-player-guardian-consent-cutover.md`
- Create: `docs/plans/schedule-match-training-cutover.md`
- Create: `docs/plans/community-cutover.md`
- Create: `docs/plans/media-cutover.md`
- Create: `docs/plans/notifications-cutover.md`
- Create: `docs/migrations/identity-auth-contract.md`
- Create: `docs/migrations/team-player-guardian-consent-contract.md`
- Create: `docs/migrations/schedule-match-training-contract.md`
- Create: `docs/migrations/community-contract.md`
- Create: `docs/migrations/media-contract.md`
- Create: `docs/migrations/notifications-contract.md`

**Interfaces:**
- Consumes: Release A production comparison evidence, Task 1 restore proof, final V2 database/storage provider approval
- Produces: independently reversible domain cutover packages

- [ ] **Step 1: Provision and verify canonical V2 PostgreSQL and media infrastructure**

Use a separate V2 account/database/storage namespace. Verify encryption, backups, point-in-time recovery if purchased, least privilege, audit, region, retention, object versioning, and restore procedure before any data copy.

- [ ] **Step 2: Implement the canonical authorization model first**

Create organizations, memberships, scoped role grants with validity/revocation, typed guardian relationships, versioned consent, and audit events. Run the full AUTH/GUARD matrix in staging before a domain reads V2 authority.

- [ ] **Step 3: Migrate data domain by domain with mapping reviews**

For each domain: snapshot source, validate mapping, backfill non-authoritative copy, record run/checksum, compare counts/aggregates/permissions, handle duplicates/orphans as review queue, shadow read, and prove rollback.

- [ ] **Step 4: Implement Community safety before Community writes**

Add sanitizer/CSP, moderation/report/block/mute contract, stable deep links, count reconciliation, historical content review, media quarantine behavior, and all `COMM-*` tests. V1 remains writer until all pass.

- [ ] **Step 5: Implement media ownership and migration**

Run paired DB/media manifest, backup/restore, object copy, checksum/decode comparison, consent/privacy classification, signed delivery, retention/delete/quarantine, and `MEDIA-*` tests.

- [ ] **Step 6: Create a cutover package per domain**

Write the six files named above. Each package must define source/target owner, flag, mapping version, idempotency, comparison queries, authorization matrix, artifact hashes, data reconciliation, rollback, observation window, and named approvers.

**Acceptance:** Each domain independently reaches `DUAL_VERIFY` with no unresolved P0 mismatch. Do not combine all domains in one final switch.

### Task 8: Release B — final owner transfer and deployment

**Files:**
- Create: `docs/releases/RELEASE_B_FINAL_CUTOVER.md`
- Create: `docs/releases/RELEASE_B_ROLLBACK.md`
- Update: `docs/audit-live/IMPLEMENTATION_READINESS_REPORT.md`

**Interfaces:**
- Consumes: all Task 7 domain cutover packages with signed evidence
- Produces: V2 final writer ownership only for domains explicitly switched

- [ ] **Step 1: Run a pre-cutover freeze review**

Reconfirm source/target labels, backup/restore hashes, mapping versions, current DB schema, production release hash, flags, operator contacts, and stop conditions. Stop on any drift.

- [ ] **Step 2: Commit and tag only the approved domain set**

Use one scoped commit per domain: `release(v2): cut over identity auth ownership`, `release(v2): cut over team player guardian consent ownership`, `release(v2): cut over schedule match training ownership`, `release(v2): cut over community ownership`, `release(v2): cut over media ownership`, or `release(v2): cut over notifications ownership`. Do not include unrelated UI, docs, or Legacy files.

- [ ] **Step 3: Deploy with read switch before write switch**

Enable V2 reads for one approved domain, compare live results, then enable writes only after the comparison and authorization checks pass. Preserve V1 read fallback throughout the observation window.

- [ ] **Step 4: Verify data, permission, media, and notification outcomes**

Run the domain’s exact count/integrity checks, deny matrix, media checks, and client compatibility checks. Verify no writes reached an unapproved domain.

- [ ] **Step 5: Observe, close, or roll back**

If any mismatch, denial regression, missing media, rollback failure, or safety incident occurs, disable the V2 domain flag and follow its domain rollback package. Do not use a destructive schema reversal as the first response.

**Acceptance:** Only after every approved domain’s observation window closes with no unresolved mismatch may the release be called a final V2 cutover.

## Commit and deployment order

1. `docs(v2): record pre-implementation readiness gates`
2. `docs(v2): record approved production readiness evidence`
3. `build(v2): add isolated release and rollback controls`
4. `feat(v2): add read-only legacy adapter contracts`
5. `feat(v2): add read-only profile and schedule shell`
6. `test(v2): record read-only release staging gate`
7. `release(v2): read-only adapter and web shell` — Release A deployment
8. `release(v2): cut over identity auth ownership`, `release(v2): cut over team player guardian consent ownership`, `release(v2): cut over schedule match training ownership`, `release(v2): cut over community ownership`, `release(v2): cut over media ownership`, and `release(v2): cut over notifications ownership` — each gated and deployed separately
9. `release(v2): finalize verified ownership` — final Release B tag and release manifest after all six domain observation windows close

## Plan self-review

- Production DB, backup, restore, authorization, Community, media, deployment, secrets, adapter, rollback, test, commit, and release gates are covered.
- No task authorizes Legacy modification, blind production GET probing, direct V1 DB writes, secret copying, bulk migration, or automatic final cutover.
- Names in Tasks 3–4 match their consumers: allowlist, client, DTO mapper, error policy, query client, profile, schedule, and provenance views.
- `M2` and `M5` are deliberately different releases so read-only deployment cannot be mistaken for final ownership transfer.
