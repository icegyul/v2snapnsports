# Codex 최종 구현 지시서

## 1. 임무

실제 `icegyul/v2snapnsports` 코드베이스를 조사한 뒤 이 패키지의 CORE UI 정본을 기존 구조에 최소 침습으로 적용한다.

목표는 다음이다.

- 6개 핵심 화면 구현
- Community 전체 화면군 기능 parity와 안전 계층 구현
- 6개 Manager 역할 workspace와 권한 경계 구현
- 36개 공통 상태 구현
- FULL, FAST, LIGHT, STATIC 기능 동등성 구현
- package-local test, browser screenshot, 접근성, 권한 deny 검증

운영 DB, migration, 실운영 권한 발급, production deployment는 이 임무의 자동 실행 범위가 아니다.

## 2. 시작 전 증거

다음 정보를 먼저 보고한다.

```text
TARGET_ROOT=
GIT_TOPLEVEL=
BRANCH=
HEAD=
WORKTREE_STATUS=
PACKAGE_MANAGER=
FRONTEND_ENTRY=
ROUTER=
STATE_LIBRARY=
TEST_RUNNER=
EXISTING_AUTH_GUARD=
EXISTING_API_ADAPTER=
EXISTING_3D_ENTRY=
```

dirty tree가 있으면 사용자 변경 파일과 이번 작업 파일을 분리한다. 무관한 변경을 reset, checkout, clean, stash, overwrite하지 않는다.

## 3. 문서 우선순위

충돌 시 다음 우선순위를 따른다.

1. 사용자의 최신 명시 지시
2. 저장소의 승인된 canonical spec
3. 이 FINAL 패키지의 정본 문서
4. 현재 코드의 실제 API·권한 계약
5. 기존 구현 패턴

현재 코드와 이 패키지가 충돌하면 조용히 한쪽을 선택하지 않는다. 충돌 위치, 영향, 권장 해결을 먼저 보고한다.

## 4. 구현 경계

### 허용

- 기존 route와 component를 재사용하는 scoped 변경
- 필요한 새 page, component, hook, adapter, test, style 추가
- existing API 응답을 명시적으로 UI DTO로 변환
- 3D renderer failure를 STATIC으로 자동 강등
- fixture를 test 전용으로 만들고 화면에는 `DEMO`를 명시

### 별도 승인 필요

- DB schema와 migration
- production credential 또는 secure store 변경
- 실제 RoleGrant 발급·회수
- live moderation action
- media ingestion·transcoding·rights policy 변경
- dependency major upgrade
- public route 또는 API의 호환성 파괴
- merge, push, production deployment

### 금지

- 운영 데이터를 가짜 fixture로 대체하고 완료 보고
- `isManager` 하나로 6개 역할 권한 처리
- client route guard만으로 authorization 완료 주장
- EPTS, CAMERA_AI, SPORTS_AI 메뉴·수치·placeholder 생성
- 유명 경기장 또는 특정 클럽 asset 복제
- Community raw HTML·임의 embed 렌더링
- 미성년자 이름·사진·연락처·정확한 위치 과다 노출
- 3D 실패 시 핵심 화면 전체 차단
- Community와 Team Communication endpoint·audience 혼합

## 5. 구현 구조

실제 저장소 명명 규칙을 따르되 책임 경계는 유지한다.

```text
features/
├─ auth-role-select/
├─ player-spatial-home/
├─ community/
├─ manager/
└─ shared-ui-state/

domain/
├─ contracts/
├─ permissions/
└─ adapters/
```

저장소가 다른 구조를 사용하면 무리하게 위 폴더를 만들지 않는다. 대신 다음 책임이 섞이지 않게 한다.

- raw API와 UI DTO
- permission decision과 navigation visibility
- 3D rendering mode와 product state
- Community와 Team Communication
- 역할별 page composition과 공통 Manager shell
- 상태 문구와 화면별 safe content

## 6. API Adapter 규칙

1. raw 응답을 page component에서 직접 해석하지 않는다.
2. nullable, missing, stale, forbidden을 adapter 결과로 명시한다.
3. 내부 식별자를 public props에 불필요하게 전달하지 않는다.
4. 날짜는 ISO timestamp로 받고 locale 표시를 view layer에서 처리한다.
5. `updatedAt`, `staleAt`, `asOf`를 버리지 않는다.
6. HTTP 401, 403, 404, 409, 422, 429, 5xx를 구분한다.
7. mutation에는 idempotency key 또는 동일 효과의 서버 계약을 사용한다.
8. 서버가 보장하지 않은 derived metric을 adapter에서 만들지 않는다.

## 7. Permission 규칙

- 공개 가입 결과는 `RolePreference`다.
- `VerifiedRoleGrant.status === VERIFIED`와 유효 기간을 확인한다.
- route별 role, capability, object scope를 서버가 확인한다.
- Manager tab은 capability에 따라 표시하되 direct URL deny도 구현한다.
- grant 회수·만료·scope 변경 시 민감 cache를 제거한다.
- 401은 재인증, 403은 forbidden UI로 처리한다.
- 실제 인증 세션 없이 permission 완료로 보고하지 않는다.

## 8. Community 안전 규칙

- text 입력: 서버 sanitization + client text rendering
- media: MIME, size, scheme, host, audience, rights status 검사
- 신고: 접수와 제재를 분리
- 차단: feed, search, detail, comment에 일관 적용
- 숨김: 개인 범위이며 복원 가능
- moderation: capability와 audit trail 필요
- single-level comment 유지
- prediction: server close time, 비금전성
- 뉴스·YouTube: 출처와 원문 표시

## 9. 3D와 fallback 규칙

`FULL → FAST → LIGHT → STATIC`

- 자동 강등은 같은 route와 사용자 문맥을 유지한다.
- 강등 사유는 진단 로그에 남기되 기술 오류를 사용자에게 그대로 노출하지 않는다.
- STATIC은 2D tactical UI로 완성도 있게 구현한다.
- STATIC에서도 진입, 포지션, anchor, navigation, 상태 UI를 사용할 수 있다.
- renderer success를 데이터·권한 success로 간주하지 않는다.
- reduced motion은 cross-fade와 단계 라벨을 사용한다.

## 10. 실제 문구 규칙

- 사용자에게 보이는 문구는 한국어로 작성한다.
- 테스트용 영어 label이 사용자 화면에 노출되지 않게 한다.
- `Loading...`, `Something went wrong`, `No data` 같은 범용 영어 문구를 금지한다.
- 상태 문구는 `CORE_UI_STATE_CATALOG_KO.md`를 그대로 사용한다.
- Manager 역할명은 한국어 UI와 영문 contract enum을 분리한다.

## 11. 테스트 규칙

- 새 동작은 실패하는 테스트부터 만들고 실제 실패 이유를 확인한다.
- 기존 test fixture를 재사용하고 제품 fixture와 분리한다.
- component test만으로 권한·브라우저·3D 완료를 주장하지 않는다.
- 6개 화면 × 6개 상태를 viewport 320, 390, 430px에서 확인한다.
- keyboard, screen reader label, 200% text zoom, reduced motion을 확인한다.
- 실제 브라우저에서 named flow를 끝까지 확인한다.
- Manager는 허용과 거부를 같은 대상 객체로 각각 검증한다.
- Community는 block·hidden·report·audience가 feed, search, detail, comment에 모두 적용되는지 확인한다.

## 12. 완료 보고 형식

```text
1. 적용 범위
- 구현한 화면:
- 변경한 파일:
- 변경하지 않은 gate:

2. 정본 일치
- 6개 핵심 화면:
- Community 13개 화면군:
- Manager 6개 역할:
- 36개 상태:
- FULL/FAST/LIGHT/STATIC:

3. 검증 증거
- 정적 검사:
- 단위·컴포넌트 테스트:
- 빌드:
- 브라우저 화면:
- 접근성:
- 인증 권한:
- 금지어·가짜 수치 검사:

4. 미검증·차단 항목
- 운영 DB:
- 실제 RoleGrant:
- Community 운영 정책:
- media rights/pipeline:
- production deployment:

5. 증거 등급
- SPEC_READY:
- CODE_EXISTS:
- PACKAGE_VERIFIED:
- UI_VERIFIED:
- AUTH_VERIFIED:
- LIVE_VERIFIED:
```

빈 항목을 `완료`로 채우지 않는다. 검증하지 못했으면 `미검증`과 이유를 쓴다.

