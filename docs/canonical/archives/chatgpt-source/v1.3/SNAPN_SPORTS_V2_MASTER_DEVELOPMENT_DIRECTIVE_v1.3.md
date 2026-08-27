# SNAPN SPORTS V2 MASTER DEVELOPMENT DIRECTIVE

**v1.3 | 2026-08-27 | 39 Active Engines / 45 Algorithms + E38 Reserved**

## 핵심 결정

- V2는 새 UX/정보구조로 시작하되 Legacy 데이터/기능은 증거 기반으로 재사용한다.
- 공개 가입 선택은 PLAYER / MANAGER 두 개뿐이다.
- Manager 세부 역할은 가입 후 개인설정에서 선택하되, Role preference와 실제 Permission/RoleGrant를 분리한다.
- Guardian은 선수 초대 흐름으로 연결한다.
- 선수 홈은 Stadium → Pitch → My Position → My Team → Spatial Home이며 하단은 HOME / TRAINING / COMMUNITY / VIDEO / MORE.
- Community는 V2.0에서 기존 기능 parity를 우선하고 Feed Intelligence는 기본 OFF다.
- EPTS/Camera/Evidence AI는 실제 승인 전 HARD_DISABLED/FUTURE gate를 유지한다.
- 3D는 핵심 경험이지만 모든 핵심 기능은 2D/Static fallback을 제공한다.
- 초기 백엔드는 Modular Monolith + Worker + Transactional Outbox + PostgreSQL/Redis/Object Storage/CDN을 기본으로 한다.

## v1.1~v1.2 신규 책임 경계

- **E26 Role Verification & Credential Engine (P0)** — 매니저 세부 역할의 자격·소속·승인을 검증하고 실제 RoleGrant와 분리
- **E27 Match & Competition Engine (P0/P1)** — 대회·시즌·경기·로스터·라인업·경기 이벤트·결과·리포트의 canonical domain
- **E28 Agent Portfolio & Opportunity Engine (P1)** — 선수/보호자/구단이 승인한 범위의 포트폴리오와 트라이아웃·상담·기회 workflow
- **E29 Offline Sync & Conflict Resolution Engine (P0)** — 현장 오프라인 이벤트 로그, 재접속 동기화, 중복 제거, 충돌 처리와 복구
- **E30 Data Lifecycle & Privacy Operations Engine (P0)** — 동의 철회·데이터 열람/내보내기·삭제·보관기간·파생데이터 정리의 추적 가능한 workflow
- **E31 Product Analytics & Retention Measurement Engine (P0)** — V2 UX·커뮤니티·3D 진입·재방문 효과를 제품 지표로 측정하며 선수 성과평가와 분리
- **E32 Permission-aware Search & Discovery Engine (P1)** — 커뮤니티·팀/구단·영상·경기·허가된 선수 포트폴리오의 통합 검색과 권한 필터
- **E33 Community Feed Intelligence Engine (P1/P2)** — Legacy parity 이후 관계·최신성·반응·관련성·다양성 기반 피드 순서 실험
- **E34 3D Asset Delivery & Cache Engine (P0/P1)** — Stadium Recipe를 실제 모바일 자산 manifest/CDN/cache/LOD variant로 빠르게 전달

## v1.3 Football Life Layer

V2의 제품 구조를 세 층으로 확정한다.

```text
MY FOOTBALL WORLD
  경기장 / 내 위치 / 팀 / 정체성
        ↓
FOOTBALL ACTIVITY
  훈련 / 경기 / 전술 / 영상
        ↓
FOOTBALL LIFE
  Community / Career Passport / Communication / Scouting Opportunity
```

### 신규 핵심 엔진

- **E36 Football Career Passport Engine (P0/P1)** — 팀·시즌을 넘어 이어지는 선수의 검증 가능한 축구 여정.
- **E37 Scouting Consent & Opportunity Engine (P1/P2)** — 미성년 보호와 공개 동의를 전제로 한 트라이아웃·관심·기회 연결.
- **E39 Team Communication Engine (P0/P1)** — Community와 분리된 팀 운영 커뮤니케이션.
- **E40 Safeguarding & Trust Engine (P0)** — 메시지·검색·포트폴리오·영상공유 전에 적용되는 미성년자 공통 hard gate.
- **E38 ID는 Tournament & League 고도화를 위해 RESERVED**하며 v1.3 active engine count에는 포함하지 않는다.

### 구조 원칙

- Career Passport는 Growth/Legacy Wall의 **사실 원장(canonical source projection)** 역할을 하며 Stadium Legacy Wall은 표현 계층이다.
- Scouting은 자동 능력랭킹이 아니라 **동의된 정보 + 명시 조건 eligibility**부터 시작한다.
- Team Communication은 Community와 분리한다. Community는 체류/공개 상호작용, Communication은 팀 운영/직접 연락이다.
- 미성년자에게 외부 Agent/Referee/미검증 Manager가 직접 연락하는 경로는 기본 deny하고 Guardian/Club-mediated route를 우선한다.

## v1.3 Earthus Context Boundary

```text
Public / Official Earth Data
          ↓
       EARTHUS
          ↓
 Earthus Context API
          ↓
E35 Earthus Context Adapter
          ↓
SnapN Training / Match / Venue
```

- SnapN은 KMA/AirKorea 등 원천 공공 API를 직접 중복 연동하지 않는다.
- E35는 soft dependency다. Earthus 장애가 일정/훈련/경기를 막지 않는다.
- Earthus Context는 보조 정보이며 선수 성과평가·스카우팅·의료판단의 직접 입력으로 자동 사용하지 않는다.

## Revised Codex Phase v1.3

| Phase | 범위 | Gate |
| --- | --- | --- |
| P0 Audit / Freeze | Legacy DB/Auth/Community/Media/Match/Comms 현행 실사 | Inventory·write ownership·rollback 증거 |
| P1 Identity / Role / Safety | PLAYER/MANAGER, Guardian, RoleCredential, Permission, E40 Safety baseline | role self-selection bypass 0, minor contact negative tests |
| P2 Legacy Parity / Communication / Offline / Privacy | Community parity, E39 communication core, Offline Sync, Data Lifecycle | 기존 기능 누락 0 또는 exception, offline no-loss |
| P3 Match / Competition Core | Match canonical domain, referee events/report | event replay/state integrity |
| P4 My Football World / Asset Delivery | Stadium, formation, home state, asset cache/fallback | key info <=3s, real data binding |
| P5 Stadium DIY / Analytics | Recipe Builder + telemetry | reproducibility/privacy separation |
| P6 Training / Video / Career Passport | Training/Tactical/Video + E36 Passport | 센서 OFF에서도 Career timeline E2E |
| P7 Football Life / Manager | Agent workspace, E37 scouting, Career share, role workspaces | consent/safety/data-scope tests |
| P8 Search / Earthus / Hardening | Permission-aware search, E35 adapter, security/a11y/privacy | Earthus failure fallback, leakage 0 |
| P9+ Hardware / AI | EPTS/Camera/Evidence AI | 별도 PoC/release approval |

## v1.3 추가 Codex 필수 산출물

```text
docs/v2/
  V2_FOOTBALL_CAREER_PASSPORT_SCHEMA.md
  V2_SCOUTING_CONSENT_OPPORTUNITY_DOMAIN.md
  V2_TEAM_COMMUNICATION_POLICY.md
  V2_SAFEGUARDING_TRUST_POLICY.md
  V2_MINOR_CONTACT_NEGATIVE_TEST_MATRIX.md
  V2_EARTHUS_CONTEXT_ADAPTER_CONTRACT.md
  V2_FOOTBALL_LIFE_ARCHITECTURE.md
```
