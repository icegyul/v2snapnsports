# Media Physical Storage Map

## Verdict

**Status: `FAIL / CODE-ONLY MAP`**

| Asset | Repository-computed server path | Naming | Live physical proof |
|---|---|---|---|
| Player photo | web root `/files/snapn_photos/` | `player_<player_id>.png|jpg` | `UNKNOWN` |
| Team logo | web root `/files/snapn_logos/` | `team_<team_id>.png` | `UNKNOWN` |
| Player card | web root `/files/snapn_cards/` | `card_<member>_<time>_<random>.png` | `UNKNOWN` |
| YouTube media | remote thumbnail/watch URLs | provider ID | Public screen confirmed, storage external |
| Match highlights | derived text in main Community | no video object | No main upload/transcode pipeline found |
| Shorts Factory | separate `ss/` subsystem | separate `sf_*`/provider model | Excluded from main V2 migration |

The Legacy staging checkout contains no local `cafe24-deploy/files` production tree. Exact server absolute path, filesystem, volume, quota, inode usage, permissions, and symlink behavior are unknown.

## Missing physical inventory

- relative path, size, SHA-256, detected media type, modification time;
- DB reference and owner candidate;
- public/private classification and minor/consent state;
- missing, orphan, duplicate, and alternate-extension state;
- backup set and last successful restore.

