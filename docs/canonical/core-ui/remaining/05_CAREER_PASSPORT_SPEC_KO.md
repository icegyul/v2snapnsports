# CAREER PASSPORT UI SPEC

## 1. Canonical role

Career Passport는 **선수 중심 장기 football journey의 canonical projection**이다. Legacy Wall/Growth는 presentation layer이며 source of truth가 아니다.

금지:
- 자동 pro-potential score
- AI 평가
- source 없는 award/career
- synthetic fixture를 production truth로 표시
- 이전 구단 private coach note/전술 자산 복제

## 2. navigation

`My Player Card → /player/me/career`

Growth bottom tab은 만들지 않는다.

세부 season route:
`/player/me/career/season/:season_id`

## 3. 화면

- Career Overview
- Timeline
- Season History
- Team History
- Position History
- Training/Match Milestones
- Videos
- Achievements
- Share / Portfolio seam

## 4. Component tree

```text
CareerPassportRoute
└─ CareerOverview
   ├─ PlayerIdentity
   ├─ CurrentSeasonChapter
   ├─ CareerTimeline
   ├─ CareerSeasonHistory
   ├─ CareerTeamHistory
   ├─ CareerPositionHistory
   ├─ CareerMilestones
   ├─ CareerVideos
   ├─ CareerAchievements
   └─ CareerSharePortfolioSeam
```

## 5. DTO/provenance

`CareerEvent.source`는 반드시:

- type
- id
- version
- verifiedState

를 가진다.

이 필드가 없으면 UI에 event를 렌더하지 않고 adapter/fixture validation 실패로 기록한다.

초기 event types:
TEAM/CLUB join/left, season start/end, position change, training milestone, match participation, coach-approved milestone, representative video, user selected highlight, verified achievement.

## 6. API

API/Data Contract v1.3:
- `GET /v2/athletes/{id}/passport`
- `GET /v2/athletes/{id}/passport/events`
- `GET /v2/athletes/{id}/passport/highlights`
- `POST /v2/athletes/{id}/passport/highlights`
- `PATCH /v2/athletes/{id}/passport/visibility`

OpenAPI v1.4에는 physical path `/v2/athletes/{athlete_id}/career`의 `getCareerPassport`가 존재한다. Codex는 route/API inventory 결과에 따라 **둘 중 정본 하나를 adapter 내부에 매핑**하고 UI에 path 차이를 노출하지 않는다. 이 pack이 새 competing endpoint를 추가하지 않는다.

## 7. Engine / Algorithm

- E03/A03 permission
- E04/A04 guardian/consent
- E05 team/season source
- E17/A21 representative media
- E18/A19 legacy Growth compatibility
- E27 Match source read-only seam
- E30/A31 revoke cascade
- E36 + A38/A39 canonical Career
- E37/A40 share/scouting consent 결과만 소비
- E40/A44 safeguarding

## 8. Share/Portfolio seam

`PRIVATE / PLAYER_GUARDIAN / CLUB / SCOUTING_ALLOWED` 범위 중 서버가 허용한 값만 제공한다. 미성년자 `SCOUTING_ALLOWED`는 Guardian/Club policy 결과가 없으면 선택 불가. 직접 연락처를 share projection에 넣지 않는다.

## 9. Negative cases

- unrelated guardian passport → deny
- revoked guardian → cached share projection invalidation
- cross-tenant manager → private past club data deny
- unverified agent → scouting share deny
- source deleted → event state update, 대체 기록 fabrication 금지
- representative video access revoked → career video 제거
- legacy synthetic fixture → local/dev layer 외 표시 금지

## 10. Responsive / Accessibility

Timeline은 mobile single column, tablet/desktop에서도 날짜축이 의미를 잃지 않게 maximum content width 760px 권장. 사건 유형을 색만으로 구분하지 않고 icon + text. season heading은 semantic `<h2>`, event title은 `<h3>`. source/verification 상세는 screen reader에 필요 이상 행정 noise를 주지 않되 "검증된 기록" 이름을 제공한다.
