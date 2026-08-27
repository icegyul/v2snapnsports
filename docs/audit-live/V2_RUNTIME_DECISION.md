# V2 Runtime Decision

## Decision summary

### RECOMMENDED

| Layer | Decision | Reason |
|---|---|---|
| Web | React + Vite, new code in TypeScript strict mode | Preserves the proven frontend model while making adapter/auth DTO drift compile-visible |
| Router | React Router 6 compatible route model | Existing deep-link behavior and migration familiarity |
| Server state | TanStack Query behind a small V2 API client | Explicit stale/error/retry/cache policy for read adapters; no business rules in components |
| Local UI state | React state/context | No evidence requires another global-state library |
| PWA | Separate `/v2/` base and service-worker scope | Prevents collision with the live `/app/` PWA |
| Mobile | Keep `apps/mobile` boundary; do not point existing Capacitor shell to V2 yet | Web and native release evidence remain different |
| First backend | Thin PHP compatibility/BFF adapter with **GET-only allowlist** and no framework | Matches current Cafe24 deployment reality and avoids an unproven Node/server rewrite |
| Legacy source | Existing HTTPS V1 read endpoints first; direct DB access prohibited for slice 1 | Preserves V1 auth/write ownership and removes DB migration dependency from the first slice |
| Database | No V2 DB in slice 1; keep PostgreSQL as the later canonical target, not an immediate dependency | Operational schema/backup evidence is absent |
| API versioning | New canonical routes under `/api/v1/`, legacy `/api/*.php` unchanged | Matches the approved compatibility direction |
| Logging | Structured request/error/mismatch logs outside web root; request IDs; no tokens/PII | Required for adapter evidence and safe operations |

TypeScript is for new V2 source only. No Legacy conversion or wholesale copy is authorized.

### REJECTED

- Copying the V1 React/PHP tree into V2.
- Replacing React/Vite for fashion or convenience.
- A Node/Nest/Next backend before hosting, operations, and DB evidence exist.
- Direct browser access to MariaDB.
- Runtime DDL, auto-create tables, or migration-on-request.
- Redis, queue, worker, or object-storage dependency in the first read-only slice.
- Sharing or copying Legacy JWT/DB/OAuth secrets into V2 files.
- Pointing the current Capacitor production shell at an unverified V2 route.

### DEFERRED

- Exact PHP language/runtime baseline until production version/extensions are captured.
- PostgreSQL provisioning/schema tool and write ownership until DB/backup/restore gates pass.
- Redis and workers until measured use cases require them.
- V2 mobile release, native plugins, and store binaries until web slice/device QA.
- Provider-specific monitoring and secret-store product.

## Gate effect

The logical runtime is `CONTRACT_FROZEN`; the physical production runtime is still blocked. This decision alone does not make implementation safe.

