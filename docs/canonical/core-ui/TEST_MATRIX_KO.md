# SnapN Sports V2 CORE UI 최종 테스트 매트릭스

## 1. 판정 규칙

- `P0`: 개인정보, 권한 우회, 미성년자 안전, 데이터 위조, 핵심 flow 차단
- `P1`: 주요 기능·상태·3D fallback·Community parity 실패
- `P2`: 접근성, responsive, copy, 비핵심 visual 차이
- 단위 test 통과는 브라우저·인증·live 검증을 대신하지 않는다.
- 각 test 결과는 `PASS`, `FAIL`, `BLOCKED`, `NOT_RUN` 중 하나로 기록한다.
- `BLOCKED`는 필요한 외부 조건과 재개 방법을 함께 적는다.

## 2. 6개 핵심 화면 정상 flow

| ID | 우선순위 | 시나리오 | 예상 결과 | 증거 |
|---|---|---|---|---|
| CORE-01 | P0 | 공개 가입에서 역할 선택 | 선수·매니저만 보이고 선택은 preference로 저장 | DOM, API request |
| CORE-02 | P0 | 보호자 가입 시도 | 공개 보호자 가입 없이 초대 route 안내 | route, screenshot |
| CORE-03 | P1 | 로그인 후 Player Home | 나의 경기장이 첫 핵심 화면 | screenshot |
| CORE-04 | P1 | 경기장 탭 | 피치 진입 전환 후 나의 포지션 도착 | video, final route |
| CORE-05 | P1 | 경기장 swipe up | 탭과 같은 결과 | video |
| CORE-06 | P1 | 나의 포지션 표시 | 본인 marker가 크기·double ring·라벨로 우선 | screenshot, DOM |
| CORE-07 | P0 | teammate 기본 표시 | 이름·사진 없이 등번호·포지션 최소 정보 | screenshot |
| CORE-08 | P1 | 나의 팀 공간 진입 | 본인 중심과 최대 5개 anchor | screenshot |
| CORE-09 | P1 | bottom navigation | 홈·훈련·커뮤니티·영상·더보기 순서 | DOM |
| CORE-10 | P1 | Career 진입 | bottom tab이 아니라 player·spatial anchor에서 진입 | route |

## 3. 공통 상태 36개

각 test는 `CORE_UI_STATE_CATALOG_KO.md`의 제목, 설명, Primary CTA, Secondary CTA, cache 규칙을 모두 비교한다.

| ID | 화면 | 상태 | 핵심 확인 | 우선순위 |
|---|---|---|---|---|
| STATE-01 | 가입 역할 선택 | Loading | role card skeleton, submit 비활성 | P1 |
| STATE-02 | 가입 역할 선택 | Empty | 숨은 role을 대신 표시하지 않음 | P0 |
| STATE-03 | 가입 역할 선택 | Error | 선택 저장 성공으로 오인하지 않음 | P0 |
| STATE-04 | 가입 역할 선택 | Offline | 로컬 선택을 가입 완료로 처리하지 않음 | P0 |
| STATE-05 | 가입 역할 선택 | Forbidden | 기존 grant를 preference로 덮어쓰지 않음 | P0 |
| STATE-06 | 가입 역할 선택 | Stale | 최신 설정 확인 전 submit 거부 | P0 |
| STATE-07 | 나의 경기장 | Loading | asset·data loading 분리, 2초 후 2D CTA | P1 |
| STATE-08 | 나의 경기장 | Empty | 가짜 팀·일정 없음 | P0 |
| STATE-09 | 나의 경기장 | Error | renderer 실패는 STATIC 강등 우선 | P1 |
| STATE-10 | 나의 경기장 | Offline | cache 기준 시각과 저장 공간 진입 | P1 |
| STATE-11 | 나의 경기장 | Forbidden | cached team·schedule 제거 | P0 |
| STATE-12 | 나의 경기장 | Stale | content 유지와 기준 시각 표시 | P1 |
| STATE-13 | 피치 진입 | Loading | 1.2초 threshold와 2D 계속하기 | P1 |
| STATE-14 | 피치 진입 | Empty | 팀 공간으로 계속 가능 | P1 |
| STATE-15 | 피치 진입 | Error | route lock 해제 | P0 |
| STATE-16 | 피치 진입 | Offline | cached pitch 또는 empty pitch 분기 | P1 |
| STATE-17 | 피치 진입 | Forbidden | marker 미렌더링 | P0 |
| STATE-18 | 피치 진입 | Stale | 다음 화면까지 stale 표시 유지 | P1 |
| STATE-19 | 나의 포지션 | Loading | 다른 선수 실명 skeleton 없음 | P0 |
| STATE-20 | 나의 포지션 | Empty | 임의 포지션 생성 없음 | P0 |
| STATE-21 | 나의 포지션 | Error | 부분 teammate 단독 노출 없음 | P0 |
| STATE-22 | 나의 포지션 | Offline | cached teammate 최소 정보 유지 | P0 |
| STATE-23 | 나의 포지션 | Forbidden | formation cache 제거 | P0 |
| STATE-24 | 나의 포지션 | Stale | 본인 marker와 freshness 동시 식별 | P1 |
| STATE-25 | 나의 팀 공간 | Loading | 가짜 anchor 수치 없음 | P0 |
| STATE-26 | 나의 팀 공간 | Empty | 본인 anchor 유지, 빈 정보 명시 | P1 |
| STATE-27 | 나의 팀 공간 | Error | bottom navigation으로 탈출 가능 | P1 |
| STATE-28 | 나의 팀 공간 | Offline | mutation·최신 media 제한 설명 | P1 |
| STATE-29 | 나의 팀 공간 | Forbidden | 팀 cache 제거, 개인 Career 별도 판정 | P0 |
| STATE-30 | 나의 팀 공간 | Stale | 가장 오래된 기준 시각을 숨기지 않음 | P1 |
| STATE-31 | 커뮤니티 | Loading | 실제 인물처럼 보이는 fixture 없음 | P0 |
| STATE-32 | 커뮤니티 | Empty | private 콘텐츠 존재를 암시하지 않음 | P0 |
| STATE-33 | 커뮤니티 | Error | raw server error 비노출, draft 유지 | P0 |
| STATE-34 | 커뮤니티 | Offline | 게시 성공 대신 local draft | P0 |
| STATE-35 | 커뮤니티 | Forbidden | feed·detail·search cache 제거 | P0 |
| STATE-36 | 커뮤니티 | Stale | scroll 유지와 기준 시각 표시 | P1 |

## 4. 3D·fallback

| ID | 시나리오 | 예상 결과 | 우선순위 |
|---|---|---|---|
| 3D-01 | FULL 지원 기기 | full geometry와 모든 핵심 action 사용 가능 | P1 |
| 3D-02 | FULL 초기화 실패 | FAST로 자동 강등, route 유지 | P1 |
| 3D-03 | FAST runtime FPS 저하 | LIGHT로 강등, 현재 화면·selection 유지 | P1 |
| 3D-04 | LIGHT renderer 실패 | STATIC으로 강등 | P1 |
| 3D-05 | STATIC | Stadium 진입, position, anchors, navigation 사용 가능 | P0 |
| 3D-06 | renderer 실패 + data 성공 | Error blocking 대신 fallback 사용 | P1 |
| 3D-07 | renderer 성공 + data 403 | Forbidden 처리, 민감 정보 미표시 | P0 |
| 3D-08 | reduced motion | cross-fade와 단계 라벨, 긴 camera motion 없음 | P2 |
| 3D-09 | mode 변경 중 입력 | 중복 navigation·stuck state 없음 | P1 |
| 3D-10 | 유명 구장 비교 | 특정 stadium·club trade dress 복제 없음 | P1 |

## 5. Community 기능 parity

| ID | 화면·기능 | 시나리오 | 예상 결과 | 우선순위 |
|---|---|---|---|---|
| COM-01 | 피드 | 최신순 cursor page 이동 | 중복·누락 없이 접근 가능한 항목만 표시 | P1 |
| COM-02 | 피드 | category 변경 | 명시적 탭 filter, 추천 점수 없음 | P1 |
| COM-03 | 상세 | 게시글 열기 | audience·block·moderation 검사 후 표시 | P0 |
| COM-04 | 글쓰기 | 정상 글 제출 | idempotency key와 성공 응답 후 완료 | P1 |
| COM-05 | 글쓰기 | 중복 탭·연속 제출 | 게시글 한 건만 생성 | P1 |
| COM-06 | 글쓰기 | offline 제출 | local draft로 저장, 서버 성공 표시 없음 | P0 |
| COM-07 | 수정 | audience 변경 | 서버 allowlist 안에서만 변경 | P0 |
| COM-08 | 댓글 | 댓글 작성 | post 직접 연결 single-level comment 생성 | P1 |
| COM-09 | 댓글 | 대댓글 payload 주입 | 서버 거부 또는 parentCommentId 무시 금지 | P0 |
| COM-10 | 좋아요 | 빠른 반복 탭 | 최종 서버 상태와 count 일치 | P1 |
| COM-11 | 이미지 카드 | 허용 MIME·크기 | 안전한 업로드와 alt text | P1 |
| COM-12 | 이미지 카드 | 비허용 scheme·MIME | 업로드·렌더링 거부 | P0 |
| COM-13 | 검색 | 차단·숨김 콘텐츠 검색 | 결과에서 제외 | P0 |

## 6. Community 안전

| ID | 시나리오 | 예상 결과 | 우선순위 |
|---|---|---|---|
| SAFE-01 | script·event handler 입력 | 서버 sanitize, client text 렌더링, 실행 0건 | P0 |
| SAFE-02 | javascript URL | 링크 생성·이동 거부 | P0 |
| SAFE-03 | 임의 iframe embed | 렌더링 거부 | P0 |
| SAFE-04 | 게시글 신고 | 접수 성공, 즉시 삭제 완료로 표시하지 않음 | P0 |
| SAFE-05 | 중복 신고 | duplicate 정책 문구, 중복 제재 없음 | P1 |
| SAFE-06 | 미성년자 안전 신고 | 별도 reason 유지, 내부 note 비노출 | P0 |
| SAFE-07 | 사용자 차단 | feed·search·detail·comment cache에서 제거 | P0 |
| SAFE-08 | 차단 해제 | private audience 권한이 새로 생기지 않음 | P0 |
| SAFE-09 | 게시글 숨김 | 사용자 개인 피드에서 제외 | P1 |
| SAFE-10 | 숨김 복원 | 원래 접근 권한이 있을 때만 복원 | P0 |
| SAFE-11 | moderation 제거 | 일반 피드 제외, 상태 문구 정책 일치 | P0 |
| SAFE-12 | private audience URL 추측 | 서버 403, 본문·메타 미노출 | P0 |
| SAFE-13 | block된 작성자 URL 추측 | 서버 정책대로 거부·최소 상태 | P0 |
| SAFE-14 | client cache 후 권한 회수 | cache purge, offline 재노출 없음 | P0 |
| SAFE-15 | 개인정보 패턴 입력 | 안전 경고와 정책상 validation 적용 | P0 |

## 7. 뉴스·영상·하이라이트

| ID | 시나리오 | 예상 결과 | 우선순위 |
|---|---|---|---|
| MEDIA-01 | 뉴스 카드 | publisher, publishedAt, 원문 링크 표시 | P1 |
| MEDIA-02 | 요약 없음 | 가짜 요약 없이 제목·출처·링크만 표시 | P0 |
| MEDIA-03 | 외부 뉴스 이동 | 외부 사이트 안내 후 canonical URL 열기 | P2 |
| MEDIA-04 | 허용 YouTube ID | 안전한 embed 또는 외부 링크 | P1 |
| MEDIA-05 | 비허용 video ID·host | embed 거부 | P0 |
| MEDIA-06 | 자동재생 | 기본 OFF | P1 |
| MEDIA-07 | 하이라이트 READY | valid playback URL과 권한 있을 때 재생 | P1 |
| MEDIA-08 | 하이라이트 PROCESSING | 준비 중 문구, 가짜 percentage 없음 | P0 |
| MEDIA-09 | 하이라이트 권한 회수 | 재생 중단, cached URL 제거 | P0 |
| MEDIA-10 | rights 제한 | 공개 범위 변경 문구, 재생 거부 | P0 |

## 8. 승부예측·리더보드

| ID | 시나리오 | 예상 결과 | 우선순위 |
|---|---|---|---|
| PRED-01 | 마감 전 최초 제출 | 선택 저장 | P1 |
| PRED-02 | 마감 전 변경 | 기존 선택 idempotent update | P1 |
| PRED-03 | client clock 조작 | server closesAt 기준 유지 | P0 |
| PRED-04 | 마감 후 제출 | 서버 거부와 마감 문구 | P0 |
| PRED-05 | 경기 취소·변경 | 예측 무효와 이유 표시 | P1 |
| PRED-06 | 금전성 문구 scan | 배당·현금·수익 표현 0건 | P0 |
| PRED-07 | provisional leaderboard | `집계 중` 또는 `잠정` 라벨 | P1 |
| PRED-08 | final leaderboard | formula version과 tie-breaker 일치 | P1 |
| PRED-09 | 미성년자 표시 | 안전한 별칭 사용 | P0 |
| PRED-10 | 개인정보로 정렬 | 연락처·실명 private field 사용 안 함 | P0 |

## 9. 개발요청

| ID | 시나리오 | 예상 결과 | 우선순위 |
|---|---|---|---|
| DEVREQ-01 | 요청 작성 | 제목·설명 validation 후 접수 | P1 |
| DEVREQ-02 | 계정·안전 문제 입력 | 공개 게시 대신 신고·지원 경로 안내 | P0 |
| DEVREQ-03 | 보안 취약점 입력 | 공개 게시 억제와 안전한 별도 경로 | P0 |
| DEVREQ-04 | 공감 | 사용자당 한 번의 idempotent 상태 | P1 |
| DEVREQ-05 | 일반 사용자 상태 변경 | 서버 거부 | P0 |
| DEVREQ-06 | 운영 capability 상태 변경 | audit trail과 허용된 transition | P1 |
| DEVREQ-07 | 계획됨 상태 | 출시 보장 문구 없음 | P1 |

## 10. Manager 공통 권한

| ID | 시나리오 | 예상 결과 | 우선순위 |
|---|---|---|---|
| AUTH-01 | Manager RolePreference만 있음 | workspace 거부, 승인 대기 UI | P0 |
| AUTH-02 | VERIFIED grant + capability + scope | 해당 action 허용 | P0 |
| AUTH-03 | PENDING grant | 거부 | P0 |
| AUTH-04 | EXPIRED grant | 거부와 cache purge | P0 |
| AUTH-05 | REVOKED grant | 거부와 cache purge | P0 |
| AUTH-06 | role 일치, capability 없음 | mutation 거부 | P0 |
| AUTH-07 | capability 일치, object scope 다름 | target 접근 거부 | P0 |
| AUTH-08 | tab 숨김 후 direct URL | 서버·route guard 모두 거부 | P0 |
| AUTH-09 | organization switch | selection clear 후 새 scope 요청 | P0 |
| AUTH-10 | stale grant cache + mutation | 서버 거부, 성공 UI 없음 | P0 |
| AUTH-11 | 401 | 재인증 flow | P0 |
| AUTH-12 | 403 | Forbidden UI와 민감 cache 제거 | P0 |

## 11. Manager 역할별

| ID | 역할 | 시나리오 | 예상 결과 | 우선순위 |
|---|---|---|---|---|
| MGR-01 | Coach | `TEAM_READ`만으로 Ground 읽기 | 허용 | P1 |
| MGR-02 | Coach | `TEAM_PLAN_WRITE` 없이 plan 수정 | 거부 | P0 |
| MGR-03 | Coach | 가짜 AI 피드백 scan | 0건 | P0 |
| MGR-04 | Team Manager | `SCHEDULE_MANAGE`로 일정 수정 | 허용 범위에서 성공 | P1 |
| MGR-05 | Team Manager | `TEAM_COMMS_SEND` 없이 발송 | 거부 | P0 |
| MGR-06 | Team Manager | Community와 team comms 비교 | route·API·audience 분리 | P0 |
| MGR-07 | Club Director | `CLUB_READ`로 overview | 허용 | P1 |
| MGR-08 | Club Director | business capability 없음 | tab·URL 거부 | P0 |
| MGR-09 | Club Director | 없는 집계 데이터 | 가짜 0·매출 수치 없이 Empty | P0 |
| MGR-10 | Referee | 배정 경기 Match Center | 허용 | P1 |
| MGR-11 | Referee | 비배정 경기 URL | 거부 | P0 |
| MGR-12 | Referee | offline event queue | 동기화 완료로 오인하지 않음 | P0 |
| MGR-13 | Agent | 동의된 선수 | 최소 허용 정보 표시 | P1 |
| MGR-14 | Agent | 미동의 선수 URL | 거부와 cache 제거 | P0 |
| MGR-15 | Agent | 미성년자 직접 연락 | CTA 없음, 보호자·클럽 route | P0 |
| MGR-16 | Analyst | 승인 source workspace | provenance·asOf 표시 | P1 |
| MGR-17 | Analyst | 비승인 source URL | 거부 | P0 |
| MGR-18 | Analyst | 계산 불가 값 | `계산되지 않음` 표시 | P0 |
| MGR-19 | Analyst | EPTS·CAMERA_AI·SPORTS_AI | 사용자 노출 0건 | P0 |

## 12. 접근성·responsive

| ID | 시나리오 | 예상 결과 | 우선순위 |
|---|---|---|---|
| A11Y-01 | keyboard-only | 모든 CTA, tab, dialog 사용 가능 | P1 |
| A11Y-02 | screen reader | 페이지 제목, state, action 순서 이해 가능 | P1 |
| A11Y-03 | 200% text zoom | 핵심 문구·CTA 잘림·겹침 없음 | P1 |
| A11Y-04 | 320px width | horizontal overflow 없이 핵심 flow 가능 | P1 |
| A11Y-05 | 390px width | canonical composition 유지 | P2 |
| A11Y-06 | 430px width | 과도한 stretch 없이 composition 유지 | P2 |
| A11Y-07 | color vision | 본인·상태가 색상 외 표현으로 구분 | P1 |
| A11Y-08 | reduced motion | 3D 진입을 안전한 cross-fade로 대체 | P1 |
| A11Y-09 | focus visible | Graphite surface에서 focus ring 식별 | P1 |
| A11Y-10 | dialog | focus trap, label, 닫기, 뒤로가기 | P1 |
| A11Y-11 | live region | Loading 반복 낭독 없음, Error 한 번 알림 | P2 |
| A11Y-12 | media | alt text와 자막 가용 상태 표시 | P1 |

## 13. Hard-disabled·데이터 정직성

| ID | 검사 | 예상 결과 | 우선순위 |
|---|---|---|---|
| TRUTH-01 | 사용자 menu·route의 EPTS | 0건 | P0 |
| TRUTH-02 | 사용자 menu·route의 CAMERA_AI | 0건 | P0 |
| TRUTH-03 | 사용자 menu·route의 SPORTS_AI | 0건 | P0 |
| TRUTH-04 | AI 점수·잠재력·자동 피로도 | 0건 | P0 |
| TRUTH-05 | 검증되지 않은 속도·거리·performance percent | 0건 | P0 |
| TRUTH-06 | sample analysis·coming soon 수치 | 0건 | P0 |
| TRUTH-07 | fixture 운영 노출 | 0건 또는 명시적 DEMO | P0 |
| TRUTH-08 | 데이터 없음 | Empty·계산되지 않음·승인 데이터 없음 | P0 |
| TRUTH-09 | stale 데이터 | 기준 시각과 stale 라벨 | P1 |
| TRUTH-10 | source 기반 분석 | provenance, asOf, resolution 유지 | P0 |

## 14. 보안·개인정보

| ID | 시나리오 | 예상 결과 | 우선순위 |
|---|---|---|---|
| SEC-01 | public API 내부 ID | 불필요한 내부 ID·member key 비노출 | P0 |
| SEC-02 | teammate private field | 이름·사진·연락처 기본 비노출 | P0 |
| SEC-03 | 로그 | token·연락처·민감 본문 비기록 | P0 |
| SEC-04 | mutation replay | idempotency 또는 안전한 충돌 처리 | P0 |
| SEC-05 | permission TOCTOU | server가 mutation 시점에 재검사 | P0 |
| SEC-06 | cached forbidden data | grant·audience 변경 후 purge | P0 |
| SEC-07 | media URL | 허용 scheme·host·MIME만 렌더링 | P0 |
| SEC-08 | error UI | stack·SQL·raw response 비노출 | P0 |

## 15. 최종 브라우저 증거 세트

최소 다음 screenshot 또는 video를 남긴다.

1. 가입 역할 선택 정상·Offline·Forbidden
2. Stadium FULL·STATIC·Stale
3. 피치 진입 정상·reduced motion·Error recovery
4. 나의 포지션 정상·Empty·Forbidden
5. 나의 팀 공간 정상·Offline·Stale
6. Community 피드·글쓰기·신고·차단·숨김·뉴스·영상·예측·리더보드·개발요청
7. 각 Manager role home
8. 각 Manager role permission denied direct URL
9. 320px·390px·430px
10. 200% text zoom과 keyboard focus

## 16. 완료 gate

- P0 `FAIL`이 하나라도 있으면 완료가 아니다.
- P1 `FAIL`은 사용자와 범위 조정 없이 완료로 넘길 수 없다.
- `BLOCKED`인 AUTH 또는 LIVE test가 있으면 `AUTH_VERIFIED`, `LIVE_VERIFIED`를 표시하지 않는다.
- screenshot이 있어도 console error와 action 결과를 확인하지 않으면 `UI_VERIFIED`가 아니다.
- build가 통과해도 실제 route, permission, cache, media, 3D flow를 확인하지 않으면 CORE UI 완료가 아니다.

