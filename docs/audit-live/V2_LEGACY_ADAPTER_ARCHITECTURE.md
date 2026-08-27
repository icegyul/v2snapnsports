# V2 Legacy Adapter Architecture

## Boundary

```text
V2 UI
 -> V2 API client
 -> /api/v1 read adapter
    -> method/path/query allowlist
    -> forward current auth proof without persistence/logging
    -> V1 HTTPS GET endpoint
    -> validate legacy envelope/schema
    -> authorize/field-allowlist where required
    -> canonical DTO + provenance
 -> V2 read model in memory
```

## First-mode rules

- Only allowlisted `GET`/read operations.
- Never call endpoints whose GET path increments counts until that side effect is separately approved; Community detail is excluded initially.
- No DB client, DDL, file write, shadow write, queue, or V2 persistence.
- V1 remains the only identity/domain/Community/media writer.
- The adapter does not include/import Legacy PHP source and does not modify Legacy files.
- Unknown/malformed/missing values remain explicit; no demo or fabricated fallback.
- Canonical DTOs carry source system, source ID, capture time, and mapping version.

## Trust boundary

- Authentication proof is opaque to the adapter and sent only to the approved same-origin V1 endpoint.
- The adapter validates destination paths to prevent SSRF/path injection.
- Sensitive resources require current V1 authorization plus V2 field allowlists; this is transitional, not the final V2 policy engine.
- Tokens, raw response bodies containing PII, and secret values are never logged.

## Observability

Record request ID, route, legacy status, latency bucket, mapping version, result class, and sanitized mismatch code. Record no token, password, raw private body, or full media URL with sensitive query material.

## Failure mode

Fail closed according to `ADAPTER_ERROR_POLICY.md`. The UI shows unavailable/permission/error state and a safe V1 fallback link where applicable. It never shows simulated data.

