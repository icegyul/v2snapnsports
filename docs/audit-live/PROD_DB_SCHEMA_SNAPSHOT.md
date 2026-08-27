# Production DB Schema Snapshot

## Verdict

**Status: `UNKNOWN` — no production snapshot captured.**

This document records the schema snapshot gap. It does not substitute repository SQL for live schema.

## Repository candidates

- 29 local migration SQL files exist.
- The migration directory is not a canonical base schema.
- 84 explicit `sn_*` table names were extracted from current API/migration SQL contexts.
- Selected `rx_*` identity/content dependencies and separate `sf_*` Shorts Factory data are referenced.
- Core relationships in code include member→player, player→team, team membership, guardian→player, match→team/event, training→attendance, and notification→member.

## High-drift candidates

| Object | Conflicting repository assumptions |
|---|---|
| `sn_account_type` | Runtime shapes differ around the `title` column. |
| `sn_club_profile` | Several endpoints create partial shapes and later add location, hierarchy, promotion, and other fields. |
| `sn_players` | `players.php` still conditionally alters `birth_year` and `gender`, while `my_player.php` fails closed when absent. |
| `sn_training_sessions` | Base and later runtime assumptions differ. |
| `sn_self_training`, `sn_coach_notes` | Later code assumes fields not reproduced by one baseline definition. |
| consent/guardian | Request-time table creation and relationship auto-approval coexist. |

## Required production artifact

The eventual snapshot must contain, for every approved table:

- normalized `SHOW CREATE TABLE`;
- column order, type, nullable, default, generated/extra flags;
- engine, charset, and collation;
- primary, unique, ordinary, and full-text indexes;
- foreign-key and check constraints;
- triggers, views, routines, and scheduled events;
- exact or approved approximate counts;
- capture UTC, source label, tool version, and SHA-256 manifest.

No value above may be inferred from an endpoint's `CREATE TABLE IF NOT EXISTS` statement.
