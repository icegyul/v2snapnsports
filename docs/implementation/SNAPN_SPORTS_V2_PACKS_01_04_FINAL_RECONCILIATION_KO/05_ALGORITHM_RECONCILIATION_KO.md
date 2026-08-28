# 05. ALGORITHM RECONCILIATION — KO

## 1. Accounting

- ALGORITHMS ACCOUNTED: **45/45**
- `IMPLEMENTED`: **0**
- `PARTIAL`: **22**
- `READY_FOR_PACK`: **18**
- `NOT_REQUIRED_YET`: **3**
- `HARD_DISABLED_DEPENDENCY`: **2 (A25/A26)**

No algorithm is promoted to `IMPLEMENTED` merely because a fixture/helper exists. Example: current `mapFormationSlots` is a fixed 4-3-3 fixture slice, so A05 remains `PARTIAL`.

## 2. Single canonical code owner

| ID | Algorithm | Status | Canonical code owner | PACK owner | Code location | Purpose | Tests |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A01 | Public Signup Routing | PARTIAL | identity | SHARED/F0 | canonical owner: identity | 가입 화면을 PLAYER/MANAGER 두 경험으로 단순화 | owner pack tests + cross-pack safety where applicable |
| A02 | Manager Role Resolution | PARTIAL | role | SHARED / PACK03+04 | canonical owner: role | 선택한 역할을 UX mode로 적용하되 실제 권한과 분리 | owner pack tests + cross-pack safety where applicable |
| A03 | Authorization / Data Scope Decision | PARTIAL | authorization | SHARED/F0 | canonical owner: authorization | 모든 API의 resource/action 권한 결정 | owner pack tests + cross-pack safety where applicable |
| A04 | Guardian Invite & Consent Binding | PARTIAL | guardian | SHARED/F0 | canonical owner: guardian | 미성년 선수와 보호자 관계를 안전하게 생성 | owner pack tests + cross-pack safety where applicable |
| A05 | Formation Slot Mapping | PARTIAL | formation | SHARED/F0 | apps/web/src/features/formation/formation.ts (fixture-limited current slice); canonical owner formation module | FormationSnapshot을 피치 좌표로 변환 | owner pack tests + cross-pack safety where applicable |
| A06 | My Player Visual Priority | PARTIAL | formation | SHARED/F0 | canonical owner: formation | 본인 카드가 팀원보다 명확하게 보이도록 하되 권한 범위 보호 | owner pack tests + cross-pack safety where applicable |
| A07 | Stadium Entry Mode Selection | PARTIAL | stadium-runtime | SHARED/F0 | canonical owner: stadium-runtime | Full cinematic과 fast/light/static을 상황별 선택 | owner pack tests + cross-pack safety where applicable |
| A08 | Home State Priority | PARTIAL | home-state | SHARED/F0 | canonical owner: home-state | 홈 전광판과 Primary CTA를 1개로 선택 | owner pack tests + cross-pack safety where applicable |
| A09 | Spatial Object Routing | PARTIAL | spatial-navigation | SHARED/F0 | canonical owner: spatial-navigation | 경기장 오브젝트 클릭을 안전한 2D destination으로 매핑 | owner pack tests + cross-pack safety where applicable |
| A10 | Stadium Recipe TotalScore | PARTIAL | stadium-composition | SHARED/F0 | canonical owner: stadium-composition | 공식 Composition Engine 점수 계산 | owner pack tests + cross-pack safety where applicable |
| A11 | Stadium Structural Compatibility Gate | PARTIAL | stadium-composition | SHARED/F0 | canonical owner: stadium-composition | Bowl→Stand→Roof 구조적으로 불가능한 조합 차단 | owner pack tests + cross-pack safety where applicable |
| A12 | Stadium Auto Generate | PARTIAL | stadium-composition | SHARED/F0 | canonical owner: stadium-composition | 사용자의 Style Family 안에서 완성도 높은 Recipe 생성 | owner pack tests + cross-pack safety where applicable |
| A13 | Surprise Me Preference | PARTIAL | stadium-composition | SHARED/F0 | canonical owner: stadium-composition | 취향 반복과 탐색 균형 | owner pack tests + cross-pack safety where applicable |
| A14 | Adaptive 3D Performance Budget | PARTIAL | 3d-runtime | SHARED/F0 | canonical owner: 3d-runtime | 저사양/발열에서 스타일 정체성을 유지하며 렌더 비용 감소 | owner pack tests + cross-pack safety where applicable |
| A15 | Tactical 2D→3D Playback | READY_FOR_PACK | tactics / PACK01 | PACK 01 | canonical owner: tactics / PACK01 | 코치가 2D로 작성한 전술 단계를 3D 설명으로 변환 | owner pack tests + cross-pack safety where applicable |
| A16 | Training Session State Machine | READY_FOR_PACK | training / PACK01 | PACK 01 | canonical owner: training / PACK01 | 훈련 데이터의 일관된 상태전이 | owner pack tests + cross-pack safety where applicable |
| A17 | Community Legacy Parity Resolver | PARTIAL | community-compatibility | SHARED/F0 | canonical owner: community-compatibility | V2.0에서 커뮤니티 기존 동작을 그대로 유지 | owner pack tests + cross-pack safety where applicable |
| A18 | Community Visibility Decision | READY_FOR_PACK | community-safety / PACK04 | PACK 04 | canonical owner: community-safety / PACK04 | 게시물/댓글/미디어를 대상 사용자에게 보여줄지 결정 | owner pack tests + cross-pack safety where applicable |
| A19 | Growth / Career Timeline Aggregation | READY_FOR_PACK | career / PACK02 | PACK 02 | canonical owner: career / PACK02 | 센서 없이 선수의 장기 축구 여정 구성 | owner pack tests + cross-pack safety where applicable |
| A20 | Notification Thread / Dedupe | READY_FOR_PACK | notification | SHARED/F0 | canonical owner: notification | 같은 일정/경기/커뮤니티 사건 알림을 묶고 중복을 줄임 | owner pack tests + cross-pack safety where applicable |
| A21 | Media Access Decision | READY_FOR_PACK | media | SHARED/F0 | canonical owner: media | 원본/프록시/개인영상/커뮤니티 미디어 접근 통제 | owner pack tests + cross-pack safety where applicable |
| A22 | Feature Flag Resolution | PARTIAL | feature-flags | SHARED/F0 | canonical owner: feature-flags | 기능을 안전하게 범위별 활성화 | owner pack tests + cross-pack safety where applicable |
| A23 | Legacy Write Ownership / Idempotency | PARTIAL | legacy-migration | SHARED/F0 | canonical owner: legacy-migration | V2와 Legacy가 같은 데이터를 충돌해서 쓰지 않게 함 | owner pack tests + cross-pack safety where applicable |
| A24 | Stadium Audio Fit | NOT_REQUIRED_YET | stadium-audio | SHARED/F0 | canonical owner: stadium-audio | 시각 Recipe와 어울리는 권리 안전 음향 추천 | owner pack tests + cross-pack safety where applicable |
| A25 | EPTS Future Sync Pipeline | HARD_DISABLED_DEPENDENCY | EPTS HARD_DISABLED | SHARED/F0 | disabled adapter / no active runtime | 향후 밴드 파일 수집·부분/전체 동기화 계약 정의 | owner pack tests + cross-pack safety where applicable |
| A26 | Evidence AI Confidence / Abstain | HARD_DISABLED_DEPENDENCY | SPORTS_AI HARD_DISABLED | SHARED/F0 | disabled adapter / no active runtime | 실제 근거가 있을 때만 분석하고 낮은 신뢰도에서 판단 보류 | owner pack tests + cross-pack safety where applicable |
| A27 | Role Credential Verification | PARTIAL | role-verification | SHARED / PACK03+04 | canonical owner: role-verification | Manager role preference와 실제 검증된 역할 권한을 안전하게 분리 | owner pack tests + cross-pack safety where applicable |
| A28 | Match State Machine | READY_FOR_PACK | match / PACK01 | PACK 01 | canonical owner: match / PACK01 | 경기 생성부터 공식 종료/리포트까지 일관된 상태전이를 강제 | owner pack tests + cross-pack safety where applicable |
| A29 | Match Event Integrity & Ordering | READY_FOR_PACK | match / PACK01 | PACK 01 | canonical owner: match / PACK01 | 득점·교체·경고·사건 기록을 중복 없이 감사 가능한 timeline으로 유지 | owner pack tests + cross-pack safety where applicable |
| A30 | Offline Sync & Conflict Resolution | PARTIAL | offline-sync | SHARED/F0 | canonical owner: offline-sync | 훈련/출석/경기/메모 데이터를 오프라인에서도 보존하고 안전하게 서버와 합치기 | owner pack tests + cross-pack safety where applicable |
| A31 | Consent Revocation & Data Lifecycle Cascade | READY_FOR_PACK | privacy / PACK04 | PACK 04 | canonical owner: privacy / PACK04 | 동의 철회/삭제 요청을 즉시 접근 차단부터 파생데이터 정리까지 추적 | owner pack tests + cross-pack safety where applicable |
| A32 | Product Analytics Session & Retention Attribution | NOT_REQUIRED_YET | analytics | SHARED/F0 | canonical owner: analytics | 실제 foreground 사용·커뮤니티 체류·재방문을 일관된 제품 지표로 계산 | owner pack tests + cross-pack safety where applicable |
| A33 | Permission-aware Search Filtering | READY_FOR_PACK | permission-aware-search | SHARED/F0 | canonical owner: permission-aware-search | 검색 결과를 relevance보다 먼저 권한·공개범위로 제한 | owner pack tests + cross-pack safety where applicable |
| A34 | Community Feed Ranking | NOT_REQUIRED_YET | community-feed OFF | SHARED/F0 | community feed ranker target; OFF | Legacy parity 이후 안전한 후보 안에서 관계·최신성·반응·관련성·다양성을 조정 | owner pack tests + cross-pack safety where applicable |
| A35 | 3D Asset Bundle Selection & Cache Policy | PARTIAL | asset-delivery | SHARED/F0 | canonical owner: asset-delivery | 기기·네트워크·캐시 상태에 맞춰 Stadium core/optional 자산과 fallback을 선택 | owner pack tests + cross-pack safety where applicable |
| A36 | Earthus Context Fetch & Fallback | PARTIAL | earthus | SHARED/F0 | apps/web/src/adapters/EarthusContextAdapter.ts + earthus backend adapter target | Earthus Context를 일정/경기에 soft dependency로 부착하고 장애 시 안전하게 fallback | owner pack tests + cross-pack safety where applicable |
| A37 | Earthus Context Projection | PARTIAL | earthus | SHARED/F0 | apps/web/src/adapters/EarthusContextAdapter.ts + earthus backend adapter target | Earthus 환경정보를 역할/화면별 정보밀도에 맞게 투영 | owner pack tests + cross-pack safety where applicable |
| A38 | Career Passport Event Normalization | READY_FOR_PACK | career-passport / PACK02 | PACK 02 | canonical owner: career-passport / PACK02 | 다양한 원천 활동을 provenance가 있는 CareerEvent로 표준화 | owner pack tests + cross-pack safety where applicable |
| A39 | Career Passport Chapter & Milestone Assembly | READY_FOR_PACK | career-passport / PACK02 | PACK 02 | canonical owner: career-passport / PACK02 | CareerEvent를 시즌 Chapter/마일스톤으로 조립 | owner pack tests + cross-pack safety where applicable |
| A40 | Scouting Visibility & Consent Eligibility | READY_FOR_PACK | scouting / PACK02 | PACK 02 | canonical owner: scouting / PACK02 | 선수의 스카우팅 공개 가능 여부와 공개 필드를 동의 기반으로 결정 | owner pack tests + cross-pack safety where applicable |
| A41 | Opportunity Eligibility Matching | READY_FOR_PACK | opportunity / PACK02 | PACK 02 | canonical owner: opportunity / PACK02 | 명시된 기회 조건에 대한 투명한 hard eligibility 매칭 | owner pack tests + cross-pack safety where applicable |
| A42 | Communication Recipient & Channel Resolution | READY_FOR_PACK | communication / PACK02 | PACK 02 | canonical owner: communication / PACK02 | 팀/보호자/역할 관계에 맞는 실제 수신자와 채널을 계산 | owner pack tests + cross-pack safety where applicable |
| A43 | Communication Delivery & Thread Dedupe | READY_FOR_PACK | communication / PACK02 | PACK 02 | canonical owner: communication / PACK02 | canonical message 저장과 delivery를 분리하고 중복 thread/message 방지 | owner pack tests + cross-pack safety where applicable |
| A44 | Safeguarding Interaction Gate | READY_FOR_PACK | safeguarding / PACK04 | PACK 04 | canonical owner: safeguarding / PACK04 | 미성년 대상 검색·연락·공유 전에 공통 hard safety policy 적용 | owner pack tests + cross-pack safety where applicable |
| A45 | Safety Incident Triage & Escalation | READY_FOR_PACK | safeguarding / PACK04 | PACK 04 | canonical owner: safeguarding / PACK04 | 신고를 단계별 incident/restriction/review workflow로 처리 | owner pack tests + cross-pack safety where applicable |

## 3. Duplicate implementation rule

PACKs consume the owner implementation through a shared interface. They may add role-specific projection/adapters/tests, but may not fork the algorithm.

- A03 authorization: shared security owner
- A22 feature flag resolution: shared release owner
- A27 role credential verification: shared role owner
- A31 consent lifecycle: privacy owner
- A44/A45 safeguarding: shared safety owner
- A42/A43 communication: PACK02 owner, PACK03 consumes
- A38/A39 career: PACK02 owner, PACK01/03 consume
