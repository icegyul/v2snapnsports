# TRAINING UI SPEC — PLAYER

## 1. Hard scope

Player Training에는 아래를 **렌더하지 않는다**.

- wearable metric
- AI score
- fatigue score
- speed metric
- heart-rate/PPG
- sample analysis
- Camera tracking overlay
- "coming soon" 형태의 EPTS/CAMERA_AI/SPORTS_AI placeholder

허용 정보는 schedule/objective/participation/coach-approved manual info/venue/time/team/history projection seam뿐이다.

## 2. 화면

| 화면 | route | 정보 |
|---|---|---|
| Training Home | `/training` | upcoming 첫 카드, recent/history seam |
| Upcoming Session | Home 내부 카드 | 다음 훈련 |
| Session Detail | `/training/:event_id` | 시간/장소/목표/plan summary/participation |
| Schedule | `/training` 내부 날짜 뷰 | upcoming/past 구분 |
| Attendance/Participation | detail control | GOING/NOT_GOING/LATE 등 서버 허용 값 |
| History projection seam | detail/home | Career Passport로 이어질 사실 기반 이력 |

## 3. Component tree

```text
TrainingRoute
└─ TrainingHome
   ├─ UpcomingTrainingCard
   ├─ TrainingSchedule
   ├─ RecentTrainingList
   ├─ TrainingHistoryProjectionSeam
   └─ PlayerBottomNavigation

TrainingDetailRoute
└─ TrainingSessionDetail
   ├─ SessionIdentity
   ├─ TimeVenue
   ├─ Objective
   ├─ TrainingPlanSummary
   ├─ ParticipationControl
   ├─ OptionalEarthusContext
   └─ HistoryProjectionSeam
```

## 4. DTO

- `TrainingSummary`
- `TrainingSessionView`
- `TrainingPlanSummary`
- `ParticipationState`

위 DTO에 금지 metric field가 존재하지 않는 것이 계약이다.

## 5. API / Adapter

- list: OpenAPI v1.4 `GET /v2/events`
- detail: API/Data Contract v1.3 `GET /v2/training-sessions/{id}`를 OpenAPI에 승격
- participation: v1.3 `POST /v2/training-sessions/{id}/attendance`를 OpenAPI에 승격
- optional offline write: 기존 E29/A30 `/v2/sync/batch` 사용
- Earthus: E35/A36/A37, 실패 시 badge hide/stale 처리

새 product endpoint를 만들지 않는다.

## 6. Engine / Algorithm

- E03 + A03: permission
- E05: team/season context
- E13 + A16: schedule/training/attendance
- E19 + A20: schedule change notification seam
- E29 + A30: offline participation/local journal
- E35 + A36/A37: environment context soft dependency
- E36 + A38/A39: completed training이 Career event가 되는 projection
- E40 + A44: minor safeguarding
- E07 + A22: disabled features 숨김

## 7. State

LOADING / EMPTY / ERROR / OFFLINE / FORBIDDEN / STALE.

Participation mutation은 SAVING, offline journal은 SYNCING. 권한 변경 후에는 READ_ONLY가 가능하다.

Earthus timeout은 Training ERROR가 아니다.

## 8. Negative cases

- cross-team session direct URL → FORBIDDEN
- revoked membership → cached session 숨김 또는 generic forbidden
- unverified manager route에서 Player Training mutate 시도 → deny
- offline에서 consent/role이 만료됐을 수 있는 mutation → server revalidation
- foreign athlete attendance → deny
- EPTS flag false인데 metric component가 나타남 → test fail

## 9. Responsive / Accessibility

시간·장소·참가상태는 truncation보다 wrap 우선. 참가 버튼 44px 이상, 현장용 주요 action은 52px 권장. 날짜 picker는 키보드 접근 가능하고 현재 선택을 `aria-current` 또는 적절한 selected state로 표현한다. 상태는 아이콘+텍스트 병행.
