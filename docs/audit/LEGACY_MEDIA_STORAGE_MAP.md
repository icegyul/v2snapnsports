# Legacy Media and Storage Map

## Main-app local file storage

| Asset | Write path | Metadata/reference | Access and validation |
|---|---|---|---|
| Player photo | `/files/snapn_photos/player_<id>.png|jpg` | `sn_player_profile.photo_url` | owner or team staff/admin; PNG/JPEG signature; 2 MB max; public GET |
| Team logo | `/files/snapn_logos/team_<id>.png` | `sn_club_profile.logo_url` | team staff/admin; PNG signature; 2 MB max; public GET |
| Shared player card | `/files/snapn_cards/card_<member>_<time>_<random>.png` | URL embedded in Community post HTML | logged-in upload; PNG signature; 3 MB max |

The APIs create directories under the Cafe24 web root and write files directly. Player photos support deletion by an already authorized owner/staff request; equivalent team-logo/card retention or deletion controls were not found.

## Remote and derived media

- YouTube cards reference remote thumbnails and public watch/embed URLs.
- Weekly Community highlights are text derived from match records; they are not a video-object pipeline.
- `HighlightTrimmer.jsx` presents a trimming experience, but no repository-confirmed upload, transcode, clip generation, or export worker backs it.
- `roster_ocr.php` sends roster image content to a configured model provider; it is an external processing path, not a storage system.
- Manuals/PDFs are static app assets with PWA navigation exclusions.

## Shorts Factory boundary

`snapn-handoff/cafe24-deploy/ss` is a separate subsystem with `sf_*` tables and provider integrations for generation, storage links, social publishing, and YouTube. It is not the main V2 media backend and must not be copied into V2 by proximity.

## Storage/CDN findings

| Requirement | Audit result |
|---|---|
| General object storage | not found for main app |
| Signed upload/download URLs | not found |
| CDN origin and invalidation contract | not found for `/files/` |
| Thumbnail/proxy worker | not found for main app uploads |
| Virus/malware scan | not found |
| Image decode/re-encode normalization | not found; validation uses signatures and size |
| EXIF/privacy stripping | not found |
| Media ownership table | partial URL metadata only |
| Retention/deletion policy | not found as a complete contract |
| Backup/restore of web-root files | not proven |
| Tenant-isolated media namespace | not proven |

## Permission observations

- Player photo writes use player ownership or team-staff authority.
- Team logo writes use team-staff authority.
- Player-card upload requires login but names the object by member/time/random and does not establish a separate durable media record.
- Community card posts accept only a strict `/files/snapn_cards/*.png` path and verify the file exists.
- Public reads expose direct paths. Authorization at file-serving time is not present for these public assets.

## V2 migration classification

- Media binary content: `MIGRATE_DATA_ONLY` after inventory, checksum, rights, retention, and backup verification.
- Media metadata and legacy URLs: `REUSE_WITH_ADAPTER` during compatibility; do not reinterpret paths.
- Upload validation ideas and permission rules: `REUSE_WITH_ADAPTER`, with MIME decode/re-encode, scan, quota, audit, and ownership added.
- Main media service, object model, derivative pipeline, and retention engine: `REBUILD_NEW` after storage architecture approval.
- Shorts Factory: remain separate; no V2 migration in this phase.

## Required pre-cutover evidence

1. Complete `/files/snapn_*` manifest with path, byte size, hash, media type, owner candidate, and missing/orphan status.
2. Matching DB URL counts and orphan queries.
3. Backup plus isolated restore of both DB metadata and binary objects.
4. Public/private classification and consent for minors.
5. Old URL compatibility or redirect plan.
6. Upload, read, replace, delete, retention, and legal-hold permission tests.
7. Community post rendering when referenced media is missing or quarantined.
