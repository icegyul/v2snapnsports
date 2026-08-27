# Adapter Error Policy

| Condition | V2 status | Stable code | UI behavior |
|---|---:|---|---|
| No/invalid/expired auth | 401 | `AUTH_REQUIRED` / `AUTH_INVALID` | Login/reauth; no cached private data |
| V1 denies scope | 403 | `LEGACY_SCOPE_DENIED` | Permission state; no detail leak |
| Resource absent | 404 | `RESOURCE_NOT_FOUND` | Not-found state |
| Validation/query rejected | 422 | `REQUEST_INVALID` | Safe field-level message |
| V1 conflict | 409 | `LEGACY_CONFLICT` | Read slice normally should not emit |
| V1 timeout/DNS/5xx | 503 | `LEGACY_UNAVAILABLE` | Explicit unavailable, safe V1 retry/fallback link |
| Non-JSON/wrong envelope | 502 | `LEGACY_CONTRACT_INVALID` | Stop rendering affected model; alert |
| Schema/DTO validation fails | 502 | `ADAPTER_MAPPING_INVALID` | No partial synthetic object |
| Policy cannot resolve | 403 | `AUTHORIZATION_UNKNOWN` | Fail closed |

## Rules

- No raw PHP/SQL/stack/config error reaches the client.
- Preserve a request ID and sanitized upstream status/route in protected logs.
- Never log Bearer/X-Auth token, passwords, OAuth values, private response bodies, or media binary.
- Retry only idempotent GETs, at most once, with bounded jitter; never retry 401/403/404/422.
- A malformed optional child object may be omitted only if the parent explicitly records `partial=true` and a stable missing reason; identity/authorization objects never degrade partially.
- No demo/static fallback masquerades as legacy data.

