# Adapter Test Plan

## Contract fixtures

- Sanitized success/error fixtures for user, player, team, guardian, match schedule, and training schedule.
- Missing optional fields, nulls, zero values, entity-encoded names, unknown roles/statuses, and unexpected extra fields.
- Legacy `{success,data}` and error envelopes plus non-JSON/HTML failure.

## Security and method tests

1. Only approved GET paths are reachable.
2. Query keys/IDs are allowlisted and numeric/string formats constrained.
3. POST/PUT/PATCH/DELETE and Community detail are rejected in slice 1.
4. Destination host/path is fixed; no SSRF/open proxy.
5. Token is forwarded only to the approved V1 origin and never logged.
6. Public DTOs exclude internal/member/private fields.
7. 401/403 clears or prevents private cached data.

## Mapping tests

- Preserve all legacy IDs without collision.
- Prefix schedule union IDs.
- Guardian type remains `UNKNOWN`.
- Legacy role remains evidence and never becomes a V2 grant.
- Unknown/malformed status does not default to approved/active.
- Timezone/source time uncertainty remains explicit.
- Partial data follows `ADAPTER_ERROR_POLICY.md`.

## Reliability tests

- Timeout, DNS failure, 500, malformed JSON, schema drift, slow response, aborted request, and one safe GET retry.
- Public stale fallback is visibly labeled; private stale fallback is impossible.
- Feature kill switch returns users to V1 without data write/reconciliation.

## Verification levels

| Level | Evidence |
|---|---|
| Unit | DTO validators/mappers and error/cache policy |
| Contract | Sanitized Legacy fixtures |
| Integration | Stub V1 server and exact HTTP behavior |
| Staging | Real auth roles and cross-team/cross-tenant deny matrix |
| Production canary | Read-only sampled comparisons and logs; no write |

No integration level may be claimed by unit fixtures alone.

