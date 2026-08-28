# ENGINE / ALGORITHM BINDING

## 1. Coverage 의미

이 문서의 `coverage`는 "이번 pack이 정본 ID를 빠뜨리지 않고 DIRECT 또는 명시적 EXCLUDED/OFF/RESERVED로 추적했는가"를 의미한다.

- Engine catalog: **40/40 ID accounted**
- Active engine: 39 + E38 reserved
- Direct UI binding: **24/40**
- Algorithm catalog: **45/45 accounted**
- Direct UI binding: **26/45**
- New engine gap: **0**
- New algorithm gap: **0**

## 2. Engine matrix

| ID | Engine | Pack status | Binding / reason |
|---|---|---|---|
| E01 | Identity & Primary Experience Engine | DIRECT | 로그인/선수 identity |
| E02 | Manager Role Experience Engine | ACCOUNTED / EXCLUDED | Player CORE UI 직접 사용 아님; Manager shell 보존 |
| E03 | Authorization & Data Scope Engine | DIRECT | 모든 화면 permission·tenant/team/subject scope |
| E04 | Guardian & Consent Engine | DIRECT | 미성년자 guardian/consent |
| E05 | Organization / Team / Season Engine | DIRECT | team/season context |
| E06 | Legacy Adapter & Migration Engine | DIRECT | FixtureLegacyAdapter 및 Legacy parity 경계 |
| E07 | Feature Flag & Release Control Engine | DIRECT | hard-disabled/soft dependency flag |
| E08 | My Football World / Stadium Experience Engine | DIRECT | Player E2E stadium/spatial home |
| E09 | Formation & Position Engine | DIRECT | formation/position |
| E10 | Home State & Primary Action Engine | DIRECT | home primary action/next event |
| E11 | Stadium Style Composition Engine | ACCOUNTED / EXCLUDED | Stadium builder 영역; 본 pack에서 변경 금지 |
| E12 | Spatial Navigation Engine | DIRECT | spatial object→2D route |
| E13 | Training / Schedule / Attendance Engine | DIRECT | training/schedule/attendance |
| E14 | Tactical Board Engine | ACCOUNTED / EXCLUDED | Coach Tactical; Player Training에서는 coach-approved summary만 소비 |
| E15 | Community Compatibility Engine | DIRECT | Community V1 parity |
| E16 | Community Safety & Moderation Engine | DIRECT | Community report/block/moderation/visibility |
| E17 | Media & Video Engine | DIRECT | Video/media ownership·access |
| E18 | Growth / Football Career Engine | DIRECT | 기존 Growth projection 호환 |
| E19 | Notification Engine | DIRECT | 일정/커뮤니티 알림 연결 seam |
| E20 | Subscription / Entitlement Engine | ACCOUNTED / EXCLUDED | 구독 UI 비범위; entitlement 결과만 소비 가능 |
| E21 | Stadium Audio Recipe Engine | ACCOUNTED / EXCLUDED | 오디오 비범위 |
| E22 | EPTS Integration Engine | ACCOUNTED / EXCLUDED | HARD DISABLED |
| E23 | Camera / Vision Integration Engine | ACCOUNTED / EXCLUDED | HARD DISABLED |
| E24 | Evidence Sports AI Engine | ACCOUNTED / EXCLUDED | HARD DISABLED |
| E25 | Audit / Observability Engine | DIRECT | request_id/error/audit evidence |
| E26 | Role Verification & Credential Engine | ACCOUNTED / EXCLUDED | Manager verification 비범위; permission 결과만 소비 |
| E27 | Match & Competition Engine | ACCOUNTED / EXCLUDED | Next match/경력 source 소비만; 경기 도메인 변경 금지 |
| E28 | Agent Portfolio & Opportunity Engine | ACCOUNTED / EXCLUDED | Portfolio/Opportunity 비범위; Career share seam만 |
| E29 | Offline Sync & Conflict Resolution Engine | DIRECT | offline/local draft/sync |
| E30 | Data Lifecycle & Privacy Operations Engine | ACCOUNTED / EXCLUDED | privacy lifecycle 비범위; visibility revoke 결과 반영 |
| E31 | Product Analytics & Retention Measurement Engine | DIRECT | 제품 UX 계측 seam(선수 평가와 분리) |
| E32 | Permission-aware Search & Discovery Engine | DIRECT | permission-aware search seam |
| E33 | Community Feed Intelligence Engine | ACCOUNTED / EXCLUDED | OFF — Legacy ordering 강제 |
| E34 | 3D Asset Delivery & Cache Engine | DIRECT | FULL/FAST/LIGHT/STATIC asset fallback |
| E35 | Earthus Context Adapter Engine | DIRECT | Training 환경 Context soft dependency |
| E36 | Football Career Passport Engine | DIRECT | Career Passport canonical projection |
| E37 | Scouting Consent & Opportunity Engine | ACCOUNTED / EXCLUDED | Scouting 직접 구현 아님; Career share seam에서 consent 결과만 |
| E38 | RESERVED — Tournament & League Extension Engine | ACCOUNTED / EXCLUDED | RESERVED / NOT ACTIVE |
| E39 | Team Communication Engine | ACCOUNTED / EXCLUDED | Community와 분리; 본 pack에서 합치지 않음 |
| E40 | Safeguarding & Trust Engine | DIRECT | 미성년자 공유·연락·영상·신고 hard gate |

## 3. Algorithm matrix

| ID | Algorithm | Pack status | Binding / reason |
|---|---|---|---|
| A01 | Public Signup Routing | ACCOUNTED / EXCLUDED | 본 CORE UI remaining 영역 직접 binding 아님; 기존 canonical 유지 |
| A02 | Manager Role Resolution | ACCOUNTED / EXCLUDED | 본 CORE UI remaining 영역 직접 binding 아님; 기존 canonical 유지 |
| A03 | Authorization / Data Scope Decision | DIRECT | permission negative cases |
| A04 | Guardian Invite & Consent Binding | DIRECT | guardian/consent 상태 |
| A05 | Formation Slot Mapping | DIRECT | formation slot→좌표 |
| A06 | My Player Visual Priority | DIRECT | My Player emphasis |
| A07 | Stadium Entry Mode Selection | DIRECT | entry mode FULL/FAST/LIGHT/STATIC |
| A08 | Home State Priority | DIRECT | home state/next event |
| A09 | Spatial Object Routing | DIRECT | spatial route |
| A10 | Stadium Recipe TotalScore | ACCOUNTED / EXCLUDED | Stadium builder score 비범위 |
| A11 | Stadium Structural Compatibility Gate | ACCOUNTED / EXCLUDED | Stadium builder compatibility 비범위 |
| A12 | Stadium Auto Generate | ACCOUNTED / EXCLUDED | Stadium builder auto-generate 비범위 |
| A13 | Surprise Me Preference | ACCOUNTED / EXCLUDED | Stadium builder preference 비범위 |
| A14 | Adaptive 3D Performance Budget | DIRECT | 저사양/thermal 3D downgrade |
| A15 | Tactical 2D→3D Playback | ACCOUNTED / EXCLUDED | Coach tactical playback 비범위 |
| A16 | Training Session State Machine | DIRECT | Training session state projection |
| A17 | Community Legacy Parity Resolver | DIRECT | Community legacy parity |
| A18 | Community Visibility Decision | DIRECT | Community visibility |
| A19 | Growth / Career Timeline Aggregation | DIRECT | legacy Growth→Career projection 호환 |
| A20 | Notification Thread / Dedupe | DIRECT | 알림/일정 seam |
| A21 | Media Access Decision | DIRECT | Video/media access |
| A22 | Feature Flag Resolution | DIRECT | feature visibility |
| A23 | Legacy Write Ownership / Idempotency | DIRECT | legacy write ownership |
| A24 | Stadium Audio Fit | ACCOUNTED / EXCLUDED | Audio 비범위 |
| A25 | EPTS Future Sync Pipeline | ACCOUNTED / EXCLUDED | HARD OFF 경로 검증 |
| A26 | Evidence AI Confidence / Abstain | ACCOUNTED / EXCLUDED | HARD OFF/EVIDENCE GATE; UI 노출 금지 |
| A27 | Role Credential Verification | ACCOUNTED / EXCLUDED | Manager role verification 비범위 |
| A28 | Match State Machine | ACCOUNTED / EXCLUDED | Match domain 비범위 |
| A29 | Match Event Integrity & Ordering | ACCOUNTED / EXCLUDED | Match domain 비범위 |
| A30 | Offline Sync & Conflict Resolution | DIRECT | offline sync/conflict |
| A31 | Consent Revocation & Data Lifecycle Cascade | ACCOUNTED / EXCLUDED | privacy lifecycle 결과만 소비 |
| A32 | Product Analytics Session & Retention Attribution | ACCOUNTED / EXCLUDED | analytics 비범위; 평가 지표로 사용 금지 |
| A33 | Permission-aware Search Filtering | DIRECT | permission-aware search seam |
| A34 | Community Feed Ranking | DIRECT | OFF 검증: legacy order |
| A35 | 3D Asset Bundle Selection & Cache Policy | DIRECT | 3D asset/cache fallback |
| A36 | Earthus Context Fetch & Fallback | DIRECT | Earthus fetch fallback |
| A37 | Earthus Context Projection | DIRECT | Earthus screen projection |
| A38 | Career Passport Event Normalization | DIRECT | Career event normalization |
| A39 | Career Passport Chapter & Milestone Assembly | DIRECT | Career chapter/milestone assembly |
| A40 | Scouting Visibility & Consent Eligibility | ACCOUNTED / EXCLUDED | Career share seam에서 서버 결과만 소비; scouting UI 비범위 |
| A41 | Opportunity Eligibility Matching | ACCOUNTED / EXCLUDED | Opportunity UI 비범위 |
| A42 | Communication Recipient & Channel Resolution | ACCOUNTED / EXCLUDED | Team Communication 비범위; Community와 합치지 않음 |
| A43 | Communication Delivery & Thread Dedupe | ACCOUNTED / EXCLUDED | Team Communication 비범위 |
| A44 | Safeguarding Interaction Gate | DIRECT | Safeguarding interaction gate |
| A45 | Safety Incident Triage & Escalation | DIRECT | report triage/escalation |

## 4. 핵심 화면 binding

| 화면 | Engines | Algorithms |
|---|---|---|
| Community Home/Detail/Composer | E03,E06,E07,E15,E16,E17,E25,E29,E40 | A03,A17,A18,A21,A22,A23,A30,A34(OFF),A44,A45 |
| Training Home/Detail | E03,E05,E07,E13,E19,E29,E35,E36,E40 | A03,A16,A20,A22,A30,A36,A37,A38,A39,A44 |
| Video Home/Detail | E03,E04,E07,E17,E30,E36,E40 | A03,A04,A21,A22,A31,A38,A39,A44 |
| Career Passport | E03,E04,E05,E17,E18,E27,E30,E36,E37,E40 | A03,A04,A19,A21,A31,A38,A39,A40,A44 |
| Player E2E | E01,E03,E05,E07,E08,E09,E10,E12,E13,E17,E25,E34,E36 | A03,A05,A06,A07,A08,A09,A14,A22,A35,A38,A39 |

## 5. 금지 binding

- E22/A25, E23, E24/A26는 일반 UI와 연결하지 않는다.
- E33/A34는 OFF이며 ranking 결과를 새로 생성하지 않는다.
- E39/A42/A43 Team Communication을 Community component/store에 합치지 않는다.
- E35/A36/A37 Earthus 결과를 선수 평가/부상예측/훈련강도 자동 결정에 사용하지 않는다.
