# SNAPN SPORTS V2 MASTER DEVELOPMENT DIRECTIVE

**v1.4 | Implementation Lock | 2026-08-27**

## 목적

v1.4는 v1.3의 제품/엔진/알고리즘을 유지하면서 실제 구현 계약을 잠근다. 새 기능을 임의 추가하는 문서가 아니다.

## 변경 불가 결정

- 공개 가입은 PLAYER / MANAGER 2개만. Guardian은 invite route.
- Manager role preference와 verified RoleGrant/Permission을 분리.
- Player Home: Stadium → Pitch → My Position → My Team → Spatial Home.
- Player bottom navigation: HOME / TRAINING / COMMUNITY / VIDEO / MORE. Growth는 My Player/Career로 진입.
- Community V2.0은 Legacy parity 우선. Feed Intelligence OFF default.
- E35는 Earthus Context Adapter이며 soft dependency.
- EPTS / Camera / Evidence AI는 release approval 전 HARD_DISABLED.
- 3D-first but not 3D-only; 2D/Static fallback mandatory.

## v1.4 Lock Files

1. DATABASE_SCHEMA.sql
2. OPENAPI.yaml
3. UI_COMPONENT_CONTRACT
4. LEGACY_MIGRATION_MATRIX
5. COMMUNITY_PARITY_SPEC
6. TEST_RELEASE_GATE
7. ADMIN_OPS_CONSOLE_SPEC
8. DEPLOYMENT_RUNBOOK
9. GOLDEN_ACCEPTANCE_SCENARIOS
10. CODEX_EXECUTION_DIRECTIVE

## Source of Truth Priority

1. Safety/legal/approved operations policy
2. v1.4 physical contracts
3. v1.3 architecture documents
4. READ-ONLY audit evidence from legacy repository/DB/runtime
5. Visual examples

## Codex Hard Rules

- Never invent legacy schema/routes.
- Never reduce Community parity without an approved exception.
- Never grant authority from role preference alone.
- Never expose minor private data or prohibited direct contact.
- Never surface fake EPTS/Camera/AI production metrics.
- No migration cutover without backup/rollback evidence.
- No phase completion without test/acceptance evidence.
