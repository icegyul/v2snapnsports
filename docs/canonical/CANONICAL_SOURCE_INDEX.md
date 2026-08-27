# SnapN Sports V2 Canonical Source Index

## Inventory boundary

- Inventory date: `2026-08-28 KST`
- V2 repository branch: `chore/import-canonical-specs`
- Copy policy: source files preserved; no move, delete, rename, content edit, or format conversion
- Content policy: implementation/design/contract packages only; no runtime code, DB data, secrets, IR decks, manuals, or production artifacts

## Status meanings

| Status | Meaning |
|---|---|
| `ACTIVE_CANONICAL` | Current SnapN Sports V2 implementation authority in the discovered local set |
| `SUPERSEDED` | Older document in the same lineage replaced by a newer discovered authority |
| `ARCHIVE` | Preserved historical package, not active implementation authority |
| `REFERENCE_ONLY` | Related independent product or external platform reference; cannot override SnapN Sports V2 |

## Active canonical sources

| File | Version | Domain | Source path | Destination path | Status | Supersedes | Notes |
|---|---|---|---|---|---|---|---|
| `SnapN_Sports_Codex_Master_Development_Package_v2.0.docx` | v2.0 | master | `/Volumes/740GB/## APP/Snapnsports v2_DOC/업데이트 1/SnapN_Sports_Codex_Master_Development_Package_v2.0.docx` | `docs/canonical/master/SnapN_Sports_Codex_Master_Development_Package_v2.0.docx` | `ACTIVE_CANONICAL` | Individual v1.0–v1.5 development guidelines, as declared inside the document | Integrated Phase 0–13 roadmap and Stadium/engine source package. SHA-256 `687cbf23479ecc36bfa79671b617f753d67c4e591e946e7a0921f7827d64a68d`. |
| `SnapN_Sports_Player_First_Execution_Development_Directive_v1.0_20260825.docx` | v1.0 / 2026-08-25 | codex | `/Volumes/740GB/웹/스냅엔스포츠cafe24-deploy/docs/SnapN_Sports_Player_First_Execution_Development_Directive_v1.0_20260825.docx` | `docs/canonical/codex/SnapN_Sports_Player_First_Execution_Development_Directive_v1.0_20260825.docx` | `ACTIVE_CANONICAL` | None | Explicitly states it is the execution companion to Master v2.0 and does not replace it. SHA-256 `48ea31f3aa2cc5b814419b4e7654928211f00a8a7619e280975e334e6142a16e`. |

## Reference-only sources

| File | Version | Domain | Source path | Destination path | Status | Supersedes | Notes |
|---|---|---|---|---|---|---|---|
| `ENGINE_CATALOG_v0.2.md` | Earthus v0.2 | earthus | `/Volumes/740GB/## APP/EARTHUS v2_APP/docs/earthus-v2/ENGINE/ENGINE_CATALOG_v0.2.md` | `docs/canonical/earthus/ENGINE_CATALOG_v0.2.md` | `REFERENCE_ONLY` | None | Earthus 2.0 catalog, not the missing SnapN Sports V2 Engine Catalog. SHA-256 `48e899eb73e4bd55bee51d02b092e213f54473d56660c9e3fa03b1303dd1fcbc`. |
| `ALGORITHM_CATALOG_v0.2.md` | Earthus v0.2 | earthus | `/Volumes/740GB/## APP/EARTHUS v2_APP/docs/earthus-v2/ALGORITHM/ALGORITHM_CATALOG_v0.2.md` | `docs/canonical/earthus/ALGORITHM_CATALOG_v0.2.md` | `REFERENCE_ONLY` | None | Earthus 2.0 catalog, not the missing SnapN Sports V2 Algorithm Catalog. SHA-256 `60f2e67a554dec48afc489d200c8522f14ea067d7c1f2db60715efecd47a68be`. |
| `EARTHUS_2.0_FINAL_MASTER_DEVELOPMENT_DIRECTIVE_v3.2_PAID_UX_GLOBAL_3D_CLOUD_HYBRID_NAS_ARCHIVE.docx` | Earthus v3.2 | earthus/archive | `/Volumes/740GB/## APP/EARTHUS v2_APP/docs/earthus-v2/MASTER_SPEC/EARTHUS_2.0_FINAL_MASTER_DEVELOPMENT_DIRECTIVE_v3.2_PAID_UX_GLOBAL_3D_CLOUD_HYBRID_NAS_ARCHIVE.docx` | `docs/canonical/archives/earthus-reference/EARTHUS_2.0_FINAL_MASTER_DEVELOPMENT_DIRECTIVE_v3.2_PAID_UX_GLOBAL_3D_CLOUD_HYBRID_NAS_ARCHIVE.docx` | `REFERENCE_ONLY` | Earthus earlier master documents only | External platform reference. It does not prove or replace a SnapN Earthus integration contract. SHA-256 `dcc49c243c4f7416c5748f6578b850560b2fc70e21ef5e921fe4af7c62767e50`. |
| `EARTHUS_2.0_ENGINE_FOUNDATION_v0.2_PRODUCTION_ARCHITECTURE_CORRECTION.zip` | Earthus v0.2 | earthus/archive | `/Volumes/740GB/## APP/EARTHUS v2_APP/docs/earthus-v2/FOUNDATION_PACKAGE/EARTHUS_2.0_ENGINE_FOUNDATION_v0.2_PRODUCTION_ARCHITECTURE_CORRECTION.zip` | `docs/canonical/archives/earthus-reference/EARTHUS_2.0_ENGINE_FOUNDATION_v0.2_PRODUCTION_ARCHITECTURE_CORRECTION.zip` | `REFERENCE_ONLY` | Earthus earlier foundation package only | Original ZIP preserved with extracted catalog references kept separately. SHA-256 `d87111dafc08cebdd4e4823bfd81e6982ac9575db97be13d1487fed9e4327e8b`. |
| `SNAPNSPORTS_TACTICS_1.0_최종_전체_개발계획서_150p.docx` | TACTICS v1.0 / 2026-08-21 | tactics/archive | `/Users/fiftyfy14/Downloads/SNAPNSPORTS_TACTICS_1.0_최종_전체_개발계획서_150p.docx` | `docs/canonical/archives/tactics-reference/SNAPNSPORTS_TACTICS_1.0_최종_전체_개발계획서_150p.docx` | `REFERENCE_ONLY` | None | Independent TACTICS product plan; not a main V2 domain contract. SHA-256 `9703eeb03eae0a9c13fea01acc72ac5154207d077fa3ce8774914e383edf53dc`. |
| `SNAPNSPORTS_TACTICS_1.0_TACTICAL_ENGINE_대규모_기술명세서.docx` | TACTICS v1.0 | tactics/archive | `/Users/fiftyfy14/Downloads/SNAPNSPORTS_TACTICS_1.0_TACTICAL_ENGINE_대규모_기술명세서.docx` | `docs/canonical/archives/tactics-reference/SNAPNSPORTS_TACTICS_1.0_TACTICAL_ENGINE_대규모_기술명세서.docx` | `REFERENCE_ONLY` | None | Independent deterministic tactical-engine specification. SHA-256 `2a8c5bef83c6dbb550960f1c28b87fd3e2fa7c444d7982de6116c2a12d6e80d9`. |
| `SNAPNSPORTS_TACTICS_1.0_개발기준_1페이지.docx` | TACTICS v1.0 | tactics/archive | `/Users/fiftyfy14/Downloads/SNAPNSPORTS_TACTICS_1.0_개발기준_1페이지.docx` | `docs/canonical/archives/tactics-reference/SNAPNSPORTS_TACTICS_1.0_개발기준_1페이지.docx` | `REFERENCE_ONLY` | None | Independent TACTICS product summary. SHA-256 `009a60d4196b18efb9310387fdff713e2a41ff6a703933c65f957a3d3b1f8cdd`. |
| `SNAPNSPORTS_TACTICS_2단계_개발지시서_실제웹앱_UI예시_최종.docx` | TACTICS Phase 2 / 2026-08-23 | tactics/archive | `/Users/fiftyfy14/Downloads/SNAPNSPORTS_TACTICS_2단계_개발지시서_실제웹앱_UI예시_최종.docx` | `docs/canonical/archives/tactics-reference/SNAPNSPORTS_TACTICS_2단계_개발지시서_실제웹앱_UI예시_최종.docx` | `REFERENCE_ONLY` | Extends TACTICS v1.0 | Independent TACTICS data-layer directive. SHA-256 `46383dcb335a19a02ee15c5d7e1e376a468d5af992a25958c37d4089d3d326a6`. |

## Duplicate source copies

Only one byte-identical copy is stored in `docs/canonical/`. Every duplicate source remains untouched.

| Logical file | Primary source | Duplicate source path(s) | Hash result |
|---|---|---|---|
| SnapN Master v2.0 | `/Volumes/740GB/## APP/Snapnsports v2_DOC/업데이트 1/...` | `/Volumes/740GB/웹/스냅엔스포츠 개발계획 822/...`; `/Volumes/740GB/웹/개발/...` | 3/3 identical: `687cbf…a68d` |
| Earthus Engine Catalog v0.2 | `/Volumes/740GB/## APP/EARTHUS v2_APP/docs/earthus-v2/ENGINE/...` | `FOUNDATION_PACKAGE/DOCUMENTATION/...`; `/Volumes/740GB/웹/Earthus V2.0/기획/826/...` | 3/3 identical: `48e899…fcbc` |
| Earthus Algorithm Catalog v0.2 | `/Volumes/740GB/## APP/EARTHUS v2_APP/docs/earthus-v2/ALGORITHM/...` | `FOUNDATION_PACKAGE/DOCUMENTATION/...`; `/Volumes/740GB/웹/Earthus V2.0/기획/826/...` | 3/3 identical: `60f2e6…8be` |
| Earthus Master v3.2 | `/Volumes/740GB/## APP/EARTHUS v2_APP/docs/earthus-v2/MASTER_SPEC/...` | `/Volumes/740GB/웹/Earthus V2.0/기획/826/...` | 2/2 identical: `dcc49c…e50` |
| Earthus Foundation ZIP v0.2 | `/Volumes/740GB/## APP/EARTHUS v2_APP/docs/earthus-v2/FOUNDATION_PACKAGE/...` | `/Volumes/740GB/웹/Earthus V2.0/기획/826/...` | 2/2 identical: `d87111…e8b` |

## Precedence rules

1. Master v2.0 is the highest discovered SnapN Sports V2 product/development authority.
2. Player-first v1.0 is an active execution companion and cannot override Master v2.0.
3. TACTICS documents remain an independent product reference and do not define main V2 IDs, DB, API, roles, or deployment.
4. Earthus files remain external platform references. They cannot be treated as a discovered `SNAPN_SPORTS_V2_EARTHUS_CONTEXT_INTEGRATION_SPEC`.
5. None of the missing v1.4–v1.7 files may be reconstructed, renamed, or inferred from these references.

## Excluded candidate classes

- IR/business decks and app/training manuals: product communication, not implementation authority.
- Patent packages: legal/IP material, not runtime contract.
- V1 source, production artifacts, `.deploy_backup`, runtime media, and configs: prohibited by task scope.
- Memory/rollout summaries: secondary records, not original canonical sources.
- Current V2 audit documents: remain under `docs/audit*`; they are evidence/gates, not imported canonical packages.
