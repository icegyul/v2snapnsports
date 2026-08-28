# 09. IMPLEMENTATION ORDER — KO

## Sequential apply

### P0 — Core UI completion
Apply the already prepared Core UI remaining package. Do not add Pack domain writes yet.

### P1 — API/OpenAPI reconciliation
1. Adopt `yaml/SNAPN_SPORTS_V2_OPENAPI_RECONCILED_MERGED.yaml` as the proposed local physical contract.
2. Generate/update clients and server interfaces.
3. Do not mount DEFERRED/REJECTED routes.
4. Keep aliases only in adapters; do not expose duplicate logical/physical public routes.

### P2 — Shared authorization / safety foundation
Authorization → RoleGrant → Guardian/Consent → Safeguarding → Audit → Feature Flags → Offline/Outbox.

### P3 — PACK 01
Schedule / Training / Match / Tactics. Apply four-schema draft only after local migration review. `POST /v2/matches` remains deferred.

### P4 — PACK 02
Career / Communication / Scouting / Opportunity / Portfolio. Use physical `/career`, `/communication`, `/opportunities` roots. Do not create `/agent/players`, `/comms/unread`, or separate scouting verb endpoints.

### P5 — PACK 03
Role-based workspace projection only. No duplicate domain state or security policy.

### P6 — PACK 04
Admin read models + minimal audited mutations. No production migration/delete/media mutation. Community write-owner gate preserved.

### P7 — Cross-pack integration
Connect Training/Match → Career, domain → workspaces, verification → RoleGrant, safety → all contact/share paths, Earthus → schedule/training/match soft context.

### P8 — Engine / Algorithm implementation audit
Re-run status from actual code. Do not convert ACCOUNTED to IMPLEMENTED automatically.

### P9 — Full local acceptance
Run compile/tests/OpenAPI validation, local migration rehearsal, permission matrix, offline replay, Earthus soft failure.

## Commit plan

1. `chore: reconcile V2 API and schema contracts`
2. `feat: implement shared authorization and safety foundation`
3. `feat: implement training match and tactics pack`
4. `feat: implement football life pack`
5. `feat: implement manager workspaces pack`
6. `feat: implement admin ops and safety pack`
7. `test: add cross-pack acceptance coverage`
8. `docs: finalize engine and algorithm implementation map`

No giant commit. No push/merge/deploy unless separately authorized.
