# P2 shared authorization / safeguarding / audit result

Status: `LOCAL_SHARED_POLICY_FOUNDATION / NOT_DEPLOYED` · 2026-08-28 KST

## Canonical single owner

- Decision owner: `packages/shared-security/authorization.ts`
- Backend authorization seam: `backend/src/shared/authorization/index.ts`
- Backend audit seam: `backend/src/shared/audit/index.ts`
- Frontend `apps/web/src/lib/sharedAuthorization.ts` only re-exports shared types/functions for UX projection. It is not an authority boundary.

## Protected operation coverage

| Metric | Count |
| --- | ---: |
| Total reconciled operations | 73 |
| Public | 2 |
| Authenticated | 22 |
| Protected | 49 |
| Accounted | 73 |
| Missing policy | 0 |
| Missing backend binding | 0 |
| Missing audit classification | 0 |
| Admin-scope + required audit | 10 |

The full inventory is [P2_PROTECTED_OPERATION_POLICY_MAP.md](P2_PROTECTED_OPERATION_POLICY_MAP.md). Every protected entry has shared gate requirements, an `INTERFACE_ONLY` backend binding, one audit classification, and a future domain-policy seam. This does not activate handlers or PACK behavior.

## Security behavior

- RolePreference never satisfies VerifiedRoleGrant.
- Tenant, team/resource, player self, guardian relation, consent revocation, safeguarding, and hard feature gates deny before domain behavior.
- Agent/referee direct minor interactions are denied by the shared gate.
- Audit records retain request/actor/tenant/resource/action/decision/reason only; raw JWT, secret, private body, and media content are excluded.

## P3 prerequisite

PACK 01 use cases must consume the `TrainingPolicy`/`MatchPolicy` seams and shared authorization binding before any local fixture or future handler performs a domain mutation.
