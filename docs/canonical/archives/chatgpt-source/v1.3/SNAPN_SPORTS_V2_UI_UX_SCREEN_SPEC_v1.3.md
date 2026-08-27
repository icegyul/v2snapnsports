# SNAPN SPORTS V2 UI/UX SCREEN SPECIFICATION

**v1.3 | Mobile-first | Football Life + Safeguarding UX**

## 0. Product UX Contract

SnapN Sports V2의 첫 화면은 기능 목록이 아니라 **선수의 미래를 보여주는 My Football World**다. 3D는 정체성·탐색·전술 설명에 사용하고, 입력·편집·결제·긴 목록·관리 업무는 2D로 처리한다.

### Global UX rules

- 공개 가입 선택은 PLAYER / MANAGER 두 개뿐이다.
- Manager 세부 역할은 가입 후 Profile > 역할 설정에서 선택하며 실제 Permission은 별도 서버 검증이다.
- 선수 하단 탭: HOME / TRAINING / COMMUNITY / VIDEO / MORE.
- Growth는 HOME의 My Player Card를 눌러 진입한다.
- Community는 V2.0에서 기존 기능 parity를 우선한다.
- EPTS/Camera/Evidence AI 메뉴·수치·placeholder는 release gate 전 일반 사용자에게 노출하지 않는다.
- 화면당 Primary CTA는 원칙적으로 1개다.
- 3D 실패/저사양/접근성 모드에서도 모든 핵심 기능에 2D/Static 경로가 존재해야 한다.

## 1. Shared Visual System

| 영역 | 기준 |
| --- | --- |
| 배경 | Dark navy/near-black. 경기장/잔디가 시각적 주인공 |
| Accent | 잔디/상태 강조색을 제한적으로 사용 |
| Card | 반투명/불투명 2D sheet. 3D 위 정보는 최소화 |
| Typography | 숫자보다 의미 우선. 유소년에게 게임식 종합능력치 금지 |
| Touch | 주요 CTA 44px 이상, 현장 Coach/Referee는 52px 이상 권장 |
| Motion | Full cinematic은 첫 실행/선택 실행. 일반 진입은 Fast Entry |
| Accessibility | 색상만으로 상태 구분 금지, text/icon 병행, reduce-motion/static home 제공 |

## 2. Public Entry & Account Screens

### A01 Splash / Session Restore
- 목적: 인증 복구와 첫 자산 preload.
- 노출: Logo, progress only.
- 금지: 기능 카드/프로모션 과다 노출.
- 완료: 인증 유효 시 Role Experience로 이동.

### A02 Login
- Email/phone/social provider는 기존 시스템 증거에 따라 제공.
- Primary CTA: 로그인.
- Secondary: 가입 / 비밀번호 복구.

### A03 Public Signup Type
- 카드 2개만 표시: PLAYER / MANAGER.
- 설명은 한 줄: “선수로 시작” / “팀·구단·축구 업무 관리”.
- Guardian 공개 가입 버튼 없음.

### A04 Player Onboarding
- 이름/생년/포지션/등번호/소속 연결.
- 미성년자는 Guardian Invite 단계로 연결.
- 완료 전 Stadium 임시 게임 능력치 생성 금지.

### A05 Manager Onboarding
- 기본 프로필과 소속/초대 코드 입력.
- 세부 직무 선택은 이후 개인설정에서 가능.

### A06 Guardian Invite
- 선수/구단이 발급한 invite token을 통해 Guardian 생성.
- 연결 대상 선수와 권한 범위를 명확히 표시.

## 3. Player My Football World

### P01 Stadium Exterior
- 첫 실행/사용자 선택 시 Full Cinematic.
- 첫 화면은 경기장 외관 + Skip/소리 설정만.

### P02 Zoom / Pitch Entry
- Stadium Exterior -> Stand -> Pitch.
- 네트워크/thermal 상태에 따라 Fast/Light/Static fallback.

### P03 Spatial Home
- 피치가 화면 70%+를 차지.
- 본인 카드, 팀 formation, scoreboard, 최소 상태 신호.
- Bottom navigation 5개 고정.
- Primary CTA는 Home State Engine이 1개만 선택.

### P04 My Player Card Bottom Sheet
- 이름/등번호/포지션/팀/새 리포트 여부.
- CTA: My Growth.
- 탭 시 전체 페이지 전환보다 Bottom Sheet 우선.

### P05 Team Formation
- 실제 저장 formation에 맞춰 팀원 카드 배치.
- 본인 scale 1.0, 동료 축소.
- 내부 코치 메모/민감정보 미노출.

### P06 Scoreboard State
- NORMAL / NEXT_TRAINING / MATCH_TODAY / NEW_VIDEO / NEW_REPORT 등.
- 동시에 여러 상태가 있더라도 primary 하나 + secondary 최대 2개.

### P07 Training List
- 다음 일정이 첫 카드.
- Past / Upcoming 분리.
- 공공 날씨 Context는 E35가 활성화된 경우에만 작은 보조 badge로 표시.

### P08 Training Detail
- 시간/장소/참가응답/훈련 목적/공유된 전술.
- EPTS 수치 영역은 release 전 존재 자체를 숨김.

### P09 Community Feed
- 기존 커뮤니티 기능 parity.
- V2.0 ordering은 기존 서비스 기준.
- 중앙 탭 위치로 재방문 핵심 기능화.

### P10 Community Post Detail
- 본문/미디어/댓글/반응/신고/차단.
- 미성년 visibility를 서버 정책과 일치.

### P11 Community Composer
- 게시 범위 PUBLIC/CLUB/TEAM/FOLLOWERS/PRIVATE 중 허용 범위만.
- 미디어 업로드는 Media Engine signed upload.

### P12 Video Library
- 권한 있는 팀/개인/커뮤니티 영상.
- EPTS/AI 자동 분석 뱃지는 기능 gate 전 미노출.

### P13 Growth / Football Career Passport
- 첫 화면은 현재 시즌의 성장/기록 요약.
- CTA: `My Career Passport`로 장기 이력 진입.
- 센서 없이 출석/훈련/경기/포지션/코치 승인 피드백/대표 영상/시즌 milestone으로 완전하게 동작.

### P14 My Stadium
- 현재 recipe와 저장 슬롯.
- free/premium entitlement 표시.

### P15 Stadium Builder
- STEP: STYLE -> BOWL -> ROOF -> STAND -> SEAT -> FACADE/LIGHT -> ENVIRONMENT.
- 금지조합은 선택 불가 또는 대체안 제시.
- 한 화면에 전체 옵션 노출 금지.

### P16 More / Profile
- 개인정보, team link, guardian, stadium settings, notification, privacy/export/delete.

## 4. Manager Shared Shell

### M01 Manager Home Router
- active role에 따라 workspace로 라우팅.
- 검증되지 않은 역할은 “선택됨 / 승인 대기” 상태로 표시하고 민감 메뉴 숨김.

### M02 Role Settings
- Coach / Team Manager / Club Director / Referee / Agent / Analyst를 선호 역할로 선택 가능.
- Role Preference와 RoleGrant를 별도 표시.

### M03 Credential Verification
- 조직 초대, owner 승인, 자격 증빙 등 역할별 검증.
- PENDING / VERIFIED / REJECTED / EXPIRED.

### M04 Role Switcher
- 실제 활성 RoleGrant만 workspace 전환 대상으로 제공.

## 5. Coach Workspace

### C01 Ground
- 오늘 세션, formation, 선수, 준비 상태, 세션 시작 CTA.
- EPTS/Camera 미출시 상태에서는 관련 상태 카드 자체를 숨김.

### C02 Plan
- 2D editor 우선. 목표/드릴/그룹/세트/휴식/역할.

### C03 Tactical Board
- 2D 작성 -> 3D preview.
- 계획 전술과 실제 데이터 명확히 구분.

### C04 Session
- 타이머/세트/휴식/출석/코치 메모.
- 오프라인 로컬 이벤트 로그 필수.

### C05 Review
- V2.0은 코치 메모/드릴 결과/영상 기반.
- Future AI 결과는 Evidence gate 후 별도 section.

## 6. Team Manager Workspace

### TM01 Home
- 오늘 일정/참가응답/미응답/공지/업무.
### TM02 Schedule
- 훈련/경기/행사/장소.
### TM03 Squad
- 선수/등번호/포지션/등록/보호자 연결.
### TM04 Communications
- 공지/참가응답/부모·팀 메시지.

## 7. Club Director Workspace

### CD01 Club Home
- Club Stadium 또는 운영 중심 summary; 화면 복잡도에 따라 2D 우선 가능.
### CD02 Teams
- 팀/코치/시즌/상태.
### CD03 People
- 선수/코치/스태프/보호자/권한.
### CD04 Business
- 프로그램/구독/캠프/사업 기능. 결제는 entitlement 서버 기준.
### CD05 Club Stadium
- tenant locked recipe와 승인된 브랜드 asset.

## 8. Referee Workspace

### R01 Today
- 배정 경기 하나를 primary CTA로 강조.
### R02 Matches
- 예정/완료 경기.
### R03 Match Center
- Start/period/goal/substitution/card/incident/end. 큰 버튼.
- Offline Sync 필수.
### R04 Match Report
- 사건/결과 검토 -> 제출 -> FINALIZED 이후 correction workflow.

## 9. Agent Workspace

### AG01 Home
- 관리 선수/미팅/트라이아웃/새 승인 포트폴리오.
### AG02 Players
- 관계/승인된 선수만 상세 진입.
### AG03 Portfolio
- 공개 승인 프로필/포지션/경력/대표 영상. 건강·코치 내부메모 금지.
### AG04 Opportunities
- 제안 -> 검토 -> 수락/거절 -> 일정 -> 종료.

## 10. Analyst Workspace

### AN01 Review Queue
- 권한 팀 범위 내 경기/훈련/영상 review.
### AN02 Reports
- 승인된 분석/운영 report.
### AN03 Search
- Permission-aware Search만 사용.

## 11. Global States

| State | UI |
| --- | --- |
| LOADING | skeleton + 핵심 route 유지 |
| EMPTY | 왜 비어있는지 설명 + 1 CTA |
| ERROR | 재시도 + fallback |
| OFFLINE | 로컬 가능 기능과 sync 대기 상태 명시 |
| PERMISSION_DENIED | 존재를 과도하게 노출하지 않고 요청/관리 경로만 |
| FEATURE_DISABLED | 일반 사용자는 메뉴 숨김; 내부 beta만 설명 가능 |
| LOW_POWER | Light 3D/Static 자동 전환 안내 |

## 12. UX Release Gates

- Public signup에 3번째 이상의 계정 타입이 나타나면 실패.
- Player HOME에서 처음 3초 내 My Position/Next Event를 인지할 수 없으면 실패.
- Community가 More 아래로 숨겨지면 실패.
- Manager Role preference만으로 민감 데이터가 열리면 출시 금지.
- EPTS/Camera/AI 미승인 기능이 일반 UI에 placeholder 숫자로 나타나면 출시 금지.
- 3D 실패 시 핵심 기능이 막히면 출시 금지.


## 13. Football Life Screens

### FL01 Career Passport
- 시즌 Chapter 카드: 팀/시즌/포지션/대표 milestone.
- 최상단은 “현재”를 보여주고 과거 시즌은 세로 timeline.
- 각 항목에는 원천/검증 상태를 내부적으로 연결하되 화면은 과도한 행정 정보 없이 표현.
- 타 구단 내부 메모나 비공개 전술자료는 Career Passport에 포함하지 않는다.

### FL02 Career Event Detail
- 이벤트 설명, 날짜, 팀/시즌, 연결된 대표 영상.
- 수정 가능한 것은 사용자 선택 highlight/표시 범위뿐. 공식 출석/경기 source 사실을 임의 수정하지 않는다.

### FL03 Career Passport Share Settings
- PRIVATE / GUARDIAN / CLUB / SCOUTING_ALLOWED 범위.
- 미성년자는 Scouting 공개를 켤 때 Guardian/구단 정책 상태를 명확히 보여준다.

### FL04 Opportunities
- “프로 추천 점수”가 아니라 조건이 맞는 공개 트라이아웃/테스트/상담 기회 목록.
- 왜 표시됐는지: 연령/포지션/지역/일정 등 투명 reason label.
- 관심/수락 전에 공개되는 Passport 필드를 미리 확인.

### FL05 Opportunity Detail
- 주최 조직 검증 상태, 일정, 장소, 대상 조건, 공개 요청 필드.
- 미성년자의 직접 연락처 노출 금지. 연락은 Guardian/Club-mediated thread 우선.

## 14. Team Communication Screens

### COM01 Communications Inbox
- 운영 Thread를 일정/훈련/경기/일반 팀 대화로 그룹화.
- Community Feed와 시각적으로/개념적으로 구분.

### COM02 Thread
- 메시지, 공지 correction, 참가응답 링크.
- 미성년 대상 contact policy에 따라 direct composer가 숨겨지고 Guardian/Club route로 대체될 수 있음.

### COM03 Announcement Composer
- 팀/그룹 대상 선택은 membership 기반.
- Preview에서 실제 수신 대상 수와 제외/중재 대상 설명.

## 15. Safeguarding UX Rules

- 안전상 deny된 기능은 “권한 없음” 하나로 끝내기보다 가능한 안전 경로(보호자 연결/구단 문의)를 제시한다.
- Agent/Referee가 미성년 선수의 private contact 버튼을 기본적으로 보지 못하게 한다.
- 신고/차단은 Community, Communication, Portfolio/Opportunity 어디서나 동일한 safety action sheet로 진입한다.
- Safety incident 세부 판정/신고자 민감정보는 일반 사용자에게 노출하지 않는다.
- Safety 정책 때문에 검색 대상이 제외됐을 때 해당 선수의 존재 자체를 추론할 수 있는 count/facet을 제공하지 않는다.

## 16. v1.3 UX Release Gates

- Career Passport에 source 없는 임의 경력/능력치가 표시되면 출시 금지.
- 미성년 Scouting이 Guardian/정책 동의 없이 검색/추천되면 출시 금지.
- External Agent/Referee -> minor direct DM 경로가 있으면 출시 금지.
- Team Communication이 Community DB/visibility를 그대로 재사용해 private 운영 메시지가 공개 피드에 섞이면 출시 금지.
- Earthus 장애로 Training/Match 화면이 열리지 않으면 출시 금지.
