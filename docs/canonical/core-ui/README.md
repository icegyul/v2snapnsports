# SnapN Sports V2 CORE UI 구현 준비 패키지 — FINAL

## 1. 패키지 목적

이 패키지는 SnapN Sports V2 CORE UI를 실제 코드베이스에 옮길 때 화면을 다시 기획하거나 임의로 권한·데이터·3D 동작을 추정하지 않도록 만드는 구현 정본이다.

완료 범위는 다음과 같다.

- 모바일 기준 6개 핵심 화면의 디자인·상태·구현 계약
- Community V1 관찰 기능 보존과 V2 필수 안전 계약
- 6개 Manager 역할별 화면·내비게이션·권한 계약
- Loading, Empty, Error, Offline, Forbidden, Stale 상태의 실제 한국어 문구·CTA
- React/TypeScript 컴포넌트, 데이터, 라우트, 상태 머신, API Adapter 경계
- Codex 적용 순서와 중단 조건, 검증 증거, 완료 보고 형식

이 패키지는 **구현 준비 완료**를 의미한다. 운영 DB, 백업·복구, 실운영 RoleGrant, Community 운영 인력·정책, 미디어 권리·파이프라인, 배포 승인은 별도 gate이며 이 패키지만으로 production readiness를 주장할 수 없다.

## 2. 절대 정본

1. UI 언어는 한국어다.
2. Graphite Stadium UI를 사용한다. Dark Navy와 pure black main surface는 사용하지 않는다.
3. Player-first, 3D-first but not 3D-only를 유지한다.
4. Stadium은 배경 장식이 아니라 Spatial Home의 입구다.
5. 공개 가입은 선수와 매니저만 제공한다. 보호자는 선수 초대 흐름으로만 진입한다.
6. `RolePreference`는 권한이 아니다. 권한은 서버가 확인한 유효한 `VerifiedRoleGrant`와 대상 객체 범위로 판정한다.
7. `EPTS`, `CAMERA_AI`, `SPORTS_AI`는 HARD DISABLED다. 메뉴, 카드, 수치, 샘플 분석, placeholder를 만들지 않는다.
8. 3D는 `FULL → FAST → LIGHT → STATIC` 순서로 자동 강등할 수 있어야 하며, STATIC에서도 핵심 기능을 유지한다.
9. Community는 V1에서 관찰된 기능을 삭제하지 않고 신고, 차단, 숨김, 공개 범위, 권한 확인, sanitization, moderation을 추가한다.
10. Feed Intelligence는 OFF다. Community와 Team Communication은 서로 다른 제품 영역이다.
11. 미성년자 개인정보를 기본 비공개로 처리하고, 다른 선수의 이름·사진·직접 연락 정보를 최소화한다.
12. 실제 유명 경기장, 클럽 아이덴티티, 스폰서 그래픽을 복제하지 않는다.
13. 데이터가 없거나 검증되지 않았으면 빈 상태나 제한 상태로 표현한다. 가짜 일정, 선수 수치, 성과, AI 점수로 채우지 않는다.

## 3. Codex 필수 읽기 순서

다음 순서를 바꾸지 않는다.

1. `README.md`
2. `SNAPN_SPORTS_V2_CORE_UI_IMPLEMENTATION_MASTER_KO.md`
3. `COMMUNITY_SCREEN_SYSTEM_KO.md`
4. `MANAGER_ROLE_WORKSPACES_KO.md`
5. `CORE_UI_STATE_CATALOG_KO.md`
6. `contracts.ts`
7. `community-contracts.ts`
8. `manager-contracts.ts`
9. `component-contracts.ts`
10. `routes.ts`
11. `screen-state-catalog.ts`
12. `state-machine.ts`
13. `api-adapter.example.ts`
14. `design-tokens.css`
15. `TEST_MATRIX_KO.md`
16. `CORE_UI_ACCEPTANCE_CHECKLIST_KO.md`
17. `CODEX_FINAL_IMPLEMENTATION_DIRECTIVE_KO.md`
18. `CODEX_FINAL_EXECUTION_CHECKLIST_KO.md`
19. `PACKAGE_CHANGELOG_KO.md`
20. `verify-package.mjs`
21. `FILE_MANIFEST.sha256`

## 4. 파일 역할

| 파일 | 역할 |
|---|---|
| `SNAPN_SPORTS_V2_CORE_UI_IMPLEMENTATION_MASTER_KO.md` | 6개 핵심 화면 정본과 공통 경험 |
| `COMMUNITY_SCREEN_SYSTEM_KO.md` | Community 전체 화면군, 안전, 상호작용, 상태 |
| `MANAGER_ROLE_WORKSPACES_KO.md` | 6개 Manager 역할 화면, 내비게이션, 권한 |
| `CORE_UI_STATE_CATALOG_KO.md` | 6개 핵심 화면 × 6개 비정상 상태의 실제 문구와 CTA |
| `contracts.ts` | 공통 DTO, 상태, 역할, 개인정보, 데이터 신뢰 계약 |
| `community-contracts.ts` | 게시물, 댓글, 신고, 차단, 숨김, 예측, 리더보드 계약 |
| `manager-contracts.ts` | RoleGrant, capability, scope, 역할별 workspace 계약 |
| `component-contracts.ts` | 페이지와 공통 컴포넌트 Props 계약 |
| `routes.ts` | 공개·선수·Community·Manager route와 접근 요구 조건 |
| `screen-state-catalog.ts` | 6개 핵심 화면 × 6개 상태의 실제 한국어 문구와 CTA |
| `state-machine.ts` | Resource UI 상태와 3D 자동 강등 상태 머신 |
| `api-adapter.example.ts` | 실제 백엔드 응답을 UI 계약으로 변환하는 경계 예시 |
| `design-tokens.css` | Graphite Stadium UI 토큰과 상태/접근성 토큰 |
| `TEST_MATRIX_KO.md` | 기능·권한·안전·상태·접근성·3D 검증 행렬 |
| `CORE_UI_ACCEPTANCE_CHECKLIST_KO.md` | CORE UI 완료 판정 기준 |
| `CODEX_FINAL_IMPLEMENTATION_DIRECTIVE_KO.md` | 구현 중 지켜야 할 변경 경계와 보고 규칙 |
| `CODEX_FINAL_EXECUTION_CHECKLIST_KO.md` | 실제 저장소 조사부터 증거 제출까지 강제 순서 |
| `PACKAGE_CHANGELOG_KO.md` | 복원·보강 범위와 파일별 변경 목록 |
| `tsconfig.contracts.json` | 로컬 TypeScript 계약 정적 검사 설정 |
| `verify-package.mjs` | 파일·36개 상태·13개 Community 화면·6개 Manager 역할·route·token 구조 검사 |
| `FILE_MANIFEST.sha256` | 최종 ZIP 안 개별 파일의 SHA-256 무결성 목록 |

## 5. 구현 증거 등급

완료 보고는 다음 등급을 구분한다.

| 등급 | 의미 |
|---|---|
| `SPEC_READY` | 문서와 계약이 존재하고 상호 모순 검사를 통과함 |
| `CODE_EXISTS` | 저장소에 코드가 존재함 |
| `PACKAGE_VERIFIED` | 정적 검사와 package-local test가 통과함 |
| `UI_VERIFIED` | 실제 브라우저에서 화면·상태·상호작용을 확인함 |
| `AUTH_VERIFIED` | 실제 인증 세션과 대상 객체 권한으로 허용·거부를 확인함 |
| `LIVE_VERIFIED` | 승인된 배포 후 공개 URL과 자산·캐시를 확인함 |

낮은 등급의 증거를 높은 등급의 증거로 보고하지 않는다.

## 6. 구현 전 중단 조건

다음 중 하나라도 해당하면 추정 구현을 중단하고 증거를 수집한다.

- 실제 V2 저장소 경로 또는 작업 브랜치가 확인되지 않음
- 사용자 변경이 섞인 dirty tree의 소유 범위를 알 수 없음
- 기존 라우트, API, RoleGrant 구조가 문서 계약과 충돌함
- Community 운영 정책 또는 미성년자 공개 범위를 결정해야 함
- 실제 데이터가 없는데 예시 수치를 제품 값처럼 노출해야 함
- 운영 DB 변경, 마이그레이션, 배포, 실사용 권한 부여가 필요함
- 미디어 권리 또는 YouTube 임베드 허용 범위를 확인할 수 없음

## 7. TypeScript 확인

계약 파일만 확인할 때는 다음과 같이 실행한다.

```bash
node verify-package.mjs
tsc -p tsconfig.contracts.json
```

첫 명령은 패키지 구조를, 둘째 명령은 계약 파일의 문법과 타입 일관성을 검증한다. 둘 다 실제 앱 번들, API 연결, 인증 권한, 브라우저 UX를 검증하지 않는다.
