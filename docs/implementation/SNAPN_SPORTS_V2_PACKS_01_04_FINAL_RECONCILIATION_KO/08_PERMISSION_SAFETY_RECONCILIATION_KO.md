# 08. PERMISSION / SAFETY RECONCILIATION — KO

## 1. Cross-pack safety matrix

| Risk | Canonical gate | Reconciled implementation | Expected result |
| --- | --- | --- | --- |
| cross-tenant | A03 before query/mutation | server tenant scope | DENY + audit |
| cross-team | A03 + membership/RoleGrant | team/resource scope | DENY |
| role escalation | RolePreference never authorizes | active verified RoleGrant only | DENY |
| guardian isolation | A04 relation + consent version | guardian_link + consent_records | DENY |
| minor direct contact | A44 hard gate | guardian/club mediated route | DENY or mediated |
| referee private data | exact assignment + field minimization | match_official_assignments draft + E03 | DENY |
| agent consent | A40 + A44 | SCOUTING_PORTFOLIO/DIRECT_CONTACT consent | DENY |
| community hidden/block | A18 + E40 | community state/block relation | DENY and no existence leak |
| admin least privilege | dedicated operator capability | no universal SystemAdmin bypass in domain policy | DENY |
| hard feature flag | E22/E23/E24 + A22 | release gate outranks client flag | HARD_DISABLED |
| migration readonly | migration console read-only | no cutover/decommission command | DENY |
| Earthus soft failure | A36/A37 | stale/unavailable projection | core succeeds |
| offline/idempotency | A30 + server reauth | local journal retained until ACK | dedupe/conflict |

## 2. Conflict decisions

### Referee
`REFEREE` RoleGrant alone is insufficient for match mutation. PACK01 PSE-002 survives as a real schema extension because exact match assignment is security-critical.

### Agent / Scouting
Agent search uses physical permission-aware `/v2/search`; detailed portfolio requires consent + share grant. No global athlete directory is introduced.

### Admin
Admin screens are not a reason to create 21 new tables. Read surfaces use scoped projections; mutations are consolidated and always audited.

### Community
V2.0 Community mutation remains behind legacy parity/write-owner gate. New moderation routes that could create dual writers are deferred.

### Feature gates
`EPTS`, `CAMERA_AI`, `SPORTS_AI` remain absent from normal navigation/components/API prefetch/background jobs even if a client flag is forged true.

## 3. Contract-static result

**CROSS-PACK SAFETY: PASS**

This PASS is for reconciled contracts, static TypeScript permission tests, and dependency checks. It is **not** a staging/production runtime certification.
