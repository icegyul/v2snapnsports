# SNAPN SPORTS V2 IMPLEMENTATION LOCK PACKAGE v1.4

## Read first

This package is the physical implementation lock that follows v1.3. It does not expand product scope.

### Primary files

1. `SNAPN_SPORTS_V2_MASTER_DEVELOPMENT_DIRECTIVE_v1.4.*`
2. `SNAPN_SPORTS_V2_DATABASE_SCHEMA_v1.4.sql` + Schema Guide
3. `SNAPN_SPORTS_V2_OPENAPI_v1.4.yaml` + Contract Guide
4. `SNAPN_SPORTS_V2_UI_COMPONENT_CONTRACT_v1.4.*`
5. `SNAPN_SPORTS_V2_LEGACY_MIGRATION_MATRIX_v1.4.*`
6. `SNAPN_SPORTS_V2_COMMUNITY_PARITY_SPEC_v1.4.*`
7. `SNAPN_SPORTS_V2_TEST_RELEASE_GATE_v1.4.*`
8. `SNAPN_SPORTS_V2_ADMIN_OPS_CONSOLE_SPEC_v1.4.*`
9. `SNAPN_SPORTS_V2_DEPLOYMENT_RUNBOOK_v1.4.*`
10. `SNAPN_SPORTS_V2_GOLDEN_ACCEPTANCE_SCENARIOS_v1.4.*`
11. `SNAPN_SPORTS_V2_CODEX_EXECUTION_DIRECTIVE_v1.4.*`

## Non-negotiable product locks

- Signup = PLAYER / MANAGER only. Guardian via invite.
- Manager preferences do not equal permissions.
- Player Home = My Football World; bottom nav HOME/TRAINING/COMMUNITY/VIDEO/MORE.
- Legacy Community parity first; Feed Intelligence OFF.
- Earthus context is a soft dependency.
- EPTS / Camera AI / Sports AI HARD_DISABLED until release approval.
- No Legacy schema guesswork. READ-ONLY audit first.

## Codex start

Give Codex this package and instruct it to read `SNAPN_SPORTS_V2_CODEX_EXECUTION_DIRECTIVE_v1.4.md` first. It must produce audit artifacts before code modifications.
