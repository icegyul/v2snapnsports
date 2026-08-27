# Media Permission Report

## Verdict

**Status: `FAIL`**

## Confirmed write checks

- Player photo: authenticated player owner or current team staff/admin.
- Team logo: current team staff/admin.
- Player card: any authenticated member can upload a PNG; Community later accepts a strict card path that exists.
- Player photo delete: same owner/staff gate.

## Missing or insufficient controls

- No authorization on direct public file reads.
- No relationship/consent revocation hook for minor media.
- No durable card ownership/usage table or card delete contract.
- No logo delete/retention contract.
- No tenant-isolated namespace.
- No image decode/re-encode, EXIF stripping, malware scan, pixel/dimension limit, quota, or audit event.
- Magic-byte and byte-size checks do not prove safe decoded content.
- Staff replacing a player image is allowed by team role; policy/audit and post-membership revocation behavior are not defined.

## Required negative tests

- Foreign athlete photo read/write/delete.
- Former staff write after revocation.
- Guardian without approved/current relationship.
- Cross-tenant URL guessing.
- Polyglot/invalid MIME/oversized dimensions/decompression bomb.
- EXIF location/privacy removal.
- Quarantined/deleted/missing object delivery.
- Consent revoked while cached object exists.

