# V2 Storage Decision

## RECOMMENDED

### Slice 1

- No V2 database or object persistence.
- Browser query cache only, governed by `ADAPTER_CACHE_POLICY.md`.
- Structured logs/mismatch reports outside the web root with rotation and redaction.
- Legacy data/media remain authoritative and are read through adapters.

### Later canonical data

- Keep PostgreSQL as the canonical V2 target after the live MariaDB inventory and restore gate.
- Preserve legacy numeric IDs as explicit source keys; do not regenerate identities.
- Use additive canonical entities for organization, memberships, role grants, guardian relationships, consent, audit, and migration mappings.

### Later media

- S3-compatible, versioned, encrypted private object storage.
- CDN only for approved public derivatives.
- Signed/authorized delivery for private/minor objects.
- Lifecycle/retention, quarantine, restore, and old-URL compatibility are mandatory.

## REJECTED

- New V2 writes to the Legacy MariaDB.
- A local web-root `/files/` clone as the new media architecture.
- Public-bucket minor/private media.
- Redis as the source of truth.
- Cache entries that carry authority or outlive role/consent revocation.

## DEFERRED

- PostgreSQL provider/version/region, because deployment/data-residency/backup owners are not fixed.
- Object-storage/CDN vendor, region, and price.
- Redis, queue, and worker products until measured requirements and operating ownership exist.

The capability direction is fixed; vendor provisioning remains a P0 deployment decision and cannot be marked `PASS`.

