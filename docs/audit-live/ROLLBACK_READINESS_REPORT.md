# Rollback Readiness Report

## Verdict

**Status: `FAIL`**

## Current capability

| Layer | Current rollback evidence | Gap |
|---|---|---|
| V1 web entry/SW/assets | Guarded SFTP backup, staged switch, byte checks, and rollback logic | Does not cover API/DB/media state |
| V1 PHP API files | Per-file backup, rename, smoke, and multi-file rollback logic | HTTP smoke is not authenticated behavior; DB side effects persist |
| Database | Runbook exists | No accepted backup or isolated restore rehearsal |
| Media | Plan exists | No manifest, backup, or restore evidence |
| V2 UI/read adapter | Contract can disable a feature and return to V1 route | Not implemented or rehearsed |
| Community | V1 remains write owner | Correct ownership control, but no V2 parity/cutover rehearsal |

## Frozen rollback sequence for the first read-only slice

1. Disable the V2 route/feature flag.
2. Stop V2 adapter traffic; do not change V1.
3. Restore the previous V2 static entry/SW set if a V2 deployment occurred.
4. Restore every V2 adapter file from its release manifest if needed.
5. Confirm V1 `/app/` and existing API still serve the prior behavior.
6. Preserve request IDs, adapter mismatch evidence, and artifact hashes.
7. Do not execute DB rollback because the first slice is prohibited from DB writes.

## Future DB rollback rule

Code rollback precedes data/schema action. Additive target objects may remain dormant. A `down.sql` is not accepted recovery evidence. Destructive reverse migration requires a separate approved decision after backup/restore proof and data ownership review.

