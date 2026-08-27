# Media URL and Ownership Map

| URL class | Metadata | Write authority | Read authority | Ownership quality |
|---|---|---|---|---|
| `/files/snapn_photos/player_<id>.*` | `sn_player_profile.photo_url` | player owner or team staff/admin | public direct URL | Athlete inferred from filename/metadata; no object ACL |
| `/files/snapn_logos/team_<id>.png` | `sn_club_profile.logo_url` | team staff/admin | public direct URL | Team inferred; no object ACL |
| `/files/snapn_cards/card_*` | URL embedded in Community HTML | any authenticated uploader | public direct URL | Filename embeds member/time but no durable ownership record |
| YouTube | provider URL | external provider/channel | public link | External rights/availability |

## Risks

- Public file serving bypasses endpoint permission checks.
- Replacing a deterministic photo/logo path changes the object in place; cache versioning is query-time only.
- Player-card files have no repository-confirmed delete/retention owner.
- DB backup alone would not restore binary objects.
- Filename identity is not sufficient proof of consent, tenant, author, or current ownership.
- A minor's photo can remain publicly reachable after relationship, membership, or consent changes unless a separate lifecycle removes/quarantines it.

## V2 ownership record

Each migrated object needs immutable object ID, legacy URL/path, owner subject/resource, tenant, uploader, purpose, visibility, consent evidence reference, checksum, detected MIME, bytes, created/captured timestamps, retention state, quarantine state, and source provenance.

