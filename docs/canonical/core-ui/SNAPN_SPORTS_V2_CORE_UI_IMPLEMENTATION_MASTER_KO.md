# SnapN Sports V2 CORE UI 구현 정본

## 1. 제품 문장

SnapN Sports V2의 첫 경험은 **“내가 속한 축구 공간으로 들어간다”**이다.

로그인 후 카드형 대시보드를 먼저 보여주지 않는다. 사용자는 경기장에 도착하고, 피치로 들어가 자신의 위치를 확인한 뒤 팀 공간으로 이동한다.

`로그인 → 나의 경기장 → 피치 진입 → 나의 포지션 → 나의 팀 공간`

Community는 이 공간과 연결되지만 팀 내부 커뮤니케이션을 대체하지 않는다. Manager는 선수용 공간을 그대로 복제하지 않고 역할별 작업 공간을 사용한다.

## 2. 공통 시각 시스템

### 2.1 색상

| 역할 | 값 | 사용 규칙 |
|---|---:|---|
| 앱 배경 | `#121416` | 전체 배경 |
| Surface 1 | `#1C2023` | 내비게이션, 기본 패널 |
| Surface 2 | `#282D31` | 입력, 보조 패널, 선택 영역 |
| Elevated | `#353C41` | 모달, bottom sheet, 강조 경계 |
| Primary Text | `#F4F6F7` | 제목과 핵심 값 |
| Secondary Text | `#B8C0C5` | 설명과 메타 정보 |
| Pitch Green | `#62D36D` | 본인 선수, 현재 선택, 완료 가능한 CTA |

Pitch Green은 경기장 전체 장식색이 아니다. 본인 선수, 현재 상태, 진행 방향에 제한해서 사용한다. 상태는 색상과 함께 아이콘, 라벨, 텍스트를 제공한다.

### 2.2 모바일 기준

- 기준 viewport: `390 × 844`
- safe area를 포함한다.
- 최소 터치 영역: `44 × 44px`
- 본문 기본 크기: `16px`
- bottom navigation: 아이콘과 한국어 라벨을 항상 함께 표시한다.
- motion 감소 설정에서는 공간 이동을 짧은 cross-fade와 명시적 단계 라벨로 바꾼다.

### 2.3 하단 내비게이션

선수 계정의 고정 순서는 다음과 같다.

`홈 / 훈련 / 커뮤니티 / 영상 / 더보기`

Career Passport는 별도 bottom tab이 아니다. `나의 선수` 또는 Spatial Home의 `커리어` anchor에서 진입한다.

## 3. 핵심 화면 01 — 가입 역할 선택

### 목적

가입 의도를 수집하되 권한을 부여하지 않는다. 공개 선택지는 선수와 매니저뿐이다.

### 정보 우선순위

1. “어떤 방식으로 SnapN Sports를 시작하시나요?”
2. `선수로 시작`과 `매니저로 시작`
3. 역할 선택은 권한 승인이 아니라는 설명
4. 보호자 초대 안내

### 레이아웃

```text
SnapN Sports

어떤 방식으로 시작하시나요?
가입 후 확인 절차에 따라 사용할 수 있는 기능이 달라집니다.

[선수로 시작]
나의 팀, 훈련, 경기와 커리어 기록을 확인합니다.

[매니저로 시작]
승인된 역할과 팀 범위 안에서 업무 공간을 사용합니다.

보호자이신가요?
선수가 보낸 초대 링크로 가입해 주세요.

[계속]
```

### 상호작용과 계약

- 단일 선택 후 `계속`을 활성화한다.
- 선택값은 `RolePreference`로 저장한다.
- 매니저를 선택해도 Coach, Team Manager, Club Director, Referee, Agent, Analyst 권한을 즉시 만들지 않는다.
- 보호자 공개 가입 route는 만들지 않는다.
- 보호자 초대가 없으면 일반 가입 화면으로 우회시키지 않는다.

### 금지

- “코치 권한이 활성화되었습니다” 같은 확정 문구
- 역할 선택만으로 Manager route 노출
- 보호자 공개 가입 버튼
- EPTS, Camera AI, Sports AI 선택지

## 4. 핵심 화면 02 — 나의 경기장

### 목적

SnapN Sports V2의 브랜드 입구이며, 사용자가 자신의 팀 공간에 도착했다는 감각을 만든다.

### 시각 우선순위

1. 특정 실존 구장을 닮지 않은 SnapN generic stadium
2. 다음 경기 또는 다음 훈련 한 건을 보여주는 전광판형 State Layer
3. 본인 identity indicator
4. 피치 진입 affordance

### 실제 문구

- 화면 제목: `나의 경기장`
- 일정: `다음 훈련 · 오늘 오후 6:30`
- 일정 없음: `오늘 예정된 일정이 없습니다`
- 진입 안내: `경기장을 눌러 입장하세요`
- 본인 표시: `나의 공간 · #8 중앙 미드필더`

### 상호작용

- 경기장 단일 탭 또는 위로 swipe: 피치 진입
- 제한적 orbit: 좌우 약 20도
- pinch: 허용 범위 안에서 확대
- 완전 자유 회전은 제공하지 않는다.

### 3D 등급

| 등급 | 표현 | 유지할 기능 |
|---|---|---|
| FULL | 전체 geometry, dynamic lighting, 공간 전환 | State Layer, 진입, 내비게이션 |
| FAST | 단순 geometry, baked lighting | 동일 |
| LIGHT | low-poly, texture atlas, 제한된 shadow | 동일 |
| STATIC | 사전 렌더 이미지 | 동일 |

### 금지

- 경기장 위에 다수의 dashboard card 배치
- 유명 경기장 silhouette, 클럽 색, 스폰서 보드 복제
- 3D 실패를 blocking modal로 처리

## 5. 핵심 화면 03 — 피치 진입

### 목적

나의 경기장에서 나의 포지션으로 이어지는 1.4~2.0초의 연속 전환이다. 별도 광고·온보딩 페이지가 아니다.

### 단계

1. 경기장 bowl 접근
2. roof 통과 또는 STATIC cross-fade
3. 피치 라인 reveal
4. 본인 marker 우선 표시
5. teammate marker 표시

### 실제 문구

- 1.2초 미만: 문구 없이 motion으로 가린다.
- 1.2초 이상: `나의 피치를 준비하고 있습니다`
- STATIC 전환: `2D 전술 화면으로 이어집니다`
- 복구 불가 데이터 오류: `팀 공간을 불러오지 못했습니다`

### 런타임 규칙

- renderer 오류 시 FULL에서 FAST, LIGHT, STATIC 순서로 자동 강등한다.
- 강등 중에도 route를 잃지 않는다.
- 연속 3회 강등 실패 후 STATIC 화면과 명시적 재시도 CTA를 제공한다.
- motion 감소 사용자는 200~300ms cross-fade와 `경기장 / 피치 / 팀 공간` 단계 라벨을 본다.

### 금지

- 전환 중 사용자 입력을 무기한 차단
- 단일 3D 재로드 팝업만 제공
- 3D 성공 여부를 인증·데이터 성공과 같은 것으로 취급

## 6. 핵심 화면 04 — 나의 포지션

### 목적

“우리 팀 formation”보다 “이 팀 안에서 나는 어디에 있는가”를 먼저 보여준다.

### 시각 우선순위

- 본인 marker는 teammate보다 1.35~1.5배 크다.
- 본인은 double ring, `나` 라벨, 포지션 라벨로 구분한다.
- teammate는 기본적으로 이름과 사진 대신 등번호·포지션만 표시한다.
- 색상만으로 본인을 구분하지 않는다.

### 실제 문구

- 제목: `나의 포지션`
- 본인: `나 · #8 · 중앙 미드필더`
- 보조 포지션: `선호 포지션 CM · 보조 포지션 DM`
- 다음 CTA: `나의 팀 공간으로`
- formation 미확정: `아직 확정된 포메이션이 없습니다`

### 상호작용

- 본인 marker 탭: 35~40% 높이 bottom sheet
- teammate 탭: `팀 동료 #7 · 오른쪽 윙` 수준의 최소 정보
- 시즌 selector는 실제 시즌 데이터가 있을 때만 표시
- 다른 선수 private profile로 직접 이동하지 않는다.

### Fallback

- FULL: 3D pitch와 player model
- FAST: 3D pitch와 2.5D marker
- LIGHT: flat pitch와 SVG marker
- STATIC: 2D tactical board

## 7. 핵심 화면 05 — 나의 팀 공간

### 목적

Stadium 안에서 사용자의 실제 축구 생활을 공간 anchor로 연결하는 Player Home이다.

### 공간 구조

```text
                 다음 경기

        팀                     영상

                    나

        훈련                 커리어
```

### Anchor

| Anchor | 표시 정보 | 이동 |
|---|---|---|
| 나 | 본인 선수와 현재 포지션 | 나의 선수 bottom sheet |
| 훈련 | 다음 훈련 한 건 | `/training` |
| 팀 | squad 또는 formation 진입 | `/home/team` |
| 커리어 | Career Passport | `/player/career` |
| 영상 | 사용자에게 공개된 영상 | `/video` |
| 다음 경기 | 다음 경기 한 건 | 해당 match route |

### 실제 문구

- 제목: `나의 팀 공간`
- 팀: `U17 A팀`
- 훈련 anchor: `다음 훈련 · 오늘 오후 6:30`
- 경기 anchor: `다음 경기 · 토요일 오후 2:00`
- 일정 없음: `예정된 팀 일정이 없습니다`

### 규칙

- anchor는 떠다니는 메뉴 아이콘이 아니라 공간에 배치된 상태 정보다.
- 최대 5개의 주 anchor만 한 화면에 표시한다.
- 일반 dashboard card grid로 대체하지 않는다.
- cached space가 있으면 offline에서도 연다.

## 8. 핵심 화면 06 — 커뮤니티

### 목적

V1에서 관찰된 사용자 게시·뉴스·영상·승부예측·개발요청 기능을 보존하면서 필수 안전 계층을 추가한다.

### 상단 구조

```text
커뮤니티                         검색
[전체] [게시글] [뉴스] [영상] [승부예측] [개발요청]
```

### 피드 카드

- 작성자 공개 이름 또는 안전한 별칭
- 작성 시각
- audience 라벨: `전체 공개`, `회원 공개`, `팀 공개`
- 본문 요약과 안전하게 처리된 media
- 좋아요, 댓글, 더보기
- 숨김·차단·신고 결과 상태

### 정본 규칙

- 서버 sanitization과 클라이언트 text rendering을 함께 적용한다.
- single-level comment만 제공한다.
- block은 차단한 사용자에게 상호 콘텐츠를 기본 숨김 처리한다.
- hidden post는 삭제처럼 위장하지 않고 `숨긴 게시글입니다`와 복원 CTA를 제공한다.
- prediction은 오락형이며 금전·배당·확정 보상을 제공하지 않는다.
- 뉴스와 YouTube는 출처와 원문 이동을 표시한다.
- 추천 피드 intelligence는 사용하지 않는다. 기본 정렬은 최신순 또는 명시적 탭 기준이다.

상세 화면군은 `COMMUNITY_SCREEN_SYSTEM_KO.md`를 정본으로 사용한다.

## 9. 공통 State Layer 우선순위

1. 진행 중인 경기 또는 Match Day
2. 다음 경기
3. 다음 훈련
4. 팀 공지
5. 일정 없음

서버가 우선순위와 유효 시간을 제공하거나 adapter가 검증 가능한 실제 데이터만으로 결정한다. 임의로 synthetic schedule을 만들지 않는다.

## 10. 공통 데이터 신뢰 규칙

- 모든 시간 기반 UI는 `updatedAt` 또는 `asOf`를 유지한다.
- cached 응답은 `staleAt`을 넘으면 Stale로 표시한다.
- offline cache가 없으면 Empty가 아니라 Offline 상태를 사용한다.
- HTTP 401은 미인증, 403은 권한 없음으로 분리한다.
- route 존재 여부는 permission 증거가 아니다.
- 선수·팀·클럽 객체 접근은 서버 object scope 검사를 통과해야 한다.

## 11. HARD DISABLED 검사어

사용자 노출 UI, fixture, translation, route, menu에서 다음 기능을 만들지 않는다.

- EPTS
- CAMERA_AI
- SPORTS_AI
- AI 점수
- 잠재력 점수
- 자동 피로도
- 검증되지 않은 속도·거리·퍼포먼스 백분율
- sample analysis
- coming soon 수치

Adapter interface 이름만 남길 수 있지만, 화면 또는 샘플 데이터로 노출하지 않는다.

## 12. production gate 밖의 범위

다음은 CORE UI 구현과 별도다.

- 운영 DB schema·migration·backup·restore
- 실운영 RoleGrant 발급과 회수
- Community moderation staffing·SLA·법적 정책
- YouTube·뉴스·경기 영상 권리와 ingestion pipeline
- App Store·Play Store native binary release
- web production deployment와 CDN cache 검증
- 인증된 실사용자 end-to-end 권한 검증

