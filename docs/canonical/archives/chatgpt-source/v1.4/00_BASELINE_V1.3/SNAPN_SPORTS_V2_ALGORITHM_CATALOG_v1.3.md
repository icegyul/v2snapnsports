# SNAPN SPORTS V2 ALGORITHM CATALOG

**v1.3 | 2026-08-27 | 45 Algorithms**

| ID | Algorithm | Release | Purpose |
| --- | --- | --- | --- |
| A01 | Public Signup Routing | P0 | 가입 화면을 PLAYER/MANAGER 두 경험으로 단순화 |
| A02 | Manager Role Resolution | P0 | 선택한 역할을 UX mode로 적용하되 실제 권한과 분리 |
| A03 | Authorization / Data Scope Decision | P0 | 모든 API의 resource/action 권한 결정 |
| A04 | Guardian Invite & Consent Binding | P0 | 미성년 선수와 보호자 관계를 안전하게 생성 |
| A05 | Formation Slot Mapping | P0 | FormationSnapshot을 피치 좌표로 변환 |
| A06 | My Player Visual Priority | P0 | 본인 카드가 팀원보다 명확하게 보이도록 하되 권한 범위 보호 |
| A07 | Stadium Entry Mode Selection | P0 | Full cinematic과 fast/light/static을 상황별 선택 |
| A08 | Home State Priority | P0 | 홈 전광판과 Primary CTA를 1개로 선택 |
| A09 | Spatial Object Routing | P0 | 경기장 오브젝트 클릭을 안전한 2D destination으로 매핑 |
| A10 | Stadium Recipe TotalScore | P0/P1 | 공식 Composition Engine 점수 계산 |
| A11 | Stadium Structural Compatibility Gate | P0/P1 | Bowl→Stand→Roof 구조적으로 불가능한 조합 차단 |
| A12 | Stadium Auto Generate | P1 | 사용자의 Style Family 안에서 완성도 높은 Recipe 생성 |
| A13 | Surprise Me Preference | P2 | 취향 반복과 탐색 균형 |
| A14 | Adaptive 3D Performance Budget | P0/P1 | 저사양/발열에서 스타일 정체성을 유지하며 렌더 비용 감소 |
| A15 | Tactical 2D→3D Playback | P1 | 코치가 2D로 작성한 전술 단계를 3D 설명으로 변환 |
| A16 | Training Session State Machine | P0/P1 | 훈련 데이터의 일관된 상태전이 |
| A17 | Community Legacy Parity Resolver | P0 | V2.0에서 커뮤니티 기존 동작을 그대로 유지 |
| A18 | Community Visibility Decision | P0 | 게시물/댓글/미디어를 대상 사용자에게 보여줄지 결정 |
| A19 | Growth / Career Timeline Aggregation | P0/P1 | 센서 없이 선수의 장기 축구 여정 구성 |
| A20 | Notification Thread / Dedupe | P0 | 같은 일정/경기/커뮤니티 사건 알림을 묶고 중복을 줄임 |
| A21 | Media Access Decision | P0 | 원본/프록시/개인영상/커뮤니티 미디어 접근 통제 |
| A22 | Feature Flag Resolution | P0 | 기능을 안전하게 범위별 활성화 |
| A23 | Legacy Write Ownership / Idempotency | P0 | V2와 Legacy가 같은 데이터를 충돌해서 쓰지 않게 함 |
| A24 | Stadium Audio Fit | P1/P2 | 시각 Recipe와 어울리는 권리 안전 음향 추천 |
| A25 | EPTS Future Sync Pipeline | FUTURE OFF | 향후 밴드 파일 수집·부분/전체 동기화 계약 정의 |
| A26 | Evidence AI Confidence / Abstain | FUTURE EVIDENCE GATE | 실제 근거가 있을 때만 분석하고 낮은 신뢰도에서 판단 보류 |
| A27 | Role Credential Verification | P0 | Manager role preference와 실제 검증된 역할 권한을 안전하게 분리 |
| A28 | Match State Machine | P0/P1 | 경기 생성부터 공식 종료/리포트까지 일관된 상태전이를 강제 |
| A29 | Match Event Integrity & Ordering | P0/P1 | 득점·교체·경고·사건 기록을 중복 없이 감사 가능한 timeline으로 유지 |
| A30 | Offline Sync & Conflict Resolution | P0 | 훈련/출석/경기/메모 데이터를 오프라인에서도 보존하고 안전하게 서버와 합치기 |
| A31 | Consent Revocation & Data Lifecycle Cascade | P0 | 동의 철회/삭제 요청을 즉시 접근 차단부터 파생데이터 정리까지 추적 |
| A32 | Product Analytics Session & Retention Attribution | P0 | 실제 foreground 사용·커뮤니티 체류·재방문을 일관된 제품 지표로 계산 |
| A33 | Permission-aware Search Filtering | P1 | 검색 결과를 relevance보다 먼저 권한·공개범위로 제한 |
| A34 | Community Feed Ranking | P1/P2 | Legacy parity 이후 안전한 후보 안에서 관계·최신성·반응·관련성·다양성을 조정 |
| A35 | 3D Asset Bundle Selection & Cache Policy | P0/P1 | 기기·네트워크·캐시 상태에 맞춰 Stadium core/optional 자산과 fallback을 선택 |

## A01. Public Signup Routing

**Release:** P0

**Purpose:** 가입 화면을 PLAYER/MANAGER 두 경험으로 단순화

**Inputs:** selected_type, age/birth info if collected, invite token optional

**Outputs:** primary_experience, next_route

```text
if invite_token is GUARDIAN_INVITE:
    attach_or_create_guardian_flow()
elif selected_type == PLAYER:
    create primary_experience=PLAYER
    next = PLAYER_PROFILE
elif selected_type == MANAGER:
    create primary_experience=MANAGER
    next = MANAGER_HOME
else:
    reject PUBLIC_SIGNUP_TYPE
```

**Parameters:** Public selector allowlist={PLAYER,MANAGER}

**Edge/Failure:** Guardian은 초대 흐름에서만; 잘못된 type은 400

**Tests:** PLAYER, MANAGER, Guardian invite, forged ADMIN type

## A02. Manager Role Resolution

**Release:** P0

**Purpose:** 선택한 역할을 UX mode로 적용하되 실제 권한과 분리

**Inputs:** requested_role, verified memberships, role grants, consents

**Outputs:** active_role, capabilities, scope

```text
assert account.primary_experience == MANAGER
role_profile = save_user_preference(requested_role)
grants = load_server_verified_grants(user)
capabilities = intersect(role_capability_template(requested_role), grants)
if capabilities is empty:
    return role_selected_but_unverified_state
return active_role + capabilities + data_scope
```

**Parameters:** deny-by-default

**Edge/Failure:** role preference 저장은 허용해도 protected API는 grant 없으면 403

**Tests:** self-select CLUB_DIRECTOR without grant; multi-role coach+manager; revoked grant

## A03. Authorization / Data Scope Decision

**Release:** P0

**Purpose:** 모든 API의 resource/action 권한 결정

**Inputs:** user, action, resource, org/team/athlete context, consent

**Outputs:** allow, reason, scope, allowed_fields

```text
if not authenticated: DENY
if hard_block(user, resource): DENY
if resource.org_id not in verified_org_scope(user): DENY
policy = policy_for(active_role, action, resource.type)
if not policy: DENY
if resource is minor_sensitive:
    require consent/membership rules
return ALLOW with minimal field scope
```

**Parameters:** No score; hard policy engine

**Edge/Failure:** 존재하지 않는 membership/expired consent/other tenant는 항상 deny

**Tests:** cross-tenant matrix; referee growth access deny; agent unapproved minor deny

## A04. Guardian Invite & Consent Binding

**Release:** P0

**Purpose:** 미성년 선수와 보호자 관계를 안전하게 생성

**Inputs:** athlete_id, invite token, guardian account, consent version

**Outputs:** guardian_link, consent records

```text
validate signed one-time invite
verify athlete scope and expiration
if guardian account exists: attach pending link
else: create guardian onboarding context
collect required consent versions
activate link only after required consent succeeds
invalidate invite token
```

**Parameters:** one-time token + expiry configurable

**Edge/Failure:** 재사용/만료/다른 athlete token 거부

**Tests:** reuse token, expired, wrong athlete, co-guardian

## A05. Formation Slot Mapping

**Release:** P0

**Purpose:** FormationSnapshot을 피치 좌표로 변환

**Inputs:** formation_code, role slots, roster assignments, orientation

**Outputs:** normalized coordinates, world coordinates, unassigned list

```text
template = formation_template(formation_code)
for assignment in roster:
    slot = template.slot(assignment.role_slot)
    nx, ny = slot.normalized_xy
    if orientation == FLIPPED: ny = 1 - ny
    world_x = (nx - 0.5) * pitch_width_m
    world_z = (ny - 0.5) * pitch_length_m
    emit player coordinate
players without valid slot -> bench/unassigned region
```

**Parameters:** normalized x,y in [0,1]; pitch dimensions renderer config

**Edge/Failure:** 중복 slot은 deterministic offset; 미등록 선수 placeholder

**Tests:** 4-3-3, 3-5-2, duplicate slot, missing position, flip orientation

## A06. My Player Visual Priority

**Release:** P0

**Purpose:** 본인 카드가 팀원보다 명확하게 보이도록 하되 권한 범위 보호

**Inputs:** current_user athlete_id, formation cards, viewport/device

**Outputs:** card scales, labels, occlusion priority

```text
for card in formation_cards:
    if card.athlete_id == me: scale=1.0; priority=100
    else: scale=0.52; priority=50
apply permission filter before labels
resolve overlap by priority then nearest free screen offset
```

**Parameters:** teammate scale default 0.52 (allowed 0.45~0.60)

**Edge/Failure:** 타 선수 필드 최소화; overlap 시 본인 우선

**Tests:** goalkeeper/center overlap, small screen, hidden teammate data

## A07. Stadium Entry Mode Selection

**Release:** P0

**Purpose:** Full cinematic과 fast/light/static을 상황별 선택

**Inputs:** first_run, user preference, asset cache, device tier, thermal/battery, 3D failure history

**Outputs:** entry_mode

```text
if accessibility_static or repeated_3d_failure: STATIC
elif low_power_or_thermal or device_tier==LOW: LIGHT_3D
elif first_successful_entry and assets_ready: FULL
elif user_requested_full and assets_ready: FULL
else: FAST
```

**Parameters:** FAST target 0.8~1.5s; key info <=3s

**Edge/Failure:** asset 미준비면 FULL 기다리지 않고 FAST/LIGHT

**Tests:** first run offline, low battery, full preference, previous crash

## A08. Home State Priority

**Release:** P0

**Purpose:** 홈 전광판과 Primary CTA를 1개로 선택

**Inputs:** schedule events, match/training state, changes, reports/videos, community signals, role, seen state

**Outputs:** primary_state, primary_cta, secondary badges

```text
candidates = build_candidates()
for c in candidates:
    if not permitted(c): remove
    score = base_priority[c.type]
          + time_urgency(c)
          + action_required(c)
          + role_relevance(c)
          + freshness(c)
          - seen_penalty(c)
select max(score); tie -> earliest event_time -> stable id
return one primary + up to 2 secondary badges
```

**Parameters:** Initial bases: schedule_changed=98, match_live=96, training_live=94, match_today=90, training_soon=85, next_event=72, new_report=60, new_video=55, community_mention=45

**Edge/Failure:** candidate 0개면 NORMAL; permission 없는 event 제거

**Tests:** schedule change vs community, live training vs new report, no events

## A09. Spatial Object Routing

**Release:** P0

**Purpose:** 경기장 오브젝트 클릭을 안전한 2D destination으로 매핑

**Inputs:** object_id, role, capabilities, flags

**Outputs:** route, enabled, reason

```text
route = registry[object_id]
if not feature_enabled(route.feature): disabled
if not capability_allowed(route.capability): disabled
return route with deep_link params
```

**Parameters:** registry versioned

**Edge/Failure:** unknown object는 no-op + log; disabled reason UI

**Tests:** player clicks coach-only tactics; feature off; stale object

## A10. Stadium Recipe TotalScore

**Release:** P0/P1

**Purpose:** 공식 Composition Engine 점수 계산

**Inputs:** StyleFit, StructuralFit, MaterialHarmony, SilhouetteQuality, PerformanceFit, IPDistance

**Outputs:** TotalScore, grade

```text
TotalScore = 0.28*StyleFit + 0.22*StructuralFit + 0.14*MaterialHarmony + 0.12*SilhouetteQuality + 0.14*PerformanceFit + 0.10*IPDistance
if >=0.85: Excellent
elif >=0.75: Recommended
elif >=0.65: Allowed
else: DoNotAutoGenerate
```

**Parameters:** weights fixed from existing engine v2.0 unless versioned change

**Edge/Failure:** hard forbidden combination overrides score

**Tests:** boundary 0.85/0.75/0.65; high score but forbidden

## A11. Stadium Structural Compatibility Gate

**Release:** P0/P1

**Purpose:** Bowl→Stand→Roof 구조적으로 불가능한 조합 차단

**Inputs:** family, bowl, stand, roof, device tier

**Outputs:** pass/fail, alternatives

```text
select Bowl
stand_candidates = candidates with structural_fit >= 0.70
roof_candidates = candidates compatible with Bowl+Stand and roof_fit >= 0.72
apply forbidden-combination rules
apply device performance gate
if none: return alternatives from same family
```

**Parameters:** Stand >=0.70; Roof >=0.72 from existing spec

**Edge/Failure:** 1-tier small + massive full ring 등 hard block

**Tests:** forbidden rules; LOW device without LOD; no candidate

## A12. Stadium Auto Generate

**Release:** P1

**Purpose:** 사용자의 Style Family 안에서 완성도 높은 Recipe 생성

**Inputs:** family or surprise, allowed modules, preference vector, device tier, seed

**Outputs:** recipe, score breakdown, seed

```text
load family target tags + allowed pool
choose Bowl
sample compatible Stand
filter compatible Roof
choose Facade/Seat/Lighting/Environment by style+harmony
replace modules if performance budget exceeded
run silhouette/IP gate
score candidates
choose 1 from top 5 using seeded softmax weighted random
persist recipe + score + seed
```

**Parameters:** same recipe+seed must reproduce

**Edge/Failure:** IP/right fail -> exclude; no valid candidate -> safe preset

**Tests:** same seed reproducibility; all modules invalid; low tier downgrade

## A13. Surprise Me Preference

**Release:** P2

**Purpose:** 취향 반복과 탐색 균형

**Inputs:** preference vector, recent 5 recipes, feedback, seed

**Outputs:** family/module priors

```text
mode = seeded_random()
if mode < 0.70: sample from familiar preference
else: sample exploration pool
apply repetition penalty to modules used in recent 5
apply youth-theme safety constraints
pass to Auto Generate
```

**Parameters:** 70% familiar / 30% exploration

**Edge/Failure:** Preference data는 Sports AI evaluation과 분리

**Tests:** recent repetition, no preferences, youth safety

## A14. Adaptive 3D Performance Budget

**Release:** P0/P1

**Purpose:** 저사양/발열에서 스타일 정체성을 유지하며 렌더 비용 감소

**Inputs:** device tier, fps, thermal state, scene position, recipe modules

**Outputs:** LOD policy, effects, fps cap

```text
profile = device_budget(LOW/MID/HIGH)
if thermal_hot or fps_below_floor:
    lower environment/facade LOD first
    reduce crowd loops/effects
    lower render fps cap
if camera moves to pitch:
    aggressively lower exterior LOD
never remove functional overlays/formation data
```

**Parameters:** existing rough budgets: LOW <350k, MID <700k, HIGH <1.2M visible tris

**Edge/Failure:** style identity preserved; functional data never degraded

**Tests:** thermal spike, background, bottom sheet open, pitch zoom

## A15. Tactical 2D→3D Playback

**Release:** P1

**Purpose:** 코치가 2D로 작성한 전술 단계를 3D 설명으로 변환

**Inputs:** formation snapshot, tactic steps, paths/zones, timing

**Outputs:** animation timeline

```text
validate tactic version and roster snapshot
map each 2D normalized point to pitch world coordinates
for each step:
    interpolate player/ball/path visuals over step duration
mark plan data as PLANNED
never label as measured/replay unless real tracking source exists
```

**Parameters:** tactic step timing configurable

**Edge/Failure:** 선수 미등록 placeholder; actual/replay와 시각적 구분

**Tests:** multi-step, roster change, missing player, planned vs actual

## A16. Training Session State Machine

**Release:** P0/P1

**Purpose:** 훈련 데이터의 일관된 상태전이

**Inputs:** current state, command, actor capability

**Outputs:** new state, event

```text
DRAFT -> READY -> CHECK_IN -> LIVE -> ENDED -> PROCESSING -> REVIEW -> PUBLISHED -> ARCHIVED
DRAFT/READY -> CANCELLED
any processing stage -> FAILED_PARTIAL when partial failure but session preserved
reject illegal transition
append state_change event
```

**Parameters:** existing state model reused; V2.0 can omit sensor-specific substeps

**Edge/Failure:** 카메라/센서 실패가 세션 자체를 삭제하지 않음

**Tests:** illegal transitions, retry, cancel, partial failure

## A17. Community Legacy Parity Resolver

**Release:** P0

**Purpose:** V2.0에서 커뮤니티 기존 동작을 그대로 유지

**Inputs:** V2 request, legacy mapping, permissions

**Outputs:** legacy-equivalent response

```text
authorize request using V2 user context
translate to legacy API/query without changing ordering semantics
execute legacy read/write owner path
map legacy result to V2 DTO
compare parity telemetry during rollout
```

**Parameters:** V2.0 mode=LEGACY_PARITY

**Edge/Failure:** legacy contract 불명확하면 추측하지 않고 Audit blocker

**Tests:** ordering, pagination, delete/edit, media, block/report parity

## A18. Community Visibility Decision

**Release:** P0

**Purpose:** 게시물/댓글/미디어를 대상 사용자에게 보여줄지 결정

**Inputs:** actor, viewer, post visibility, team/org membership, block/report state, minor rules

**Outputs:** visible, allowed actions

```text
if blocked(actor, viewer): deny
if removed/moderation_hold: deny unless moderator
switch visibility:
  PUBLIC -> apply minor/public policy
  CLUB -> require same org
  TEAM -> require same team
  FOLLOWERS -> require approved follow relation
  PRIVATE -> actor only
filter media fields by consent/ACL
```

**Parameters:** 실제 legacy visibility enum은 Phase 0에서 매핑

**Edge/Failure:** 미성년자/영상 규칙은 더 엄격한 policy가 우선

**Tests:** blocked user, cross-team, private, moderator

## A19. Growth / Career Timeline Aggregation

**Release:** P0/P1

**Purpose:** 센서 없이 선수의 장기 축구 여정 구성

**Inputs:** team membership, season, attendance, position changes, coach feedback, video milestones, goals/milestones

**Outputs:** ordered career events, summary sections

```text
collect approved source events
normalize to CareerEvent(type, occurred_at, source_type, source_id, visibility)
permission filter
sort by occurred_at then stable id
group by season/team
return timeline + latest milestones
no synthetic performance score
```

**Parameters:** no aggregate ability rating in V2.0

**Edge/Failure:** source 삭제/권한 변경 시 파생 이벤트 visibility 갱신

**Tests:** season transfer, missing video, private coach note, same timestamp

## A20. Notification Thread / Dedupe

**Release:** P0

**Purpose:** 같은 일정/경기/커뮤니티 사건 알림을 묶고 중복을 줄임

**Inputs:** domain event, recipient, thread key, existing notifications, quiet hours

**Outputs:** notification or update, thread state

```text
thread_key = domain_type + source_id
if event corrects/cancels previous event:
    supersede previous notification in same thread
elif duplicate idempotency key exists:
    no-op
else create notification
push if policy allows; inbox always persists where required
```

**Parameters:** quiet hours configurable; action-required can override by policy

**Edge/Failure:** push failure != inbox loss

**Tests:** schedule change, duplicate event, quiet hours, correction

## A21. Media Access Decision

**Release:** P0

**Purpose:** 원본/프록시/개인영상/커뮤니티 미디어 접근 통제

**Inputs:** viewer, asset ACL, source context, consent, role

**Outputs:** allow, delivery variant, signed URL TTL

```text
authorize source object first
resolve asset ACL
if minor video and viewer lacks required relationship/scope: deny
choose lowest necessary delivery variant (thumb/proxy/original)
issue short-lived signed URL
```

**Parameters:** TTL config; original stricter than proxy

**Edge/Failure:** 다른 미성년자 노출 큰 원본은 제한

**Tests:** guardian own child, coach team, agent approved clip, public post media

## A22. Feature Flag Resolution

**Release:** P0

**Purpose:** 기능을 안전하게 범위별 활성화

**Inputs:** feature, user/org/team/cohort/app, global config

**Outputs:** enabled, reason, rule id

```text
if HARD_DISABLED(feature): return false
if compliance_or_rights_fail: return false
if user_opt_out: return false
if incompatible_app_or_platform: return false
apply org/team pilot deny/allow
apply cohort rule
apply user override
return global_default
```

**Parameters:** deny-safe precedence

**Edge/Failure:** unknown rule/parse error -> disabled for risky features

**Tests:** EPTS user override attempt, org pilot, old app version, kill switch

## A23. Legacy Write Ownership / Idempotency

**Release:** P0

**Purpose:** V2와 Legacy가 같은 데이터를 충돌해서 쓰지 않게 함

**Inputs:** entity type, migration phase, write request, idempotency key

**Outputs:** write owner, result

```text
owner = migration_registry[entity_type].write_owner
if duplicate idempotency key: return stored result
route write to owner only
emit outbox event for read model/sync
record source_version and mapping id
```

**Parameters:** one authoritative writer per entity during each phase

**Edge/Failure:** owner unknown -> reject write, do not dual-write blindly

**Tests:** retry, network timeout, partial migration, rollback

## A24. Stadium Audio Fit

**Release:** P1/P2

**Purpose:** 시각 Recipe와 어울리는 권리 안전 음향 추천

**Inputs:** StyleMatch, AcousticMatch, UserMoodFit, EntranceModeFit, PerformanceFit, RightsSafety

**Outputs:** AudioFit, audio recipe

```text
if RightsSafety == 0: BLOCK
AudioFit = 0.30*StyleMatch + 0.20*AcousticMatch + 0.15*UserMoodFit + 0.15*EntranceModeFit + 0.10*PerformanceFit + 0.10*RightsSafety
if AudioFit >=0.75: recommendation candidate
else manual/none
```

**Parameters:** existing formula; 0.75 auto recommendation threshold

**Edge/Failure:** Silent mode -> no TTS network; rights expiry block

**Tests:** rights zero, silent, roof change reverb

## A25. EPTS Future Sync Pipeline

**Release:** FUTURE OFF

**Purpose:** 향후 밴드 파일 수집·부분/전체 동기화 계약 정의

**Inputs:** future device file: GNSS/IMU/PPG, athlete mapping, session id

**Outputs:** validated raw upload, summary job

```text
HARD REQUIRE release_approved == true
future flow:
  device records locally during play
  optional halftime partial sync
  full post-session BLE sync
  upload on suitable network
  validate timestamps/device-athlete binding
  derive measured summaries
  retain raw per policy
V2.0: return FEATURE_DISABLED before any user flow
```

**Parameters:** source target: GNSS 10Hz, IMU 100Hz+, PPG; post-session full sync

**Edge/Failure:** no fake sensor values; no medical probability

**Tests:** release false, partial sync resume, wrong athlete mapping, corrupted file

## A26. Evidence AI Confidence / Abstain

**Release:** FUTURE EVIDENCE GATE

**Purpose:** 실제 근거가 있을 때만 분석하고 낮은 신뢰도에서 판단 보류

**Inputs:** SensorQuality, VisionQuality, BaselineSufficiency, Repeatability, CrossModalAgreement

**Outputs:** confidence, analysis policy

```text
confidence = 0.20*SensorQuality + 0.20*VisionQuality + 0.20*BaselineSufficiency + 0.20*Repeatability + 0.20*CrossModalAgreement
if confidence >=0.80: show cause candidates + adjustment to coach
elif >=0.60: possibility wording + coach confirmation
elif >=0.40: facts primarily; cause reference only
else: abstain; no cause/adjustment generation
```

**Parameters:** existing v1.0 weights/thresholds

**Edge/Failure:** V2 launch off; Evidence ID required; LLM cannot invent outside bundle

**Tests:** 0.39/0.40/0.60/0.80 boundaries, missing modalities, low baseline


## v1.1 Extension Algorithms

### A27. Role Credential Verification

**Release:** P0

**Purpose:** Manager role preference와 실제 검증된 역할 권한을 안전하게 분리

**Inputs:** primary_experience, requested_role, org membership/invite, credential evidence, verifier decision, expiry/revocation

**Outputs:** credential_state, verification_case, grant eligibility, scope

**Parameters/Rules:** states={PENDING,VERIFIED,REJECTED,EXPIRED,REVOKED}; deny-by-default

**Edge/Failure:** 외부 자격 DB 미연동은 정상. tenant/manual verification으로 처리. 만료/취소는 다음 권한 평가 전에 반영.

**Tests:** self-select CLUB_DIRECTOR; revoked Coach grant; expired Referee credential; Agent without consent

```text
assert account.primary_experience == MANAGER
save role preference(requested_role)
requirements = verification_requirements(requested_role, org_context)
evidence = collect_server_verified_membership_and_approvals()
if required evidence missing:
    return PENDING with no protected capabilities
if verifier rejects or credential revoked/expired:
    revoke related RoleGrant; return REJECTED/EXPIRED/REVOKED
issue scoped RoleGrant only when state == VERIFIED
return verified scope + expiry + audit_ref
```

### A28. Match State Machine

**Release:** P0/P1

**Purpose:** 경기 생성부터 공식 종료/리포트까지 일관된 상태전이를 강제

**Inputs:** match state, actor capability, scheduled time, roster/lineup readiness, match command

**Outputs:** new state, side effects, allowed actions

**Parameters/Rules:** DRAFT→SCHEDULED→READY→LIVE→ENDED→REPORT_REVIEW→FINALIZED→ARCHIVED; side states POSTPONED/CANCELLED/ABANDONED

**Edge/Failure:** FINALIZED 이후 원본 이벤트 직접 수정 금지; correction/report revision만. LIVE 전 득점/카드 event 금지.

**Tests:** double start; cancel after live; finalize without report permission; postpone/resume; unauthorized referee action

```text
allowed = transition_table[current_state]
if command not in allowed: reject INVALID_MATCH_TRANSITION
authorize(match, command, actor)
validate prerequisites(command)
append MATCH_STATE_CHANGED event
apply deterministic side effects
return new_state + permitted_actions
```

### A29. Match Event Integrity & Ordering

**Release:** P0/P1

**Purpose:** 득점·교체·경고·사건 기록을 중복 없이 감사 가능한 timeline으로 유지

**Inputs:** match_id, event_id, occurred_at, period, clock, client_seq, actor, event_type, payload, supersedes_id

**Outputs:** accepted event, canonical ordering, derived score/card state, correction link

**Parameters/Rules:** event_id idempotent; corrections append-only; order=(period_order, event_clock/occurred_at, client_seq, event_id)

**Edge/Failure:** 동일 event 재전송은 기존 결과 반환. 오프라인 시각 충돌은 conflict flag. FINALIZED 이후 correction 권한 별도.

**Tests:** duplicate goal; correction of wrong scorer; two offline cards same clock; unauthorized delete; score rebuild

```text
authorize event write for current match state
if event_id already exists: return stored result
validate event schema + roster/actor references
if correction: require supersedes_id and correction capability
append immutable event
canonical_order = stable_sort(valid_events)
rebuild derived match projection from valid events
return event + projection_version
```

### A30. Offline Sync & Conflict Resolution

**Release:** P0

**Purpose:** 훈련/출석/경기/메모 데이터를 오프라인에서도 보존하고 안전하게 서버와 합치기

**Inputs:** client_id, local_seq, event/entity payload, base_version, idempotency_key, server_cursor

**Outputs:** ack, server_cursor, accepted/rejected/conflict set, retry policy

**Parameters/Rules:** append-only events preferred; server-authoritative for auth/consent; optimistic version for editable records

**Edge/Failure:** 네트워크 재단절, 중복 batch, 권한 만료, 오래된 base_version, clock skew. Local journal은 server ack 전 삭제 금지.

**Tests:** same batch 3회; app kill during upload; consent revoked offline; conflicting attendance edit; 2h offline session

```text
read unacked local journal ordered by local_seq
for item in batch:
    authenticate + current authorization check
    if idempotency seen: ack stored result
    elif item.type is append_event: append if schema valid
    elif item.field is security_sensitive: server wins or reject
    else: compare base_version and apply field-specific merge policy
record conflicts with reason
advance sync cursor only for durably committed items
client deletes journal entries only after ack
```

### A31. Consent Revocation & Data Lifecycle Cascade

**Release:** P0

**Purpose:** 동의 철회/삭제 요청을 즉시 접근 차단부터 파생데이터 정리까지 추적

**Inputs:** data subject, requester authority, consent type/scope, delete/export request, retention/legal-hold policy

**Outputs:** revocation state, lifecycle jobs, export/deletion manifest, final status

**Parameters/Rules:** access revoke first; async purge tracked by manifest; LEGAL_HOLD distinct from PURGED

**Edge/Failure:** 공동 보호자 충돌, 법적 보관 의무, 실패한 object deletion, search/cache 지연, 이미 발급된 signed URL.

**Tests:** revoke VIDEO consent; delete athlete with media; legal hold; retry failed purge; cross-tenant request deny

```text
authorize requester relationship and scope
write consent revocation / request record first
immediately deny new access + invalidate active grants/URLs where possible
dependencies = enumerate DB + object + cache + search + derived records
for item in dependencies:
    if legal_hold(item): restrict and record HOLD
    else enqueue delete/anonymize job
reindex/invalidate caches
complete only when manifest has terminal state for every dependency
emit immutable audit evidence
```

### A32. Product Analytics Session & Retention Attribution

**Release:** P0

**Purpose:** 실제 foreground 사용·커뮤니티 체류·재방문을 일관된 제품 지표로 계산

**Inputs:** pseudonymous analytics events, foreground/background state, interaction heartbeat, experiment/flag versions

**Outputs:** product session, meaningful dwell, funnel steps, D1/D7/D30 retention cohorts

**Parameters/Rules:** session split after configurable inactivity (initial 30m); background time excluded; KPI targets are not hard-coded

**Edge/Failure:** app crash, clock skew, duplicate telemetry, offline analytics upload, multi-device sessions.

**Tests:** background 2h; 31m inactivity; duplicate events; community open without interaction; cross-device return

```text
dedupe events by analytics_event_id
order by server_received_at with client_time metadata
build sessions using foreground/activity rules
exclude background intervals from dwell
mark meaningful interactions separately from passive impressions
compute cohort return on calendar-day windows
segment by feature/experiment version without storing sensitive athlete performance data
```

### A33. Permission-aware Search Filtering

**Release:** P1

**Purpose:** 검색 결과를 relevance보다 먼저 권한·공개범위로 제한

**Inputs:** query, requester, active role, tenant/team scope, public visibility, index candidates

**Outputs:** authorized ranked results, safe facets/counts

**Parameters/Rules:** visibility prefilter + per-result post authorization; no hidden existence leak

**Edge/Failure:** 미성년 프로필 opt-out, revoked consent before reindex, stale index ACL, Agent/Referee narrow scope.

**Tests:** search hidden minor; revoked agent link; cross-tenant team; stale deleted post; zero-result facet leak

```text
scope = authorization_engine.search_scope(requester, entity_types)
candidates = index.query(query, scope_visibility_tags)
results = []
for c in candidates:
    resource = minimal_resource_ref(c)
    if authorize(requester, VIEW_SEARCH_RESULT, resource):
        results.append(rank(c))
return top_k(results) + facets computed only from visible results
```

### A34. Community Feed Ranking

**Release:** P1/P2

**Purpose:** Legacy parity 이후 안전한 후보 안에서 관계·최신성·반응·관련성·다양성을 조정

**Inputs:** visible/moderated posts, relation signals, recency, engagement, topic relevance, seen/impression state, ranker config

**Outputs:** ranked feed, score breakdown for debugging, impression log

**Parameters/Rules:** V2.0 disabled. weights are experiment config, not permanent constants. diversity/seen caps required.

**Edge/Failure:** visibility change after candidate generation, blocked author, deleted post, viral single-author domination, cold start.

**Tests:** legacy order when flag off; blocked post never ranks; new user; repeated author cap; seen penalty; experiment reproducibility

```text
if not feature_enabled(COMMUNITY_FEED_INTELLIGENCE):
    return legacy_order_feed()
eligible = apply_visibility_and_moderation_hard_gates(posts)
for p in eligible:
    score = w_rel*relation(p) + w_time*recency(p) + w_eng*engagement(p) + w_topic*relevance(p) + w_div*diversity_bonus(p) - w_seen*seen_penalty(p)
apply author/team diversity caps
stable_sort by score then recency then post_id
log impression with ranker_version
return feed
```

### A35. 3D Asset Bundle Selection & Cache Policy

**Release:** P0/P1

**Purpose:** 기기·네트워크·캐시 상태에 맞춰 Stadium core/optional 자산과 fallback을 선택

**Inputs:** stadium recipe, module versions, device tier, network class, cache inventory/budget, app version, integrity metadata

**Outputs:** asset manifest, required/optional bundles, prefetch plan, entry mode constraint, eviction plan

**Parameters/Rules:** current core bundle pinned; checksum/version required; FULL only when core ready; cache budget device-configurable

**Edge/Failure:** corrupt bundle, CDN failure, metered network, insufficient storage, old app incompatible asset, thermal downgrade.

**Tests:** offline cached home; corrupt KTX2; low storage; LOW tier Future recipe; CDN timeout; same recipe version cache hit

```text
profile = device_asset_profile(device_tier, app_version)
manifest = resolve_recipe_manifest(recipe, profile)
verify cached bundle versions + checksums
required_missing = manifest.core - valid_cache
if required_missing and network unavailable:
    constrain entry_mode to LIGHT_3D or STATIC
elif required_missing:
    fetch core first; optional decoration deferred
pin current recipe core bundles
evict least-recent optional bundles within cache budget
return manifest + cache_actions + allowed_entry_modes
```

### A36. Earthus Context Fetch & Fallback

**Release:** P1 OPTIONAL

**Purpose:** SnapN이 직접 공공 API를 중복 호출하지 않고 Earthus Context를 일정/경기에 안전하게 부착

**Inputs:** event_id, venue coordinates, event time, Earthus provider response/cache, freshness policy

**Outputs:** EventContext, FRESH/STALE/PARTIAL/UNAVAILABLE state, source metadata

**Parameters/Rules:** Earthus는 soft dependency. last-known snapshot은 `stale=true`로만 표시. Provider 실패가 core event flow를 block하지 않음.

**Edge/Failure:** timeout, Earthus unavailable, event moved, cache spatial mismatch, response schema version mismatch.

**Tests:** fresh response; 1h stale cache; provider timeout; moved venue; no coordinates; incompatible schema.

```text
key = normalize(event_id, venue_coordinate, event_time)
if valid_cache(key):
    return cached context with freshness state
try:
    response = earthus.get_context(venue_coordinate, event_time)
    validate schema + source/freshness
    cache response
    return normalized EventContext
except provider_error:
    if stale_cache_exists(key): return stale context + stale=true
    return UNAVAILABLE without blocking event
```

### A37. Earthus Context Projection

**Release:** P1 OPTIONAL

**Purpose:** Earthus의 상세 환경 데이터를 SnapN 역할별 화면에 과도하지 않게 투영

**Inputs:** normalized EventContext, user role, screen type, event state

**Outputs:** weather badge, heat/cold badge, air-quality badge, detail link; max display density

**Parameters/Rules:** Player card는 최대 2~3개 짧은 badge, Manager detail은 source/freshness 포함. 자동 취소/훈련강도 결정 금지.

**Edge/Failure:** partial context, stale data, multiple warnings, user locale, no exact venue.

**Tests:** player schedule; coach detail; stale; only air quality; all unavailable.

```text
if context.unavailable: render nothing or '환경정보 없음'
visible = select role/screen permitted fields
prioritize official warning > precipitation > temperature > air quality
cap badges by screen density
always expose freshness/source in detail view
never output automatic cancel/intensity decision
```

### A38. Career Passport Event Normalization

**Release:** P0/P1

**Purpose:** 여러 도메인의 활동을 중복·왜곡 없이 하나의 Career Event 모델로 변환

**Inputs:** source domain event, athlete_id, source_id/version, occurred_at, visibility, verification state

**Outputs:** normalized CareerEvent or ignored/private-only event

**Parameters/Rules:** source provenance mandatory; same source event idempotent; internal-only fields excluded.

**Edge/Failure:** duplicate source, edited match result, team migration, deleted video, revoked visibility.

**Tests:** season membership; training milestone; representative video; corrected match; deleted source; legacy import duplicate.

```text
assert source_id and source_version and athlete_id
map source.type -> career_event_type
strip fields not allowed in Career Passport
fingerprint = source_type + source_id + source_version + athlete_id
upsert by fingerprint
if source revoked/deleted: update visibility/state, do not fabricate replacement
return CareerEvent with provenance
```

### A39. Career Passport Chapter & Milestone Assembly

**Release:** P0/P1

**Purpose:** Career Events를 시즌/팀 단위 Chapter와 의미 있는 milestone으로 조립하되 능력 서열화를 만들지 않음

**Inputs:** normalized CareerEvents, season/team membership, user-selected highlights, coach-approved milestones

**Outputs:** SeasonChapter[], milestones, representative highlights

**Parameters/Rules:** chronology primary; milestone requires explicit source rule or user/coach selection; no hidden performance score.

**Edge/Failure:** overlapping seasons, mid-season transfer, missing season, duplicate milestone, future-dated source.

**Tests:** one club season; transfer; multi-team same season; user highlight; removed source.

```text
events = visible_verified_events(athlete)
group by season + membership interval
order chapters by start date
within chapter order by occurred_at
milestones = rule_based_verified_events + approved/user-selected highlights
dedupe by semantic source fingerprint
return chapters + provenance links
```

### A40. Scouting Visibility & Consent Eligibility

**Release:** P1/P2

**Purpose:** 선수가 스카우팅 검색/기회 노출 대상이 될 수 있는지 먼저 결정

**Inputs:** athlete age class, player preference, guardian consent, club policy, safety blocks, verified requester type

**Outputs:** ELIGIBLE/INELIGIBLE/REQUIRE_ACTION, allowed portfolio fields, contact_route

**Parameters/Rules:** minor default deny unless opt-in policy satisfied; health/sensor/internal notes never eligible fields.

**Edge/Failure:** guardian consent expired, club opt-out, blocked agent, adult athlete, multi-org conflict.

**Tests:** minor no guardian; minor opt-in; adult opt-in; club deny; blocked requester; revoked consent.

```text
if safety_block(actor, athlete): DENY
if athlete.is_minor:
    require athlete/guardian policy + club policy as configured
if not scouting_preference.enabled: DENY
fields = intersection(passport.shareable_fields, consent.allowed_fields, requester_scope)
contact_route = safeguarding.allowed_contact_route(actor, athlete)
return eligible only if fields nonempty and contact_route valid
```

### A41. Opportunity Eligibility Matching

**Release:** P1/P2

**Purpose:** 공개된 조건만으로 트라이아웃/기회 후보를 필터링하며 선수 성공확률/능력점수를 만들지 않음

**Inputs:** opportunity requirements, eligible athlete profile, age/position/region/schedule, consent/visibility, role verification

**Outputs:** candidate/eligible reason codes, invitation eligibility

**Parameters/Rules:** hard filters + transparent reason codes; no opaque ML performance ranking in initial release.

**Edge/Failure:** incomplete profile, timezone/date conflict, position multiple, age boundary, opportunity closed.

**Tests:** exact eligibility; position mismatch; age mismatch; closed; consent revoked after candidate creation.

```text
if opportunity.state != OPEN: reject
if not scouting_visibility_eligible(athlete, requester): reject
checks = [age_range, position_set, region_if_required, schedule_window, required_public_fields]
if any hard check fails: return INELIGIBLE with reasons
return ELIGIBLE with matched requirement reasons
```

### A42. Communication Recipient & Channel Resolution

**Release:** P0/P1

**Purpose:** 메시지/공지의 실제 수신자와 허용 채널을 Role/Team/Guardian 관계에 맞게 계산

**Inputs:** sender, thread context, requested recipients, org/team membership, guardian links, safety policy, blocks

**Outputs:** authorized recipient set, allowed channel, mediated route, denied reasons

**Parameters/Rules:** direct recipient expansion은 서버에서 수행. minor DM은 Safeguarding result 우선.

**Edge/Failure:** removed player, expired coach grant, co-guardian, blocked sender, large announcement.

**Tests:** coach team announcement; manager guardian group; external agent to minor; blocked user; membership changed.

```text
base = expand requested audience from authoritative membership
for recipient in base:
    if not authorize(sender, COMMUNICATE, recipient/context): skip
    safety = safeguarding.check_contact(sender, recipient, context)
    if safety.ALLOW: add direct
    elif safety.REQUIRE_GUARDIAN or REQUIRE_ORG_ROUTE: add mediated route
return recipients + channel policy
```

### A43. Communication Delivery & Thread Dedupe

**Release:** P0/P1

**Purpose:** 같은 일정/경기 사건의 중복 메시지를 줄이고 저장·푸시·읽음 상태를 분리

**Inputs:** canonical message, context_id, recipients, idempotency_key, notification preferences

**Outputs:** message_id, thread_id, receipts, notification jobs

**Parameters/Rules:** message store commit before push. Push failure does not rollback message. Idempotency required for announcement fanout.

**Edge/Failure:** retry, partial push failure, offline recipient, edited announcement, duplicate schedule change.

**Tests:** same idempotency 3x; push outage; 100-player team; edit/correction; unread count.

```text
thread = resolve_or_create_thread(context_id, participant_scope)
if idempotency_seen: return stored result
commit message once
create recipient receipts
for recipient where push_allowed: enqueue notification job
return canonical message/thread; push status async
```

### A44. Safeguarding Interaction Gate

**Release:** P0

**Purpose:** 미성년자를 포함하는 검색·연락·영상공유·포트폴리오 접근 전에 공통 hard gate 적용

**Inputs:** actor, subject, action, context, verified role, relationship, guardian/org policy, blocks/reports

**Outputs:** ALLOW/DENY/REQUIRE_GUARDIAN/REQUIRE_ORG_ROUTE, allowed fields/channel

**Parameters/Rules:** deny-by-default for external direct minor contact. Authorization allow여도 Safety가 deny하면 최종 deny.

**Edge/Failure:** age unknown, guardian missing, suspended role, urgent team announcement, blocked relationship.

**Tests:** coach to own team minor; agent external minor; referee post-match contact; guardian-mediated; blocked actor.

```text
if account_or_relationship_blocked: DENY
if subject.is_minor and actor is external_to_verified_team_relationship:
    if action is DIRECT_MESSAGE or PRIVATE_CONTACT: require guardian/org mediated route
policy = safety_policy(action, actor.role, relationship, context)
return most restrictive of policy + consent + block/report state
```

### A45. Safety Incident Triage & Escalation

**Release:** P0

**Purpose:** 신고·위험 신호를 감사 가능한 단계로 처리하고 즉시 필요한 접촉 제한을 적용

**Inputs:** report category, target, reporter, evidence refs, repeat history, severity rules

**Outputs:** incident severity, temporary restrictions, review queue, escalation action, resolution state

**Parameters/Rules:** automated triage는 임시 보호조치까지만; 중대한 계정/법적 조치는 authorized reviewer workflow.

**Edge/Failure:** malicious report spam, duplicate reports, missing evidence, cross-tenant incident, urgent safety category.

**Tests:** duplicate report; high severity; blocked media; dismissed report; repeat offender; false report handling.

```text
dedupe related reports into incident
severity = rule_based_category_severity + repeat/history modifiers
if severity >= TEMP_RESTRICTION_THRESHOLD:
    apply reversible contact/content restriction
route to authorized review queue by tenant/platform scope
record every action + reason + actor
on resolution: retain minimal audit according to lifecycle policy
```
