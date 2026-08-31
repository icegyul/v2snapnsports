# SnapN Sports V2 Foundation

## Claude Code handoff

2026-08-31 Stadium continuation은 다음 문서부터 읽는다.

- [`README_FIRST_CLAUDE_CODE_KO.md`](README_FIRST_CLAUDE_CODE_KO.md)
- [`HANDOFF/UPDATE_REASON_AND_FAILURE_RECORD_KO.md`](HANDOFF/UPDATE_REASON_AND_FAILURE_RECORD_KO.md)
- [`HANDOFF/CLAUDE_CODE_DEVELOPMENT_DIRECTIVE_KO.md`](HANDOFF/CLAUDE_CODE_DEVELOPMENT_DIRECTIVE_KO.md)
- [`HANDOFF/CLAUDE_CODE_HANDOFF_KO.md`](HANDOFF/CLAUDE_CODE_HANDOFF_KO.md)
- [`HANDOFF/API_AND_PASSWORD_LOCATION_GUIDE_KO.md`](HANDOFF/API_AND_PASSWORD_LOCATION_GUIDE_KO.md)

This directory is the new V2 project boundary. The legacy V1 checkout remains read-only and is used only as an evidence source until an approved cutover.

## Current status

- Phase: `AUDIT_AND_FOUNDATION_ONLY`
- V1 source: `/Volumes/740GB/웹/스냅엔스포츠cafe24-deploy`
- V2 root: `/Volumes/740GB/## APP/Sanpnsports v2_app`
- Production DB/API migration: not started
- User data movement: not started
- Community write-owner cutover: not started
- V2 implementation readiness: see `docs/audit/MASTER_GAP_ANALYSIS_v2.md`

## Architecture decision at this stage

No framework replacement is approved. The audited V1 authoring frontend is React 18 + Vite 5 with a Capacitor 7 shell, while the operational API staging area is action-oriented PHP for Cafe24. V2 keeps the requested monorepo boundary, but this foundation intentionally contains no package manifest, runtime code, database migration, or deployment configuration until the production DB, authentication contract, Community parity, and write-ownership gates are closed.

## Directory roles

| Directory | Foundation responsibility |
|---|---|
| `apps/web` | New Graphite Stadium web shell after architecture approval |
| `apps/mobile` | Mobile shell and native-only integration after Capacitor strategy approval |
| `backend` | New backend or compatibility adapters after server/runtime decision |
| `packages` | Proven shared contracts and framework-independent utilities only |
| `infrastructure` | Environment and deployment definitions; no credentials |
| `scripts` | Migration, verification, and operational tools after review |
| `tests` | Contract, permission, parity, migration, and end-to-end checks |
| `docs/audit` | V1 evidence and V2 migration gate documents |

## Non-negotiable product constraints

- V1 is never modified, moved, renamed, reformatted, installed, or built by V2 work.
- Community behavior and data meaning remain owned by V1 until parity and dual verification pass.
- `EPTS`, `CAMERA_AI`, and `SPORTS_AI` stay disabled in production UI. No placeholder metrics or sample analysis.
- Graphite Stadium UI uses `#121416`, `#1C2023`, `#282D31`, and `#353C41` surfaces, `#F4F6F7` primary text, `#B8C0C5` secondary text, and `#62D36D` accent.
- Every 3D flow requires functionally equivalent 2D or static fallback.
- Secrets, real `.env` values, credentials, certificates, production data, build output, and legacy backups are excluded.

## Read first

1. `docs/audit/LEGACY_SYSTEM_INVENTORY.md`
2. `docs/audit/REUSE_MIGRATION_MATRIX.md`
3. `docs/audit/WRITE_OWNERSHIP_MAP.md`
4. `docs/audit/RISK_REGISTER.md`
5. `docs/audit/MASTER_GAP_ANALYSIS_v2.md`

## Next allowed phase

The next phase may add contracts and failing tests only after the blockers in `MASTER_GAP_ANALYSIS_v2.md` are accepted. No production write, DB migration, Community cutover, or user-data copy is authorized by this scaffold.
