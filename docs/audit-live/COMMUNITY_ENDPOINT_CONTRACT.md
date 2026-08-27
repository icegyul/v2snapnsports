# Community Endpoint Contract

## Legacy-observed endpoints

| Method/path | Auth | Contract summary |
|---|---|---|
| `GET community.php?page=N` | public | 20 posts, descending legacy ID, page number |
| `GET community.php?id=ID` | public | post HTML, comments, like state/count; increments views |
| `POST community.php?action=write` | required | title/body validation; returns legacy post ID |
| `POST ...?action=comment` | required | flat comment; increments stored comment count |
| `POST ...?action=like` | required | toggle semantics; returns count/mine |
| `POST ...?action=write_card` | required | server-constructed HTML from `/files/snapn_cards/*.png` |
| `GET news.php` / `?id=` | public | news list/detail HTML; detail increments views |
| `GET/POST devreq.php` | required | request board; admin-only status change |
| `GET/POST proclub.php` | mixed | public comments; author/admin comment delete |

## V2 read contract

V2 exposes canonical read DTOs only during the first slice:

- `GET /api/v1/community/posts?cursor=`
- `GET /api/v1/community/posts/{legacyPostId}` only after view-count policy is explicitly decided
- `GET /api/v1/community/news`

No Community write route is enabled in the first adapter slice.

## Canonical rules

- IDs preserve legacy values with `sourceSystem=LEGACY_V1`.
- Cursor responses retain deterministic descending legacy order and include source-page provenance.
- HTML is never forwarded directly to React. It passes the approved sanitizer and is returned as `sanitizedHtml` plus sanitizer version.
- Missing author/media remains explicit (`authorState`, `mediaState`); no fabricated labels.
- Counts include `sourceCapturedAt`; mismatch is reported, not silently repaired.
- All V1 errors are normalized by `ADAPTER_ERROR_POLICY.md`.

## Write freeze

Calls to write/comment/like/card/report/moderate return `V2_WRITE_DISABLED` until the Community cutover gate passes. The UI must link back to the V1 owner for allowed legacy writes rather than proxying them invisibly.

