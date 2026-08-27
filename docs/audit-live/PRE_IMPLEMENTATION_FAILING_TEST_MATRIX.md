# Pre-implementation Failing Test Matrix

## Contract status

**Status: `PASS` for definition only.** Tests are intentionally not claimed as executed or passing. Production/staging fixtures and isolated MariaDB are unavailable.

| ID | Scenario | Preconditions | Expected result | Initial evidence state |
|---|---|---|---|---|
| AUTH-001 | Anonymous private read | no session | 401 `AUTH_REQUIRED`; no body/cache leak | public protected samples returned 401 |
| AUTH-002 | Expired/invalid token | expired/bad signature/session | 401; private cache cleared | not executed |
| AUTH-003 | Role escalation | self-selected manager/title or stale token role | 403; current grant re-resolved; audit | not executed |
| AUTH-004 | Cross-team IDOR | valid team-A role reads team-B athlete/resource | 403 `DENY_SCOPE_MISMATCH` | not executed |
| AUTH-005 | Cross-tenant IDOR | valid org-A admin reads org-B | 403; audited | V1 tenant root absent |
| AUTH-006 | Self role grant | subject grants self coach/manager/admin | 403 `DENY_SELF_GRANT` | V2 grant API not implemented |
| AUTH-007 | Suspended token | valid old token, subject now suspended | 401/403 `DENY_SUBJECT_INACTIVE` | stale-token recheck unknown |
| AUTH-008 | Referee unrelated private data | referee grant, unrelated athlete | 403 | not executed |
| GUARD-001 | Unrelated guardian | no approved current link | 403; no child/private data | not executed |
| GUARD-002 | Revoked guardian | relationship revoked/expired | 403; cache invalidated; audit | V1 revoke model absent |
| GUARD-003 | Wrong relationship power | emergency guardian changes consent/profile | 403 | typed relationships absent |
| GUARD-004 | Agent contacts minor | unrelated agent/private contact action | 403 safeguarding denial | private-contact system not implemented |
| COMM-001 | Unauthorized write | anonymous or suspended user posts/comments/likes | 401/403; no side effects | production write not exercised |
| COMM-002 | Stored/reflected XSS | malicious/historical HTML fixture | sanitized output; CSP blocks execution | current sanitizer/CSP missing |
| COMM-003 | Blocked relationship | blocked actor interacts/contacts | denied/hidden per policy; audit | block model absent |
| COMM-004 | Cross-user delete/moderate | ordinary user targets another post/comment | 403 | free-board delete absent |
| COMM-005 | Count retry/concurrency | repeated comment/like requests | idempotent/reconciled count | not executed |
| COMM-006 | Hidden/quarantined content | normal user reads hidden target/media | tombstone or 404 per policy; no media | model absent |
| MEDIA-001 | Foreign athlete media | unrelated player/guardian/staff reads or writes private media | 403/no object | direct legacy URLs public |
| MEDIA-002 | Invalid MIME | extension/MIME/polyglot mismatch | 422; no object/metadata | current magic bytes insufficient |
| MEDIA-003 | Revoked consent and cache | consent revoked after media cached | immediate denial/invalidation | lifecycle absent |
| MEDIA-004 | Oversized dimensions/bomb/EXIF | hostile decodable image | reject or normalized safe object; metadata stripped | pipeline absent |
| MIG-001 | Duplicate mapping | same legacy subject maps twice | run fails/review queue; no merge | no production profile |
| MIG-002 | Orphan mapping | missing member/team/player/guardian parent | `PENDING_REVIEW`; no inference | no production profile |
| MIG-003 | Checksum drift | migration ID with changed checksum | runner stops before DB | production ledger absent |
| MIG-004 | Restore mismatch | schema/count/hash difference | gate FAIL; no cutover | rehearsal absent |
| ADAPTER-001 | Legacy unavailable | timeout/DNS/5xx | 503 `LEGACY_UNAVAILABLE`; no fabricated data | contract defined |
| ADAPTER-002 | Malformed response | HTML/bad envelope/schema drift | 502 `LEGACY_CONTRACT_INVALID` | contract defined |
| ADAPTER-003 | Write method attempted | POST/PUT/PATCH/DELETE to slice-1 adapter | 405/403 before upstream call | adapter not implemented |
| ADAPTER-004 | Sensitive field over-return | upstream adds member/private field | validator strips/rejects; alert | sampled public allowlist currently clean |
| ADAPTER-005 | Stale role cache | cached team data after grant revocation | private cache invalidated; fresh denial | adapter not implemented |

## Execution gate

- Unit/contract tests may run with sanitized fixtures after implementation authorization.
- Authenticated cross-team/cross-tenant/guardian tests require controlled staging accounts and an isolated DB.
- No production write/security payload test is authorized by this matrix.

