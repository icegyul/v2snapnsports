# Legacy Community Parity Inventory

## Parity rule

Community remains a V1-owned production behavior until every currently supported action is represented in a V2 contract, verified against legacy behavior, and covered by permission, data, media, and moderation tests. A redesigned shell is allowed; changing behavior or data meaning is not.

## Primary free board

| Capability | Current implementation | Evidence |
|---|---|---|
| Public list | yes | `GET community.php`, `sn_posts`, module 51 |
| Ordering | newest `document_srl` first | `ORDER BY document_srl DESC` |
| Backend pagination | 20 per page, page/offset | `page`, `LIMIT 20 OFFSET` |
| Current main UI pagination | default first page only | `Community.jsx` calls `community.php` without page controls |
| Public detail | yes | `GET ?id=`, increments view count |
| Post creation | authenticated | `action=write`, title 1–120, content required |
| Post body limit | server truncates input to 5,000 characters | `community.php` |
| Comment creation | authenticated, flat | `action=comment`, 1–1,000 characters |
| Comment ordering | oldest comment identifier first, max 100 | `ORDER BY comment_srl ASC LIMIT 100` |
| Likes | authenticated toggle | `sn_community_likes` composite identity |
| Like notification | yes for a new like, excluding self | `notify_lib.php` when available |
| Shared player-card post | authenticated | `write_card`, server-validated `/files/snapn_cards/*.png` |
| View/read count | detail read increments count | direct update on detail request |

Current post input is escaped and wrapped server-side, and shared-card HTML is constructed server-side. The UI renders post HTML with `dangerouslySetInnerHTML`. Existing legacy/news content therefore needs an explicit sanitization contract and fixture review; this audit does not assert that all stored HTML is safe.

## Community-adjacent content in the same screen

| Block | Behavior | Source |
|---|---|---|
| Match prediction | upcoming/recent match vote, authenticated vote | `match_predict.php` |
| AI preview text | optional public preview block | `ai_preview.php`; V2 `SPORTS_AI` remains disabled |
| Weekly highlights | derived from recent match events, no separate stored highlight record | `highlights.php` |
| Leaderboard | public top scorers card | `leaderboard.php` |
| YouTube | public remote video cards | `youtube.php` |
| News | public list/detail inside Community | `news.php` |
| Professional matches | public match list with authenticated comments | `ProMatches.jsx`, `proclub.php` |
| Development requests | authenticated list/read/write/comment; admin status control | `devreq.php` |

These adjacent blocks must be classified individually. AI preview/sample behavior must not be carried into active V2 production UI while `SPORTS_AI` is hard-disabled.

## Deep links and sharing

- Main Community route: `/app/community`.
- News can open through the Community query path.
- Like notifications link back to `/app/community` rather than a proven post-specific deep link.
- Player-card sharing stores a server path in post HTML.
- No general Web Share contract or stable post permalink contract was confirmed in the main Community path.

## Deleted/hidden/moderation state inventory

| Required area | Audit result |
|---|---|
| Threaded replies | `ABSENT_IN_AUDITED_PATHS`; comments use `parent_srl=0` |
| Post deletion | `ABSENT_IN_AUDITED_PATHS` |
| Comment deletion | `ABSENT_IN_AUDITED_PATHS` |
| Soft-delete state | `ABSENT_IN_AUDITED_PATHS` for Community |
| Hidden/moderated state | `ABSENT_IN_AUDITED_PATHS` for Community |
| User report flow | `ABSENT_IN_AUDITED_PATHS` |
| Moderation queue/action log | `ABSENT_IN_AUDITED_PATHS` |
| Block | `ABSENT_IN_AUDITED_PATHS` |
| Mute | `ABSENT_IN_AUDITED_PATHS` |
| Audience visibility | posts are written with public status; no per-post audience control found |

These are parity gaps, not permission to reduce Community. V2 must either reproduce the proven current behavior exactly or add new moderation controls through a separately approved additive design without changing existing data meaning.

## Data and table candidates

- `sn_posts`, `sn_comments`, `sn_community_likes`, `sn_sequence`.
- `sn_notifications` for like/activity delivery.
- `sn_dev_requests`, `sn_dev_comments` for the development-request board.
- `sn_match_predictions`, match/event/stat tables for adjacent blocks.
- `sn_match_posts` or provider-specific tables for professional-match comments where referenced.

All table names are code references until production inventory confirms existence, shape, engine, indexes, and counts.

## Required parity fixtures

1. Anonymous list/detail and authenticated write/comment/like/card-write response shapes.
2. First, middle, and final page ordering with concurrent new posts.
3. View-count behavior and retry semantics.
4. Comment and like counts under duplicate/retry/concurrent requests.
5. Stored HTML, historical HTML, news HTML, and image URL sanitization.
6. Notification creation, self-like exclusion, read/clear, and deep-link destination.
7. Missing/deleted author/member/media behavior.
8. Cross-user edit/delete/report/block/mute tests when additive moderation is designed.
9. Media path reachability, authorization, retention, and backup/restore.

## Community cutover status

`NOT SAFE`. There is no V2 Community implementation, no production data snapshot, no full behavior fixture set, no moderation model, and no dual verification. V1 remains the sole write owner.
