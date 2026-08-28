# V2 PACK 01–04 integration acceptance

Branch: `integration/v2-pack01-04-acceptance` · Baseline: PACK01 `53a5f0f`, PACK02 `345160f`, PACK03 `394eff4`, PACK04 `48a5fe4`.

## Ownership

Schedule/Training/Match/Tactics: PACK01. Career/Portfolio/Scouting/Opportunity/Team Communication: PACK02. Manager workspace projection: PACK03. Admin/Ops/Safety projection: PACK04. Shared authorization/audit: P2. No second aggregate or production writer was added.

## Cross-pack evidence

- Training final attendance → `projectTrainingAttendanceToCareer()` → Career event with `TRAINING_ATTENDANCE`, source id, source version and `VERIFIED` state.
- PACK04 grant revoke mutates the shared PACK03 grant reference; active Coach workspace immediately denies.
- Referee report remains exact-assignment PACK01 behavior; Admin/Support do not receive referee capability.
- Agent opportunity remains PACK02 consent-gated and guardian/club mediated for minors.
- Moderation is local projection-only; Safeguarding stays case-scoped; privacy delete/migration production/job retry stay blocked/deferred.
- Earthus `UNAVAILABLE` remains non-blocking; EPTS/CAMERA_AI/SPORTS_AI remain false.

## Route matrix summary

All implemented Player, Training/Match/Tactic, Football Life, Manager, and Admin routes use `shell-main`, semantic headings, 44px interactive controls and local fixture/domain projections. Protected domain mutations pass shared authorization before owner-domain execution. No production URL, secret, or V1 path is used.

## Validation

Full suite, typecheck, lint and build are executed in this acceptance branch. Browser/accessibility evidence is retained from PACK01–04 under `docs/implementation/evidence/` and is not a production claim.

## Integrated browser recovery

The first matrix attempt failed in Journey D with `AssertionError: 1 !== 0`. Focused browser inspection classified it as `HARNESS_TIMING_DEFECT`: after Coach→Analyst click, actual DOM had Analyst heading and zero Coach-only controls, but the harness asserted before React committed the route projection. Exact Analyst/Agent heading waits were added without weakening stale-control expectation. The rerun passed 8 integrated core routes × mobile/tablet/desktop, including Coach→Analyst→Agent stale-control check and Agent mediation. Training→Career provenance remains separately verified by `pack01to02Provenance.test.ts` because the browser fixture stores are intentionally separate local domain instances.
