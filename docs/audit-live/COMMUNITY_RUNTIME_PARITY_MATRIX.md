# Community Runtime Parity Matrix

## Verdict

**Status: `CONDITIONAL PASS` for public inventory, `FAIL` for cutover readiness.**

| Capability | Repository | Live public screen | V2 parity requirement |
|---|---|---|---|
| Feed/list | GET `community.php`, newest first, 20/page | Posts visible | Preserve ordering and response identity |
| Pagination | Backend `page`/offset | No pagination control visible | Contract pages; do not copy the current UI omission as intended behavior |
| Detail | Public GET; increments view count | Not opened to avoid write-like count side effect | Preserve one increment per accepted view policy |
| Create | Authenticated, title 1–120, body required/5,000 chars | Write button visible in signed-in UI | Preserve validation and error semantics |
| Comments | Authenticated, flat, oldest first, max 100, 1–1,000 chars | Comment counts visible | Preserve flat V1 behavior initially |
| Likes | Authenticated toggle, self-notification excluded | Like counts visible | Preserve idempotency/count/notification semantics |
| Player card post | Authenticated, server accepts local card PNG path | Code confirmed | Preserve post HTML meaning and media reference |
| News | Public list/detail | News cards visible | Preserve list/deep link; sanitize content |
| YouTube | Remote cards/links | Cards visible | Preserve link behavior and rights/failure policy |
| Match prediction | Public display, authenticated vote | Block visible | Preserve only as a separate contract |
| Leaderboard | Public derived card | Block visible | Preserve separately |
| Match highlight | Derived text block from match data | Not present in sampled viewport/DOM | Treat absence as current data state, not feature removal |
| Professional match comments | Separate `proclub.php` supports comments and own/admin delete | Pro-match block present | Keep separate from free-board contract |
| Development request board | Login-required list/read/write/comment; admin status | Tab visible | Keep operational/privacy boundary separate |
| Edit free-board post/comment | Not found | Not visible | Add only through approved moderation design |
| Delete free-board post/comment | Not found | Not visible | Add minimum safety controls; preserve legacy IDs/content |
| Hidden/soft delete | Not found | Not visible | Required additive moderation state |
| Threaded replies | `parent_srl=0` | Not visible | Deferred; do not silently invent hierarchy |
| Report/moderation queue | Not found | Not visible | Mandatory minimum contract |
| Block/mute | Not found | Not visible | Mandatory minimum contract |
| Audience visibility | V1 writes `PUBLIC` | No audience control visible | Preserve public legacy behavior; new audiences require explicit design |
| Notifications | Like notification to `/app/community` | Not exercised | Preserve type/count/read and define stable post link |
| Deep link | Community/news route; no proven stable post permalink | News route active | Define stable V2 post URL with legacy ID mapping |

## Freeze rule

V1 remains the sole Community write owner. `Feed Intelligence = OFF`. `SPORTS_AI` preview content is not carried into V2 production.

The live-screen sample is not a strictly SQL-read-only proof because Community/adjacent GET handlers include runtime DDL. Future runtime parity capture must first remove or isolate that risk outside production.
