# V2 Media Migration Contract

## Decision

- First read-only slice: **no media copy or V2 upload**; retain legacy URLs through a read adapter.
- Later target: private, versioned, S3-compatible object storage with explicit metadata/ownership; vendor selection remains deployment-gated.
- Public derivatives may use a CDN; private/minor originals require authorized delivery and must not be public-bucket objects.

## Migration stages

1. `INVENTORY`: paired DB/file manifest and ownership review.
2. `BACKUP_RESTORE`: encrypted binary restore with hash equality.
3. `COPY_NON_AUTHORITATIVE`: object copy with immutable key and metadata; V1 URL remains authoritative.
4. `DUAL_READ_VERIFY`: compare bytes/decodes/permissions and old URL compatibility.
5. `READ_CUTOVER`: signed/authorized V2 delivery behind a flag.
6. `WRITE_CUTOVER`: separate approval after upload/delete/quarantine/audit tests.
7. `DECOMMISSION`: only after retention/consent/legal review and observation window.

## Object rules

- Preserve legacy ID and URL as provenance, never as V2 authorization.
- Validate by decoding and re-encoding approved image types; strip metadata.
- Use content checksum for integrity/dedup review, not for automatic cross-owner merging.
- Store owner, tenant, subject resource, purpose, visibility, consent reference, retention, and audit history.
- On unknown owner/consent, quarantine or leave on V1; never infer.
- Old URLs stay reachable only according to the approved compatibility/privacy policy.

