# SnapN Sports V2 Canonical Source Index

## Authority and scope

- Canonical source added on `2026-08-28 KST`: `/Volumes/740GB/## APP/Snapnsports v2_DOC/chatgpt_canonical_import`
- Source packages were copied byte-for-byte. `.DS_Store` was excluded; it is not a source document.
- `CANONICAL_SOURCE_MANIFEST.tsv` records every one of the 266 source-package files with source path, copied destination, version, and status.
- The earlier Mac-wide discovery remains preserved. Its external Earthus and independent TACTICS materials remain reference only.

## Status meanings

| Status | Meaning |
|---|---|
| `ACTIVE_CANONICAL` | Current authority for the stated V2 domain |
| `SUPERSEDED` | Retained previous lock with a newer active lock |
| `ARCHIVE` | Original baseline package retained without becoming the current authority |
| `REFERENCE_ONLY` | Related source that cannot override SnapN Sports V2 contracts |

## Active canonical set

| Domain | Version | Source package/file | Destination | Status | Supersedes | Notes |
|---|---|---|---|---|---|---|
| Product master | v2.0 | `SnapN_Sports_Codex_Master_Development_Package_v2.0.docx` | `docs/canonical/master/SnapN_Sports_Codex_Master_Development_Package_v2.0.docx` | `ACTIVE_CANONICAL` | earlier integrated development guidelines | Highest discovered product/program master. |
| Physical implementation baseline | v1.4 | `snapn_v2_implementation_lock_v1_4` | `docs/canonical/master/v1.4/`, `api-db/v1.4/`, `community/v1.4/`, `migration/v1.4/`, `operations/v1.4/`, `testing/v1.4/`, `codex/v1.4/` | `ACTIVE_CANONICAL` | v1.3 physical contract gaps | Current discovered PostgreSQL/OpenAPI/UI/Community/migration/release baseline. |
| Backend | v1.5 | `SNAPN_SPORTS_V2_BACKEND_IMPLEMENTATION_LOCK_v1.5` | `docs/canonical/backend/v1.5/` | `ACTIVE_CANONICAL` | v1.4 backend planning layer | Blueprint, acceptance gate, error/event/cache registries, reference scaffold, and immutable v1.4 baseline. |
| Frontend/visual | v1.7 | `snapn_v2_frontend_visual_lock_v1_7` | `docs/canonical/frontend/v1.7/`, `visual/v1.7/`, `testing/v1.7/`, `codex/v1.7/` | `ACTIVE_CANONICAL` | v1.6 frontend lock | Graphite Stadium visual lock; v1.7 explicitly replaces dark navy as V2 default. |
| Core UI implementation | final | `update/SNAPN_SPORTS_V2_CORE_UI_IMPLEMENTATION_PACK_KO_FINAL` (11 required files) | `docs/canonical/core-ui/` | `ACTIVE_IMPLEMENTATION_CONTRACT` | F0 display and route skeleton | Final Core UI implementation contract for the V2 fixture-only product slice. Intake remains preserved and is never imported at runtime. |
| Core UI remaining implementation | remaining | `update/SNAPN_SPORTS_V2_CORE_UI_REMAINING_PACK_KO.zip` | `docs/canonical/core-ui/remaining/` and `archives/core-ui/` | `ACTIVE_IMPLEMENTATION_CONTRACT` | F0 remaining UI gaps | Byte-verified remaining contract pack. ZIP archive is retained; extracted documents and contract skeletons are canonical implementation input only. |
| PACK 01~04 reconciliation intake | 2026-08-28 | `update/SNAPN_SPORTS_V2_PACKS_01_04_RECONCILIATION_KO.zip` | `docs/canonical/archives/packs-01-04/` | `REFERENCE_ONLY` | None | Original PACK reconciliation intake retained byte-for-byte. The derived final reconciliation layer is in `docs/implementation/SNAPN_SPORTS_V2_PACKS_01_04_FINAL_RECONCILIATION_KO/` and cannot override physical v1.4 contracts. |
| Engine catalog | v1.3 | `SNAPN_SPORTS_V2_ENGINE_CATALOG_v1.3.*` | `docs/canonical/engines/v1.3/` | `ACTIVE_CANONICAL` | None discovered | Latest discovered SnapN engine catalog. |
| Algorithm catalog | v1.3 | `SNAPN_SPORTS_V2_ALGORITHM_CATALOG_v1.3.*` | `docs/canonical/algorithms/v1.3/` | `ACTIVE_CANONICAL` | None discovered | Latest discovered SnapN algorithm catalog. |
| Engine dependency map | v1.3 | `SNAPN_SPORTS_V2_ENGINE_DEPENDENCY_MAP_v1.3.*` | `docs/canonical/engines/v1.3/` | `ACTIVE_CANONICAL` | None discovered | Remains the named dependency-map authority. |
| Football Life | v1.3 | `SNAPN_SPORTS_V2_FOOTBALL_LIFE_ARCHITECTURE_v1.3.*` | `docs/canonical/football-life/v1.3/` | `ACTIVE_CANONICAL` | None discovered | Latest discovered SnapN Football Life architecture. |
| Earthus context | v1.3 | `SNAPN_SPORTS_V2_EARTHUS_CONTEXT_INTEGRATION_SPEC_v1.3.*` | `docs/canonical/earthus/v1.3/` | `ACTIVE_CANONICAL` | None discovered | SnapN integration specification; this replaces the prior unresolved status. |
| Player-first execution | v1.0 | `SnapN_Sports_Player_First_Execution_Development_Directive_v1.0_20260825.docx` | `docs/canonical/codex/SnapN_Sports_Player_First_Execution_Development_Directive_v1.0_20260825.docx` | `ACTIVE_CANONICAL` | None | Execution companion; it cannot override v1.4/v1.5/v1.7 implementation locks. |

## Archived and superseded package set

| Source package | Destination | Status | Reason |
|---|---|---|---|
| `SNAPN_SPORTS_V2_DEVELOPMENT_PACKAGE_v1.3` | `docs/canonical/archives/chatgpt-source/v1.3/` | `ARCHIVE` | Original v1.3 package retained. Domain documents with no later named successor are also copied into their active domain folders. |
| `snapn_v2_implementation_lock_v1_4` | `docs/canonical/archives/chatgpt-source/v1.4/` | `ARCHIVE` | Original physical-lock package retained; its current baseline contracts are also copied by domain. |
| `snapn_v2_frontend_lock_v1_6` | `docs/canonical/archives/chatgpt-source/v1.6/` | `SUPERSEDED` | v1.7 states that visual/frontend lock is current and preserves v1.6 product/route/feature rules. |
| `SNAPN_SPORTS_V2_BACKEND_IMPLEMENTATION_LOCK_v1.5/00_BASELINE_V1.4` | `docs/canonical/backend/v1.5/00_BASELINE_V1.4/` | `ARCHIVE` | Immutable v1.4 dependency retained inside current backend package. |
| `snapn_v2_frontend_visual_lock_v1_7/00_BASELINE_CONTRACTS` | `docs/canonical/frontend/v1.7/00_BASELINE_CONTRACTS/` | `ARCHIVE` | v1.3/v1.4/v1.5 baseline contracts retained inside current frontend package. |

## Reference-only preservation

| Source | Destination | Status | Notes |
|---|---|---|---|
| Earthus v0.2 Engine/Algorithm catalogs and foundation package | `docs/canonical/earthus/` and `archives/earthus-reference/` | `REFERENCE_ONLY` | External platform reference. It cannot override `EARTHUS_CONTEXT_INTEGRATION_SPEC_v1.3`. |
| Independent SNAPNSPORTS TACTICS documents | `docs/canonical/archives/tactics-reference/` | `REFERENCE_ONLY` | Independent product boundary; it cannot define main V2 IDs, DB, API, or deployment. |

## Duplicate handling

- The preexisting Master v2.0 has three byte-identical source copies; one selected copy remains active.
- Earthus v0.2 reference documents also had byte-identical duplicate copies; one selected copy remains reference-only.
- v1.3/v1.4 documents intentionally appear both in their preserved package archive and, where still authoritative, in their active domain directory. This is provenance duplication, not a version conflict.

## Read order

1. Master v2.0 product/program direction.
2. v1.4 implementation baseline for API, DB, migration, Community, operations, and test/release.
3. v1.5 backend implementation lock.
4. v1.7 frontend visual/implementation lock.
5. v1.3 engine, algorithm, dependency, Football Life, and Earthus integration documents where no later named successor exists.
