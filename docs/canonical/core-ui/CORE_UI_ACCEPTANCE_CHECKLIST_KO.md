# SnapN Sports V2 CORE UI 완료 판정 체크리스트

## A. 시작 상태

- [ ] 정확한 V2 저장소 root, branch, HEAD를 기록했다.
- [ ] dirty tree와 untracked 파일을 기록했다.
- [ ] 사용자 변경과 이번 작업 범위를 분리했다.
- [ ] package manager, router, state library, test runner를 실제 파일로 확인했다.
- [ ] 기존 auth guard, RoleGrant, API adapter, 3D entry를 확인했다.
- [ ] 운영 DB·배포가 작업 범위 밖임을 기록했다.

## B. 시각 정본

- [ ] 배경 `#121416`, Surface 1 `#1C2023`, Surface 2 `#282D31`, Elevated `#353C41`를 사용한다.
- [ ] Dark Navy를 main surface로 사용하지 않는다.
- [ ] pure black을 main surface로 사용하지 않는다.
- [ ] Pitch Green `#62D36D`를 본인 선수·선택·핵심 진행에 제한한다.
- [ ] 구형 LCD에서도 surface 단계가 border와 명도로 구분된다.
- [ ] 실제 유명 경기장, 특정 클럽 색·스폰서·silhouette를 복제하지 않는다.
- [ ] dashboard card가 Stadium과 Player를 덮지 않는다.
- [ ] 모든 사용자 문구가 한국어다.

## C. 핵심 화면 01 — 가입 역할 선택

- [ ] 공개 선택지는 선수와 매니저뿐이다.
- [ ] 보호자는 선수 초대 흐름으로 안내한다.
- [ ] `RolePreference != Permission`을 설명한다.
- [ ] 매니저 선택만으로 역할 workspace를 열지 않는다.
- [ ] 역할 선택 저장 실패를 가입 성공으로 표시하지 않는다.
- [ ] Loading, Empty, Error, Offline, Forbidden, Stale가 카탈로그 문구와 일치한다.

## D. 핵심 화면 02 — 나의 경기장

- [ ] 경기장이 첫 화면의 주인공이다.
- [ ] 다음 경기 또는 훈련 한 건을 State Layer로 표시한다.
- [ ] 본인 identity indicator가 있다.
- [ ] 탭과 위로 swipe로 피치 진입이 가능하다.
- [ ] orbit 범위가 제한되어 있다.
- [ ] FULL, FAST, LIGHT, STATIC에서 진입 기능이 같다.
- [ ] renderer 실패 시 자동 강등한다.
- [ ] Loading, Empty, Error, Offline, Forbidden, Stale가 카탈로그 문구와 일치한다.

## E. 핵심 화면 03 — 피치 진입

- [ ] 경기장, 피치, 본인 marker, teammate 순서의 전환을 유지한다.
- [ ] 1.2초 미만 로딩에는 불필요한 문구를 띄우지 않는다.
- [ ] 2초 후 2D 계속하기 CTA를 제공한다.
- [ ] reduced motion에서 짧은 cross-fade와 단계 라벨을 제공한다.
- [ ] 전환 실패 시 route lock을 해제한다.
- [ ] Loading, Empty, Error, Offline, Forbidden, Stale가 카탈로그 문구와 일치한다.

## F. 핵심 화면 04 — 나의 포지션

- [ ] 본인 marker가 teammate보다 크다.
- [ ] double ring, `나` 라벨, 포지션 라벨로 본인을 구분한다.
- [ ] teammate 이름·사진 대신 기본적으로 등번호·포지션만 표시한다.
- [ ] 본인 bottom sheet에 검증되지 않은 성능 수치를 넣지 않는다.
- [ ] 포지션이 없을 때 임의 위치를 생성하지 않는다.
- [ ] STATIC 2D tactical board에서도 같은 정보를 사용할 수 있다.
- [ ] Loading, Empty, Error, Offline, Forbidden, Stale가 카탈로그 문구와 일치한다.

## G. 핵심 화면 05 — 나의 팀 공간

- [ ] 본인 선수가 공간의 중심이다.
- [ ] 훈련, 팀, 커리어, 영상, 다음 경기 anchor가 최대 5개다.
- [ ] anchor가 카드형 메뉴 grid로 바뀌지 않았다.
- [ ] 실제 데이터가 없는 anchor에 fixture 수치를 표시하지 않는다.
- [ ] bottom navigation 순서가 `홈 / 훈련 / 커뮤니티 / 영상 / 더보기`다.
- [ ] Career Passport가 별도 bottom tab이 아니다.
- [ ] offline cache로 읽기 가능한 공간을 유지한다.
- [ ] Loading, Empty, Error, Offline, Forbidden, Stale가 카탈로그 문구와 일치한다.

## H. 핵심 화면 06 — Community

- [ ] 피드, 상세, 글쓰기, 단일댓글을 제공한다.
- [ ] 신고, 차단, 숨김과 복원을 제공한다.
- [ ] 뉴스, YouTube, 경기 하이라이트를 제공한다.
- [ ] 승부예측, 리더보드, 개발요청 게시판을 제공한다.
- [ ] Feed Intelligence는 OFF다.
- [ ] single-level comment만 사용한다.
- [ ] 서버 sanitization과 client text rendering을 사용한다.
- [ ] block·hidden·audience·moderation을 feed, search, detail, comment에 적용한다.
- [ ] 신고 접수와 콘텐츠 제재를 구분한다.
- [ ] 뉴스·영상 출처와 원문을 표시한다.
- [ ] 승부예측은 server close time과 비금전성 규칙을 지킨다.
- [ ] Team Communication과 route, API, audience가 분리되어 있다.
- [ ] Loading, Empty, Error, Offline, Forbidden, Stale가 카탈로그 문구와 일치한다.

## I. Manager 역할

- [ ] Coach 내비게이션이 `그라운드 / 계획 / 세션 / 리뷰 / 더보기`다.
- [ ] Team Manager 내비게이션이 `홈 / 일정 / 선수단 / 소통 / 더보기`다.
- [ ] Club Director 내비게이션이 `클럽 / 팀 / 구성원 / 비즈니스 / 더보기`다.
- [ ] Referee 내비게이션이 `홈 / 경기 / 매치 센터 / 보고서 / 더보기`다.
- [ ] Agent 내비게이션이 `홈 / 선수 / 기회 / 일정 / 더보기`다.
- [ ] Analyst 내비게이션이 `홈 / 워크스페이스 / 리포트 / 데이터 범위 / 더보기`다.
- [ ] 6개 역할을 하나의 `isManager` 권한으로 처리하지 않는다.
- [ ] 각 route에 role, capability, object scope 요구 조건이 있다.
- [ ] direct URL 접근도 서버에서 거부한다.
- [ ] grant 만료·회수 후 민감 cache를 제거한다.
- [ ] Referee는 배정 경기만 연다.
- [ ] Agent는 동의 범위 선수만 보고 미성년자 직접 연락을 제한한다.
- [ ] Analyst는 승인된 source와 범위만 사용한다.
- [ ] mutation은 grant ID, capability, target을 감사 로그에 연결할 수 있다.

## J. 공통 상태

- [ ] 36개 상태가 모두 구현되었다.
- [ ] 401과 403을 분리했다.
- [ ] Offline cache 있음과 없음이 다르게 동작한다.
- [ ] Stale 상태에서 `asOf` 또는 마지막 업데이트를 표시한다.
- [ ] Forbidden에서 민감 cache를 제거한다.
- [ ] Empty에서 fixture를 생성하지 않는다.
- [ ] Error에서 raw server message를 노출하지 않는다.
- [ ] 상태 CTA가 사용자를 막힌 route에 남겨두지 않는다.

## K. HARD DISABLED와 데이터 정직성

- [ ] EPTS 메뉴·카드·route·fixture가 없다.
- [ ] CAMERA_AI 메뉴·카드·route·fixture가 없다.
- [ ] SPORTS_AI 메뉴·카드·route·fixture가 없다.
- [ ] AI 점수, 잠재력, 자동 피로도, 검증되지 않은 속도·거리·퍼포먼스 수치가 없다.
- [ ] sample analysis와 coming soon 수치가 없다.
- [ ] mock·fixture는 test 전용이거나 화면에 `DEMO`가 명확하다.
- [ ] 실제 데이터가 없을 때 `없음`, `계산되지 않음`, `승인된 데이터 없음`을 사용한다.

## L. 접근성

- [ ] 모든 주요 터치 영역이 최소 44×44px다.
- [ ] bottom navigation에 아이콘과 텍스트 라벨이 있다.
- [ ] 색상만으로 상태를 구분하지 않는다.
- [ ] 본인 marker가 색상 외 형태와 라벨로 구분된다.
- [ ] keyboard로 모든 action과 dialog를 사용할 수 있다.
- [ ] focus indicator가 배경 대비를 만족한다.
- [ ] Loading, Error, Forbidden의 live region이 과도하게 반복되지 않는다.
- [ ] 200% text zoom에서 주요 문구와 CTA가 잘리지 않는다.
- [ ] reduced motion을 지원한다.
- [ ] 이미지 alt text와 영상 자막 상태를 제공한다.

## M. 검증 증거

- [ ] TypeScript 정적 검사가 통과했다.
- [ ] 변경 범위 단위·컴포넌트 테스트가 통과했다.
- [ ] production build가 통과했다.
- [ ] 320, 390, 430px viewport screenshot을 남겼다.
- [ ] FULL, FAST, LIGHT, STATIC screenshot 또는 시각 증거를 남겼다.
- [ ] 6개 핵심 사용자 flow를 실제 브라우저에서 수행했다.
- [ ] Community 안전 flow를 실제 브라우저에서 수행했다.
- [ ] Manager 허용·거부를 실제 인증 role과 object scope로 수행했다.
- [ ] console error와 unhandled rejection이 없다.
- [ ] 금지어와 hard-disabled route·menu·fixture scan을 수행했다.
- [ ] 변경 파일 목록과 남은 미검증 gate를 보고했다.

## N. 완료 등급

- [ ] `SPEC_READY`: 문서·계약 일관성 검증 완료
- [ ] `CODE_EXISTS`: 실제 저장소 구현 파일 존재
- [ ] `PACKAGE_VERIFIED`: 정적 검사·package-local test·build 완료
- [ ] `UI_VERIFIED`: 브라우저 화면·interaction 검증 완료
- [ ] `AUTH_VERIFIED`: 실제 인증 role·scope 허용·거부 검증 완료
- [ ] `LIVE_VERIFIED`: 승인된 배포 후 live URL 검증 완료

체크하지 못한 등급은 완료 보고에서 `미검증`으로 남긴다.

