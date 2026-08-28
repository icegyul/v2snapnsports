# Journey D root cause

Baseline: `579eea4`; viewports: 390×844, 768×1024, 1440×900.

Original failure: `AssertionError: 1 !== 0` after Coach → Analyst.

Classification: `HARNESS_TIMING_DEFECT`.

Actual browser state after deterministic inspection: pathname `/v2/manager`, heading `분석가 워크스페이스`, Coach-only `훈련 세션 시작` controls `0`; only shared role-switch buttons remained. The old harness queried before React committed role/route projection.

Fix: wait for exact Analyst heading before stale Coach assertion and exact Agent heading before Agent action. Stale expectation remains zero. Product authorization code did not change.

Post-fix: Journey D PASS on mobile, tablet and desktop.
