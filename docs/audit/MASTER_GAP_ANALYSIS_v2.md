# SnapN Sports V2 Master Gap Analysis

## Executive status

The V1 repository contains a broad working foundation and operational delivery tooling, but it is not safe to copy as V2. The local evidence is sufficient to define selective-migration boundaries and a neutral V2 scaffold. It is not sufficient to begin production DB migration, transfer Community write ownership, activate a new backend, or move user data.

**SAFE TO START V2 IMPLEMENTATION: NO**

Implementation here means production-capable runtime/domain work. Documentation, contract capture, read-only inventory, failing tests, and non-writing UI prototypes remain eligible after explicit scope review.

## V1 evidence summary

| Area | Confirmed locally | Not verified |
|---|---|---|
| Frontend | React 18, Vite 5, React Router 6, PWA/Workbox, Capacitor 7 | current production artifact hashes and authenticated browser behavior |
| Backend | 105 PHP endpoint files, mysqli/JWT helper calls | current server runtime/config and full live API behavior |
| Database | 29 migration files, 76 explicit `sn_*` table-reference candidates | production schema, counts, indexes, constraints, applied ledger |
| Runtime schema | 58 API files with 126 DDL matches | exact current request-dependent shape |
| Routes | 63 registry matches including custom/hidden paths | every live route and permission result |
| Community | posts, flat comments, likes, cards, adjacent content, dev requests | historical HTML safety, full pagination, moderation and parity |
| Media | local card/photo/logo files and URL metadata | complete manifest, CDN, backup, retention, privacy lifecycle |
| Deployment | guarded web/API/Tactics scripts | current host state, locks, hashes, live release result |

## V1 versus V2 architecture

| Concern | V1 | V2 direction | Gap |
|---|---|---|---|
| App shell | legacy shared shell/navigation | Graphite Stadium and role-specific shell | new design/contracts/tests |
| Player navigation | broad legacy registry | HOME/TRAINING/COMMUNITY/VIDEO/MORE | information architecture and deep-link compatibility |
| Player home | dashboards and hidden Stadium slices | My Football World/Spatial Home | data contracts, 2D fallback, performance/accessibility |
| Manager UX | title/group/menu-derived workspaces | explicit manager role workspace | scoped server permission model |
| Community | V1 data/behavior | new UI, same meaning/parity | parity fixtures, moderation, sanitization, cutover |
| Backend | action PHP endpoints with runtime DDL | compatibility layer plus approved target runtime | architecture/runtime/deployment decision |
| Data | current IDs and drifted schema | preserved IDs and canonical scoped model | live inventory, mapping, backup/restore, ledger |
| Media | public web-root paths | explicit object/ownership/retention model | manifest, storage decision, compatibility adapter |
| Native | Capacitor live PWA shell | separate web/mobile release concerns | native strategy and device QA |
| TACTICS | independent product plus legacy in-app code | contract-only integration | identity exchange and boundary tests |

## Blockers by domain

### 1. Production evidence

- Current production app/API hashes are not captured.
- Production DB schema, counts, engines, indexes, constraints, and migration state are unknown.
- Backup and isolated restore have not been rehearsed.
- Current provider dependencies, quotas, rights, and OAuth production status are unknown.

### 2. Authentication and permissions

- JWT algorithm/lifetime/rotation/revocation and denied-member recheck are unknown.
- Global groups, admin flags, account type/title, team roles, guardian links, and minor consent overlap.
- Authenticated cross-team/cross-tenant object matrix is incomplete.
- Public/internal field allowlists need current verification.

### 3. Community parity and safety

- No V2 implementation or contract fixture set exists.
- The current UI loads only the default first page despite backend pagination.
- Stored post/news HTML is rendered as HTML; historical sanitization and CSP are unproven.
- Threaded replies, deletion/hidden states, report/moderation, block, mute, and audience visibility are absent in audited paths.
- Media, notification, count, retry, concurrent ordering, and deep-link parity are unverified.

### 4. Database migration

- Core base schema is incomplete and request-time DDL is widespread.
- No authoritative applied ledger/checksum history exists.
- Organization, Season, scoped roles, guardian types, typed consent, audit, and membership history require additive target contracts.
- Unknown mappings must remain review states rather than inferred assignments.

### 5. Media

- No complete file/DB manifest, object ownership, retention, quarantine, CDN, or restore contract.
- Public paths and minor media require privacy/consent classification.
- Main-app video upload/transcode/export is not implemented as a production pipeline.

### 6. Platform and delivery

- V2 hosting/backend/workspace tools are not approved.
- Service-worker and old/new client overlap need explicit tests.
- API file rollback does not cover DB/data effects.
- Web and native store release evidence must remain separate.

## Foundation decision

The requested directory structure is accepted as a neutral monorepo boundary. No framework, workspace tool, package manifest, backend runtime, database client, deployment provider, or storage SDK is pinned in this phase. This avoids an evidence-free rewrite while preserving clear future boundaries.

## Hard-disabled features

`EPTS`, `CAMERA_AI`, and `SPORTS_AI` remain disabled. V2 has no menu, metric, sample analysis, placeholder card, or configuration that activates them. Optional adapter seams may be specified later only after a separate approval and evidence plan.

## Required next phase

### Phase 0A: production characterization

1. Approve and capture read-only server/DB inventory.
2. Create encrypted backup and complete isolated restore rehearsal.
3. Capture current app/API/media manifests and sanitized provider dependency facts.
4. Reconcile the 29 local migrations, runtime DDL, and actual production shapes.

### Phase 0B: contracts and failing tests

1. Authentication/session and old-client compatibility fixtures.
2. Player–Guardian–Team and cross-tenant permission matrix.
3. Community parity, HTML/media, order/pagination/count, notification, and moderation contracts.
4. Media ownership/retention/restore contracts.
5. V1 read-only adapter interfaces and write-ownership flags.

### Phase 0C: architecture approval

Choose the web workspace, mobile shell strategy, backend compatibility/runtime, database migration tool, object storage, observability, secret store, and deployment topology using the captured operational evidence. Then write the first implementation plan for a read-only V2 slice.

## Conditions for changing status to YES

- production inventory and migration ledger reconcile;
- encrypted backup restores cleanly in isolation;
- authentication/session and permission policies are approved and tested;
- Community behavior and moderation scope are complete and testable;
- media ownership, privacy, storage, and restore are approved;
- target runtime/deployment supports atomic rollback and old-client overlap;
- V1/V2 write-owner switches and audit/mismatch evidence are specified;
- the first slice contains no hard-disabled feature activation or fabricated data.

Until all required conditions for the chosen slice pass, V1 remains authoritative and V2 remains a scaffold/documentation boundary.
