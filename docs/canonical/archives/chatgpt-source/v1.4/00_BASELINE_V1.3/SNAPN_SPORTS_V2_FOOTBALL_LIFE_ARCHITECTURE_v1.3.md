# SNAPN SPORTS V2 — FOOTBALL LIFE ARCHITECTURE

**v1.3 | Career Passport · Scouting Opportunity · Team Communication · Safeguarding**

## 1. Why this layer exists

My Football World가 “내가 어디에서 뛰는가”를 보여주고 Training/Match가 “오늘 무엇을 하는가”를 담당한다면, Football Life는 **선수가 왜 SnapN을 여러 시즌 동안 계속 사용하는가**를 담당한다.

핵심은 SNS를 하나 더 만드는 것이 아니라, Community·경기·훈련·영상에서 생긴 실제 축구 활동이 선수의 장기 Career Passport와 다음 기회로 이어지게 만드는 것이다.

## 2. Four domains

### Career Passport
- 사실 기반 장기 이력.
- 팀/구단이 바뀌어도 선수 중심으로 이어짐.
- source provenance mandatory.

### Scouting & Opportunity
- opt-in 공개.
- 명시 조건 eligibility.
- 자동 능력 랭킹/프로 성공 확률 없음.

### Team Communication
- Community와 분리된 운영 대화.
- Schedule/Match/Training context와 연결.

### Safeguarding & Trust
- 위 3개 도메인을 포함해 사람 간 interaction을 제한하는 공통 hard gate.

## 3. Career Passport canonical model

```text
Athlete
  └─ CareerPassport
      ├─ SeasonChapter[]
      │   ├─ Membership
      │   ├─ PositionHistory
      │   ├─ TrainingMilestone
      │   ├─ MatchParticipation
      │   ├─ ApprovedFeedback
      │   └─ HighlightMedia
      └─ CareerEvent[] -> Source Provenance
```

### Allowed initial event types

- TEAM_JOINED / TEAM_LEFT
- SEASON_STARTED / SEASON_COMPLETED
- POSITION_CHANGED
- TRAINING_MILESTONE
- MATCH_PARTICIPATION
- COACH_APPROVED_MILESTONE
- REPRESENTATIVE_VIDEO_ADDED
- USER_SELECTED_HIGHLIGHT

Source가 없는 AWARD/ABILITY_SCORE 같은 항목은 생성하지 않는다.

## 4. Scouting data flow

```text
Career Passport
      ↓ shareable projection only
Scouting Visibility + Guardian/Club Policy
      ↓
Safeguarding Gate
      ↓
Opportunity Eligibility
      ↓
Interest / Invitation
      ↓
Guardian or Club mediated communication when required
```

## 5. Opportunity model

```text
Opportunity
- type: TRYOUT / CAMP / ACADEMY_TEST / CONSULTATION
- organizer_org_id
- verified_role_required
- age_range
- positions
- region
- start/end
- required_share_fields
- state: DRAFT / OPEN / CLOSED / CANCELLED
```

Opportunity matching은 “능력”을 추론하지 않는다. 초기에는 연령/포지션/지역/일정/공개정보 충족 여부만 판단한다.

## 6. Communication model

Community는 공개/반공개 콘텐츠 체류 공간이다.
Communication은 팀 운영을 위한 targeted thread다.

```text
Thread Context
- TEAM
- TRAINING_SESSION
- MATCH
- SCHEDULE_CHANGE
- GUARDIAN_COMMUNICATION
- OPPORTUNITY_MEDIATED
```

Canonical Message 저장과 Push Notification delivery를 분리한다.

## 7. Safeguarding matrix examples

| Actor | Subject | Action | Default |
| --- | --- | --- | --- |
| Verified Coach | own team minor | operational team message | allow by policy |
| Verified Coach | unrelated minor | direct private DM | deny/mediated |
| Agent | minor | direct DM | deny; guardian/club route |
| Referee | minor | private post-match contact | deny by default |
| Guardian | linked athlete | view official data | allow within link scope |
| Club Director | own tenant athlete | operational admin contact | allow with minimum scope |

## 8. Community connection

Community Post/Video가 곧바로 공식 Career Event가 되는 것은 아니다.

```text
Community Media
      ↓ user selects / coach approves / official source links
Career Highlight candidate
      ↓ visibility + provenance check
Career Passport Highlight
```

반응 수/좋아요 수가 선수 능력이나 scouting score가 되지 않는다.

## 9. My Stadium connection

Legacy Wall은 Career Passport의 시각화다.

- 입단/승급/시즌 완료/대표 영상 -> Stadium Legacy Wall item.
- Stadium cosmetic unlock은 참여/여정 표현용이며 선수 능력평가와 무관.
- Passport source가 삭제/비공개되면 Legacy Wall projection도 동기화한다.

## 10. Release Gates

- source 없는 Career fact 0건.
- minor scouting default-open 0건.
- external role -> minor unrestricted DM 0건.
- Community reaction -> scouting/ability score 경로 0건.
- consent revoke 후 search/share cache에서 데이터가 남는 재현 이슈 0건.
