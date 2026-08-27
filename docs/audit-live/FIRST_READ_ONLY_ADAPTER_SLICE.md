# First Read-only Adapter Slice

## Decision

The first slice is **Legacy User + Player + Team + Guardian + Schedule**, assembled in memory for a new V2 read-only UI. V1 retains every write.

## Included reads

| Domain | Legacy source candidate | V2 output |
|---|---|---|
| User | `auth.php?action=me` / current role bootstrap | `CanonicalUser` with safe identity/display fields |
| Player | `my_player.php` for self; public `players.php` only where policy allows | `CanonicalPlayer` |
| Team | `club.php?list=mine`, public `teams.php` where applicable | `CanonicalTeamMembership[]` |
| Guardian | `guardian.php?list=children` | `CanonicalGuardianLink[]` preserving exact status |
| Schedule | approved match/training GET contracts | `CanonicalScheduleItem[]` |

## Excluded

- Every POST/PUT/PATCH/DELETE.
- Direct DB access or V2 persistence.
- Community detail because current GET increments views.
- Private athlete data without an authenticated negative-test gate.
- Media copy/upload/delete.
- EPTS, CAMERA_AI, SPORTS_AI, tactics, Shorts Factory, payments, and admin operations.

## User-visible read model

- identity summary;
- own linked player summary;
- active team memberships with source role label clearly marked as legacy;
- guardian children/relationship state without inferring Primary/Co/Emergency;
- upcoming/recent schedule items the current V1 policy already allows;
- provenance/captured-at/unavailable state.

## Acceptance before implementation may start

Even this read-only slice remains blocked until production runtime, authentication forwarding, and deployment target are approved. Once allowed, acceptance requires adapter contract fixtures, malformed/unavailable tests, no write-capable route, no DB dependency, no secrets, and an instant route kill switch.

