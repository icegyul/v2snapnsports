# Community Cutover Gate

## Current verdict

**`NOT SAFE` — V1 remains sole read/write owner.**

## Required gate evidence

- [ ] Production tables, counts, indexes, constraints, and historical HTML profile captured.
- [ ] DB and media backup restored successfully in isolation.
- [ ] List/detail/page/order/view/comment/like/card/news/video/highlight/prediction/leaderboard/dev-board fixtures frozen.
- [ ] Sanitizer and CSP/security-header suite passes historical and malicious fixtures.
- [ ] Moderation minimum contract implemented with allow/deny/audit tests.
- [ ] Media ownership, missing-file, quarantine, and restore tests pass.
- [ ] Notification and deep-link behavior passes.
- [ ] Retry/concurrency count reconciliation passes.
- [ ] V2 shadow reads match V1 within an approved tolerance with mismatch reports.
- [ ] Old PWA/new V2 client overlap passes.
- [ ] Feature flag and artifact rollback are rehearsed.
- [ ] Product, safety, privacy/legal, and operations owners approve the observation window.

## Ownership stages

`INVENTORY -> ADAPTER_READ -> SHADOW_READ_COMPARE -> DUAL_VERIFY -> EXPLICIT CUTOVER`

No `SHADOW_WRITE` or Community write proxy is authorized by these documents.

