# Role and Permission Effective Matrix

## Distinct authority layers

| Layer | Examples | V2 treatment |
|---|---|---|
| Identity | `member_srl`, social provider link | Authentication subject only |
| Authentication | JWT/localStorage/Bearer headers | Session proof only |
| Global role | admin flag, approved groups | Explicit system/org grant only |
| Manager preference | `account_type`, title, view mode | Presentation preference; never authority |
| Verified role grant | owner/coach/manager/player | Team-scoped, versioned grant |
| Organization membership | not canonical in V1 | New tenant membership contract |
| Team membership | `sn_club_members` | Preserve as legacy evidence; map with scope |
| Guardian relationship | `sn_guardians` status | Athlete-scoped relationship, not team role |
| Consent | coarse minor/user consent tables | Typed/versioned/revocable record |
| Resource scope | team/match/player checks | Required on every decision |

## Effective V1 observations

| Actor/action | Current code result | Verification state |
|---|---|---|
| admin | `is_admin` or selected admin groups often bypass scope | Code confirmed; tenant boundary absent |
| owner/coach/manager | team staff actions through helpers | Code confirmed; full endpoint coverage unknown |
| player | own profile and team-member paths | Code confirmed; cross-team test missing |
| approved guardian | child/family-note and selected object read | Code confirmed; relationship type/revocation missing |
| referee/scout/agent groups | endpoint-local approved-group checks | Fragmented; private-data contract incomplete |
| anonymous | public allowlists and content | Sampled public fields passed; not exhaustive |

## Required negative cases

| Case | Expected V2 decision |
|---|---|
| Other team's player private record | `DENY_SCOPE_MISMATCH` |
| Other guardian's child | `DENY_RELATIONSHIP_MISSING` |
| Self-selected/unverified manager title | `DENY_GRANT_MISSING` |
| Subject attempts to grant self a role | `DENY_SELF_GRANT` |
| Agent contacts a minor privately | `DENY_SAFEGUARDING` |
| Referee reads unrelated private player data | `DENY_SCOPE_MISMATCH` |
| Suspended user presents an otherwise valid token | `DENY_SUBJECT_INACTIVE` |
| Token contains a stale role | Re-resolve grant; `DENY_GRANT_STALE` if no active grant |

This matrix is `CONTRACT_FROZEN`, not runtime-tested.

