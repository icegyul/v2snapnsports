# Production DB Index and FK Report

## Verdict

**Status: `UNKNOWN`**

No live index, constraint, or engine metadata was captured.

## Repository observations

- Current local migrations contain primary/unique/index declarations for some feature tables.
- The audited main-app migrations do not provide a complete declared FK graph.
- Many relationships are enforced only through joins and endpoint checks.
- `sn_club_members` is expected by newer helpers to be InnoDB and keyed by `(team_id, member_srl)` with a member index, but production confirmation is absent.
- Like/card/attendance/check-in paths rely on composite uniqueness or `INSERT IGNORE` for idempotency in code; actual production constraints are unknown.

## P0 queries required

The approved inventory must capture `information_schema.STATISTICS`, `TABLE_CONSTRAINTS`, and `KEY_COLUMN_USAGE`, then report:

1. missing indexes for every observed join/filter/order key;
2. declared FK coverage versus code-joined relationships;
3. duplicate-capable logical keys where no unique constraint exists;
4. engine mismatch, especially any non-InnoDB table involved in backup consistency;
5. collation mismatch across joined string keys;
6. cascade rules that could delete member, player, guardian, team, post, or media metadata.

## Gate

No migration or target-schema generation is allowed while production primary/unique/FK/index facts are `UNKNOWN`.

