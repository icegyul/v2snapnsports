# Core UI and F0 delta

Status date: 2026-08-28 KST. This comparison preserves the F0 foundation and records only the V2 implementation work needed by the final Core UI contract.

| Area | Existing F0 | Disposition | Product-slice action |
| --- | --- | --- | --- |
| React/Vite/PWA runtime | Strict TypeScript Vite runtime and PWA build | KEEP | Retain scripts and Capacitor-compatible configuration. |
| Graphite tokens | v1.7 base tokens | ADAPT | Apply final Core UI text/accent values and responsive surface rules. |
| Legacy adapters | Fixture adapter plus disabled production stub | KEEP | Retain unchanged; add a separate fixture Core Product read-model adapter. |
| Auth and roles | Public role shell and grant skeleton | ADAPT | Enforce PLAYER/MANAGER preference-only public selection and scope-deny decisions. |
| Stadium flow | F0 home and static fallback | REPLACE | Add the final exterior → approach → pitch entry → position → formation → spatial sequence. |
| 3D support | Render-mode resolver | ADAPT | Add renderer/scene interface with STATIC parity; no final asset simulation. |
| Player formation | Slot mapper | ADAPT | Use privacy-safe position markers and team formation projection. |
| Training/video/career | Generic route shells | REPLACE | Add fixture-backed read surfaces and explicit unavailable/empty states. |
| Community | No-write ownership boundary | ADAPT | Add synthetic local product UI and safety model only; no production API, cutover, or Legacy ownership change. |
| State handling | Basic route state panel | ADAPT | Reuse and add Core state boundary for all main pages. |
| Manager workspaces | Route/authorization foundations | KEEP | Keep deny-by-default only; no unverified workspace data. |
| API/backend | Disabled production client and module seams | KEEP | No production binding, DB, event job, or migration. |
| Core UI package files not supplied | README references supplemental Community/Manager/state-catalog files | MISSING | Do not invent operating policy, production grants, moderation SLA, or media rights from their absence. |
| Remaining Core UI pack | Fixture-only contracts, tests, and apply directive | ADAPT | Map types into existing V2-owned contracts and adapter; retain ZIP and copied package as canonical input, never a runtime import. |
