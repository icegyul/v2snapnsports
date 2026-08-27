# SNAPN SPORTS V2 ENGINE CATALOG

**v1.3 | 2026-08-27 | 39 Active Engines + E38 Reserved**

| ID | Engine | Release | Responsibility |
| --- | --- | --- | --- |
| E01 | Identity & Primary Experience Engine | P0 | 공개 가입 PLAYER/MANAGER, 로그인, 프로필, primary experience |
| E02 | Manager Role Experience Engine | P0 | Manager의 세부 역할 선택/전환과 역할별 IA 생성 |
| E03 | Authorization & Data Scope Engine | P0 | permission, tenant/team/player scope 서버 판정 |
| E04 | Guardian & Consent Engine | P0 | 미성년자 보호자 초대/연결/동의 버전 관리 |
| E05 | Organization / Team / Season Engine | P0 | 구단/아카데미/팀/시즌 membership 기준 |
| E06 | Legacy Adapter & Migration Engine | P0 | 기존 Auth/팀/일정/출석/공지/커뮤니티/미디어를 V2 contract로 노출 |
| E07 | Feature Flag & Release Control Engine | P0 | 기능의 범위/킬스위치/파일럿 제어 |
| E08 | My Football World / Stadium Experience Engine | P0 | Stadium entry, pitch, my card, scoreboard, spatial home |
| E09 | Formation & Position Engine | P0 | 팀 formation과 선수 포지션을 피치 좌표로 변환 |
| E10 | Home State & Primary Action Engine | P0 | 오늘 상황에 따라 전광판과 1개 CTA 선택 |
| E11 | Stadium Style Composition Engine | P0/P1 | Style Family 기반 DIY 조합과 구조/미학/성능/IP 검증 |
| E12 | Spatial Navigation Engine | P0 | 3D 오브젝트와 2D route/capability 연결 |
| E13 | Training / Schedule / Attendance Engine | P0 | 훈련/경기 일정, 참가응답, 출석, 세션 기본 |
| E14 | Tactical Board Engine | P1 | 코치 2D 전술 작성과 3D 재생 |
| E15 | Community Compatibility Engine | P0 | 기존 커뮤니티 기능을 V2에서 그대로 제공 |
| E16 | Community Safety & Moderation Engine | P0 | 미성년자 공개범위·신고·차단·미디어 권한 보호 |
| E17 | Media & Video Engine | P0/P1 | 커뮤니티/훈련/개인 영상 asset, 권한, proxy/thumbnail |
| E18 | Growth / Football Career Engine | P0/P1 | 센서 없이도 시즌·훈련·팀·포지션·피드백·영상 타임라인 |
| E19 | Notification Engine | P0 | 일정/공지/커뮤니티/팀 알림 thread와 중복 제거 |
| E20 | Subscription / Entitlement Engine | P1 | 프리미엄/구단 기능 권리 |
| E21 | Stadium Audio Recipe Engine | P1/P2 | 스타디움 스타일에 맞는 음향/PA/입장 모드 |
| E22 | EPTS Integration Engine | FUTURE OFF | GNSS/IMU/PPG 파일 수집·동기화·후처리 인터페이스 |
| E23 | Camera / Vision Integration Engine | FUTURE/PILOT | 고정 광각/OBSBOT 영상, tracking, event clip 인터페이스 |
| E24 | Evidence Sports AI Engine | FUTURE EVIDENCE GATE | Fact→Context→Cause→Confidence→Adjustment→Coach Review |
| E25 | Audit / Observability Engine | P0 | 보안·권한·릴리즈·데이터 접근·성능 관측 |
| E26 | Role Verification & Credential Engine | P0 | 매니저 세부 역할의 자격·소속·승인을 검증하고 실제 RoleGrant와 분리 |
| E27 | Match & Competition Engine | P0/P1 | 대회·시즌·경기·로스터·라인업·경기 이벤트·결과·리포트의 canonical domain |
| E28 | Agent Portfolio & Opportunity Engine | P1 | 선수/보호자/구단이 승인한 범위의 포트폴리오와 트라이아웃·상담·기회 workflow |
| E29 | Offline Sync & Conflict Resolution Engine | P0 | 현장 오프라인 이벤트 로그, 재접속 동기화, 중복 제거, 충돌 처리와 복구 |
| E30 | Data Lifecycle & Privacy Operations Engine | P0 | 동의 철회·데이터 열람/내보내기·삭제·보관기간·파생데이터 정리의 추적 가능한 workflow |
| E31 | Product Analytics & Retention Measurement Engine | P0 | V2 UX·커뮤니티·3D 진입·재방문 효과를 제품 지표로 측정하며 선수 성과평가와 분리 |
| E32 | Permission-aware Search & Discovery Engine | P1 | 커뮤니티·팀/구단·영상·경기·허가된 선수 포트폴리오의 통합 검색과 권한 필터 |
| E33 | Community Feed Intelligence Engine | P1/P2 | Legacy parity 이후 관계·최신성·반응·관련성·다양성 기반 피드 순서 실험 |
| E34 | 3D Asset Delivery & Cache Engine | P0/P1 | Stadium Recipe를 실제 모바일 자산 manifest/CDN/cache/LOD variant로 빠르게 전달 |
| E35 | Earthus Context Adapter Engine | P1 OPTIONAL | Earthus가 제공하는 날씨·폭염/한파·대기질·장소 Context를 SnapN 일정/경기 화면에 soft dependency로 투영 |
| E36 | Football Career Passport Engine | P0/P1 | 입단·팀 이동·포지션·시즌·훈련·경기·영상·코치 피드백을 provenance와 함께 선수의 장기 축구 여정으로 누적 |
| E37 | Scouting Consent & Opportunity Engine | P1/P2 | 보호자/선수/구단 승인 범위에서 스카우팅 공개·관심·트라이아웃·기회 연결을 관리하며 성과 자동랭킹은 하지 않음 |
| E39 | Team Communication Engine | P0/P1 | 팀/구단 운영 메시지·공지·DM·참가응답 관련 대화를 권한·미성년 보호 규칙 아래 통합 |
| E40 | Safeguarding & Trust Engine | P0 | 미성년자 연락·차단·신고·관계 검증·접촉 제한·incident escalation을 전 도메인 공통 hard gate로 적용 |


## v1.1 Extension Engine Details

### E26. Role Verification & Credential Engine

- **Release:** P0
- **Responsibility:** 매니저 세부 역할의 자격·소속·승인을 검증하고 실제 RoleGrant와 분리
- **Inputs:** requested_role, organization membership/invite, credential evidence, verification status/expiry
- **Outputs:** verification_case, credential_state, verified RoleGrant request
- **Storage:** role_credentials, verification_cases, credential_evidence, verification_audit
- **API:** /v2/me/credentials, /v2/role-verifications/*
- **Gate:** 역할 선택만으로 데이터 접근 금지. VERIFIED 상태와 scope가 있어야 grant 발급. 만료/취소 즉시 재평가.
- 초기에는 구단/아카데미 초대·Owner 승인·수동 검증을 기본으로 하고, 외부 공식 자격 DB는 실제 연동 가능성이 확인된 경우에만 Adapter로 추가한다.
- Coach/Team Manager/Club Director/Referee/Agent/Analyst마다 필요한 verification evidence를 분리하며 모든 역할에 동일한 증빙을 강제하지 않는다.
- Role preference는 개인설정 값이고 RoleGrant는 서버 보안 객체다. 두 값이 달라도 정상 상태로 처리한다.

### E27. Match & Competition Engine

- **Release:** P0/P1
- **Responsibility:** 대회·시즌·경기·로스터·라인업·경기 이벤트·결과·리포트의 canonical domain
- **Inputs:** competition/season, home/away team, venue, schedule, roster/lineup, referee assignment, match events
- **Outputs:** Match aggregate, state, event timeline, score/result, official report state
- **Storage:** competitions, competition_seasons, matches, match_rosters, match_lineups, match_events, match_reports
- **API:** /v2/competitions/*, /v2/matches/*
- **Gate:** Match state machine 강제, event idempotency/append-only correction, 역할별 write scope, finalization audit 필수.
- 선수·코치·구단장·심판·에이전트가 모두 같은 match_id를 바라보되 projection과 write capability는 역할별로 분리한다.
- 경기 결과는 화면 입력값 하나를 신뢰하지 않고 유효한 경기 이벤트와 공식 report state로부터 재현 가능해야 한다.
- 대회 규정 차이는 CompetitionRuleSet 버전으로 분리하고 V2.0에서 모든 종목/리그 규칙을 일반화하려 하지 않는다.

### E28. Agent Portfolio & Opportunity Engine

- **Release:** P1
- **Responsibility:** 선수/보호자/구단이 승인한 범위의 포트폴리오와 트라이아웃·상담·기회 workflow
- **Inputs:** athlete publicable profile, consent, club permission, portfolio assets, opportunity/trial data
- **Outputs:** permissioned portfolio projection, opportunity state, meeting/trial timeline
- **Storage:** agent_player_links, portfolio_permissions, portfolio_views, opportunities, opportunity_actions
- **API:** /v2/agent/*, /v2/athletes/{id}/portfolio
- **Gate:** 미성년자는 명시적 보호자/선수·구단 정책 범위만 공개. 건강/내부 코치 메모/비공개 원본 데이터 금지. 자동 공개 랭킹 금지.
- Agent 계정이 모든 선수를 검색·열람하는 구조를 금지하고 관계 또는 공개 허가가 성립한 선수만 상세 포트폴리오를 노출한다.
- Opportunities는 제안→검토→수락/거절→일정→종료 상태를 기록하되 계약 중개 법률/자격 범위는 별도 정책으로 둔다.
- 성과 평가 AI가 아니라 권한이 있는 정보의 정리·전달 계층으로 시작한다.

### E29. Offline Sync & Conflict Resolution Engine

- **Release:** P0
- **Responsibility:** 현장 오프라인 이벤트 로그, 재접속 동기화, 중복 제거, 충돌 처리와 복구
- **Inputs:** client_id, local_sequence, entity/version, events, idempotency_key, sync cursor
- **Outputs:** acknowledged events, server cursor, conflict decisions, retry/dead-letter state
- **Storage:** client_event_journal, sync_cursors, idempotency_records, sync_conflicts, dead_letters
- **API:** /v2/sync/*
- **Gate:** 데이터 유실 금지. 권한/동의/결제는 단순 last-write-wins 금지. 이벤트형 데이터는 append-only + correction.
- 훈련 타이머·출석·코치 메모·경기 이벤트는 네트워크 단절 중에도 로컬 event journal에 즉시 기록한다.
- 중복 전송은 idempotency key와 event_id로 안전하게 재처리하며, 서버 commit 전에는 로컬 이벤트를 삭제하지 않는다.
- 권한 민감 필드는 서버 authoritative, 사용자 편집형 메모는 optimistic version, 이벤트 로그는 append-only 등 데이터 유형별 conflict policy를 분리한다.

### E30. Data Lifecycle & Privacy Operations Engine

- **Release:** P0
- **Responsibility:** 동의 철회·데이터 열람/내보내기·삭제·보관기간·파생데이터 정리의 추적 가능한 workflow
- **Inputs:** privacy request, data subject, requester authority, consent change, retention/legal-hold policy
- **Outputs:** request state, export bundle, deletion/anonymization manifest, tombstone/audit evidence
- **Storage:** privacy_requests, lifecycle_jobs, retention_policies, deletion_manifests, legal_holds
- **API:** /v2/privacy/*, /v2/consents/*
- **Gate:** 동의 철회 후 신규 접근 즉시 차단. DB/object/cache/search/derived data까지 cascade 추적. 법적 보존 사유는 삭제 완료와 구분.
- 삭제는 row delete 한 번으로 끝내지 않고 미디어·thumbnail·search index·cache·analytics 식별자·향후 AI 파생물을 manifest로 추적한다.
- 법률 또는 계약상 보존이 필요한 데이터는 PURGED가 아니라 RESTRICTED/LEGAL_HOLD 같은 별도 상태로 보고한다.
- 요청자와 대상자의 관계, 보호자 권한, tenant 책임을 서버에서 검증하고 모든 단계에 audit event를 남긴다.

### E31. Product Analytics & Retention Measurement Engine

- **Release:** P0
- **Responsibility:** V2 UX·커뮤니티·3D 진입·재방문 효과를 제품 지표로 측정하며 선수 성과평가와 분리
- **Inputs:** pseudonymous product events, route/screen state, session timing, community interactions, feature flags/experiments
- **Outputs:** funnels, retention cohorts, dwell/engagement metrics, crash/performance correlation
- **Storage:** analytics_events, analytics_sessions, experiment_assignments, aggregated_metrics
- **API:** /v2/analytics/events (ingest) + internal query
- **Gate:** 미성년자 개인정보 최소화. 생체/건강 원시 데이터 금지. 스포츠 AI/선수 평가 feature store와 물리·논리 분리.
- “커뮤니티가 체류시간을 늘린다”는 가설을 측정하기 위해 feed load, post open, meaningful interaction, foreground dwell, return visit를 구분한다.
- 백그라운드 체류를 실제 사용시간으로 계산하지 않고 foreground/activity heartbeat 기준으로 세션을 구성한다.
- Feature Flag/실험 버전을 이벤트에 함께 저장해 UI 변경 전후를 재현 가능하게 비교한다.

### E32. Permission-aware Search & Discovery Engine

- **Release:** P1
- **Responsibility:** 커뮤니티·팀/구단·영상·경기·허가된 선수 포트폴리오의 통합 검색과 권한 필터
- **Inputs:** query, requester role/scope, entity visibility, tenant/public partitions, search index
- **Outputs:** authorized ranked results, type facets within visible scope
- **Storage:** search_documents/index, index_visibility_tags, indexing_jobs
- **API:** /v2/search
- **Gate:** 권한 pre-filter + result post-check. 숨겨진 리소스의 존재/건수 leak 금지. 미성년 선수 검색은 공개/동의 정책 우선.
- 검색 index에는 최소 공개 필드만 복제하고 원본 ACL을 우회하는 별도 데이터 저장소가 되지 않게 한다.
- Agent/Referee 검색은 각 역할에 필요한 entity type만 노출하며 다른 역할의 민감 필드를 함께 색인하지 않는다.
- 삭제·동의 철회·소속 변경 시 reindex/invalidate job을 Data Lifecycle Engine과 연동한다.

### E33. Community Feed Intelligence Engine

- **Release:** P1/P2
- **Responsibility:** Legacy parity 이후 관계·최신성·반응·관련성·다양성 기반 피드 순서 실험
- **Inputs:** eligible posts after visibility/moderation, relation graph, recency, engagement, seen state, experiment config
- **Outputs:** ranked feed, explanation/debug factors, experiment metrics
- **Storage:** feed_signals, feed_impressions, ranker_versions, experiments
- **API:** /v2/community/feed?ranker={version}
- **Gate:** V2.0 기본 OFF/Legacy order. Visibility·moderation hard gate가 ranking보다 먼저. 민감 특성 추론·낙인·과도한 중독 유도 설계 금지.
- Community Compatibility가 먼저 통과한 뒤 별도 Feature Flag로만 활성화한다. 새 ranker가 기존 글/댓글/신고 동작을 바꾸면 안 된다.
- 한 작성자·한 팀의 과도한 반복을 diversity cap으로 줄이고 이미 본 게시물은 seen penalty를 적용한다.
- 초기 가중치는 실험 config이며 코드에 영구 상수로 고정하지 않는다.

### E34. 3D Asset Delivery & Cache Engine

- **Release:** P0/P1
- **Responsibility:** Stadium Recipe를 실제 모바일 자산 manifest/CDN/cache/LOD variant로 빠르게 전달
- **Inputs:** recipe/module ids, asset versions, device tier, network/cache state, app version, storage/CDN availability
- **Outputs:** asset manifest, required/optional bundles, signed URLs, prefetch/cache directives, fallback variant
- **Storage:** asset_manifests, asset_bundle_versions, asset_integrity, cache_policy_versions
- **API:** /v2/assets/stadium-manifest, /v2/assets/bundles/{id}
- **Gate:** core bundle 미준비로 앱을 막지 않음. checksum/version 검증, LOW/MID/HIGH fallback, 2D/Static Home 항상 접근 가능.
- FULL 진입은 core bundle 준비가 확인된 경우에만 허용하고 미준비 상태는 FAST/LIGHT/STATIC으로 즉시 폴백한다.
- 현재 사용 Stadium의 core bundle은 pin하고 장식/환경은 cache budget에 따라 제거 가능한 optional bundle로 분리한다.
- Asset manifest에는 개인정보를 넣지 않고 CDN 파일명/캐시에 선수 이름·계정 식별자가 포함되지 않게 한다.

### E35. Earthus Context Adapter Engine

- **Release:** P1 OPTIONAL
- **Responsibility:** Earthus가 이미 수집·가공한 날씨, 체감환경, 폭염/한파, 대기질, 장소 Context를 SnapN의 Training/Match/Venue 화면에 제공하는 provider adapter.
- **Inputs:** venue coordinates, event time, Earthus context response, source/freshness metadata.
- **Outputs:** normalized SnapN EventContext, badges, freshness, partial/unavailable state.
- **Storage:** earthus_context_cache, provider_fetch_log, event_context_snapshot(optional).
- **API:** internal `EarthusContextProvider`; SnapN public projection `/v2/context/events/{event_id}`.
- **Gate:** Earthus 장애/지연은 Training/Match/Schedule을 막지 않는다. stale/unavailable은 정상 상태. SnapN이 KMA/AirKorea 등 원천 공공 API를 중복 직접 연동하지 않는다.
- Earthus가 반환한 Context를 선수 성과평가·스카우팅·의료판단으로 자동 변환하지 않는다.
- UI는 값과 freshness를 보조적으로 보여주며 코치의 훈련 취소/강도 변경을 자동 확정하지 않는다.

### E36. Football Career Passport Engine

- **Release:** P0/P1
- **Responsibility:** 선수의 축구 활동을 장기적으로 이어지는 단일 Career Passport로 구성한다. Growth 화면의 일회성 요약이 아니라 시즌·팀 이동 이후에도 유지되는 축구 이력의 canonical projection이다.
- **Inputs:** membership/team history, season, position history, training attendance, match participation, coach-approved feedback, representative media, milestones, user/guardian visibility settings.
- **Outputs:** CareerPassport, CareerEvent timeline, SeasonChapter, Highlight, verified provenance badge, export/share projection.
- **Storage:** career_passports, career_events, career_event_sources, season_chapters, career_highlights, passport_visibility.
- **API:** `/v2/athletes/{id}/passport`, `/v2/athletes/{id}/passport/events`, `/v2/athletes/{id}/passport/highlights`.
- **Gate:** 원천 source가 없는 경력·수상·능력치를 자동 생성하지 않는다. 삭제/동의 철회/팀 이동 시 provenance와 visibility를 재평가한다.
- Career Event는 `source_type/source_id/source_version/occurred_at/verified_state`를 필수로 가져야 한다.
- 팀 이동으로 organization이 달라져도 선수 본인의 법적 열람 범위 Career Passport는 유지하되, 이전 구단의 내부 코치 메모·전술 자산은 Passport로 복제하지 않는다.
- My Stadium Legacy Wall은 Career Passport의 presentation layer이며 별도의 사실 저장소가 아니다.

### E37. Scouting Consent & Opportunity Engine

- **Release:** P1/P2
- **Responsibility:** 스카우팅/트라이아웃/상담 기회를 선수에게 연결하되, 공개 가능한 정보와 연락 권한을 Consent + Safeguarding 기준으로 관리한다.
- **Inputs:** athlete passport projection, scouting visibility consent, guardian approval for minor, club policy, opportunity requirements, agent/club verified role, block/report state.
- **Outputs:** eligible portfolio projection, opportunity invitation, interest state, shortlist state, consent/visibility audit.
- **Storage:** scouting_preferences, scouting_consents, opportunity_requirements, opportunity_invites, scouting_interests, scouting_shortlists, scouting_audit.
- **API:** `/v2/scouting/preferences`, `/v2/scouting/opportunities`, `/v2/scouting/opportunities/{id}/interest`, `/v2/scouting/invitations/*`.
- **Gate:** 미성년자는 opt-in + 보호자 정책이 없으면 검색/추천 대상에서 제외. 건강/생체/내부 코치 메모/비공개 영상/자동 능력랭킹을 스카우팅 입력으로 사용하지 않는다.
- E28 Agent Portfolio & Opportunity는 에이전트 Workspace/관계 projection을 담당하고, E37은 선수-구단-에이전트 전반의 canonical scouting consent/opportunity domain을 담당한다.
- 초기 추천은 hard eligibility 필터 + 명시된 포지션/연령/지역/일정 조건 수준으로 시작하고, “프로 성공 가능성” 같은 예측 점수는 생성하지 않는다.

### E38. RESERVED — Tournament & League Extension Engine

- **Status:** RESERVED / NOT ACTIVE IN v1.3
- E27 Match & Competition으로 V2.0의 경기/대회 요구를 충족한다.
- 향후 외부 리그 운영, 대진표, 순위표, 승강/토너먼트 bracket을 SnapN이 직접 운영할 필요가 확정되면 E38 ID를 사용한다.
- v1.3 엔진 수에는 포함하지 않는다.

### E39. Team Communication Engine

- **Release:** P0/P1
- **Responsibility:** 팀/구단의 운영성 커뮤니케이션을 Community와 분리해 관리한다. 일정 변경, 참가응답, 코치 공지, 보호자 연락, 역할 기반 DM/Thread가 대상이다.
- **Inputs:** sender RoleGrant, recipient scope, team/org membership, guardian relationship, communication policy, thread context(schedule/match/training), safety state.
- **Outputs:** communication thread, message, delivery/read state, moderation/safety decision, linked action.
- **Storage:** communication_threads, communication_members, messages, message_receipts, communication_policies, message_flags.
- **API:** `/v2/comms/threads`, `/v2/comms/threads/{id}/messages`, `/v2/comms/announcements`, `/v2/comms/unread`.
- **Gate:** 커뮤니티 게시물과 팀 운영 메시지를 같은 권한 모델로 처리하지 않는다. 미성년자 개인 DM은 E40 Safeguarding hard gate를 먼저 통과한다.
- 공지/일정 응답과 일반 대화를 Thread Context로 연결해 사용자가 같은 사건을 여러 화면에서 중복 추적하지 않게 한다.
- 푸시 실패는 메시지 자체의 저장 실패가 아니며 Notification Engine은 delivery channel일 뿐 canonical message store가 아니다.

### E40. Safeguarding & Trust Engine

- **Release:** P0
- **Responsibility:** 미성년자 중심 서비스의 사람-사람 접촉, 검색, 메시지, 포트폴리오, 영상 공유, 신고/차단을 공통 정책으로 통제한다.
- **Inputs:** actor/subject age class, verified roles, guardian relationship, org/team membership, contact relationship, consent, block/report state, channel/context, platform policy.
- **Outputs:** ALLOW/DENY/REQUIRE_GUARDIAN/REQUIRE_ORG_ROUTE, allowed channel/fields, incident record, escalation state.
- **Storage:** safety_relationships, safety_policies, blocks, reports, incidents, escalation_actions, trust_audit.
- **API:** `/v2/safety/check` (internal), `/v2/safety/reports`, `/v2/safety/blocks`, `/v2/safety/incidents/{id}` (authorized staff).
- **Gate:** Authorization보다 이후에 보조적으로 붙는 UI 필터가 아니라, 민감 interaction 전에 반드시 호출되는 hard policy gate다.
- Agent/Referee/외부 Manager가 미성년 선수에게 임의로 직접 연락하는 경로를 기본 deny한다. 필요 시 Guardian/Club-mediated route만 허용한다.
- 신고된 콘텐츠/사용자에 대한 조치는 계정 전체 정지 하나로 단순화하지 않고 contact restriction, content hide, review hold, tenant escalation 등 단계별로 기록한다.
- Safety 데이터는 Product Analytics/Scouting ranking에 사용하지 않는다.
