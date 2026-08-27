# Production Data Integrity Risk Report

## Verdict

**Status: `FAIL / UNKNOWN COUNTS`**

The following risks are supported by code relationships, but their production counts are unknown.

| Risk | Evidence | Required aggregate-only check |
|---|---|---|
| member without player or duplicate player per member | mixed member/player identity and one-profile assumptions | counts by `member_srl`, null/duplicate profile links |
| player with missing team | joins assume current team | player→team orphan count |
| duplicate jersey within a team | application locking/check only in some write paths | `(team_id, back_no)` duplicates excluding null |
| team membership role drift | overlapping role writers and no validity window | invalid role values, duplicate logical grants, owner count per team |
| guardian orphan or stale approval | guardian→player and approval status drive access | missing player/member, status distribution, multiple active links |
| guardian/team-membership mismatch | approved guardians are inserted as team members | approved links without membership and guardian memberships without approved link |
| consent without typed/versioned evidence | current table stores coarse status and code flow | status/age bands, missing guardian/evidence, duplicate codes |
| match/event participant mismatch | event player/team validity is endpoint-dependent | event→match/player/team orphans and participant-team mismatch |
| attendance mismatch | session/player/team relation enforced in selected writes | attendance→session/player orphans and cross-team rows |
| Community count drift | comments/likes update counts separately | stored versus calculated comment/like counts |
| media metadata/path drift | DB URLs and public files are separate | DB missing-file and file-without-owner counts |
| migration partial application | local ledger is not a production ledger | expected-object presence per migration checksum |

## Rules

- Collect only counts, distributions, and non-identifying review IDs in the approved evidence store.
- Never auto-fix, merge, delete, or infer ownership during inventory.
- Put ambiguous records into `UNKNOWN/PENDING_REVIEW` for future migration.

No integrity risk can be closed until the production aggregate queries and isolated restore comparison are reviewed.

