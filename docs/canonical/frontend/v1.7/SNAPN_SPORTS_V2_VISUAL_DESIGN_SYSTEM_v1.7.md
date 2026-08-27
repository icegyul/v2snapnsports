# SNAPN SPORTS V2 VISUAL DESIGN SYSTEM

**v1.7 | Graphite Stadium UI | 2026-08-27**

## 1. Design Decision
SnapN Sports V2의 기본 시각 테마는 **Graphite Stadium UI**로 고정한다. 기존 Dark Navy/near-black blue 계층은 구형 LCD, 낮은 밝기, 야외 사용에서 경계가 뭉개지는 문제 때문에 기본 테마에서 폐기한다.

핵심 원칙은 **경기장과 잔디가 주인공, UI는 neutral graphite로 뒤로 물러나는 것**이다.

## 2. Core Palette
| Semantic | Standard | High Contrast | Usage |
|---|---|---|---|
| Background | #121416 | #181B1E | 앱 기본 배경 |
| Surface | #1C2023 | #292E32 | 카드/하단탭 |
| Elevated | #282D31 | #3A4146 | Bottom Sheet/강조 카드 |
| Floating | #353C41 | #4B5359 | Modal/Floating control |
| Text Primary | #F7F8F8 | #FFFFFF | 핵심 텍스트 |
| Text Secondary | #C5CBD0 | #D7DCE0 | 설명/메타 |
| Text Muted | #9AA4AA | #B3BBC0 | 보조 정보 |
| Pitch Green | #62D36D | #72DD7A | 핵심 스포츠 accent |
| Focus Green | #A0F0A6 | #A0F0A6 | focus/내 선수 강조 |
| Warning | #FFC857 | #FFC857 | 주의 |
| Danger | #FF7470 | #FF7470 | 오류/위험 |

## 3. Surface Hierarchy
어두운 화면에서 계층은 색조가 아니라 **명도 + edge**로 구분한다.

1. App Background
2. Surface Card / Bottom Navigation
3. Elevated Sheet / Selected Card
4. Floating Modal / Critical Control

카드가 경기장 이미지 또는 3D 장면 위에 올라갈 때 투명도만으로 경계를 만들지 않는다. `border.default` 또는 `border.strong`을 함께 사용한다.

## 4. Pitch Green Usage
Pitch Green은 브랜드 전체를 초록색으로 칠하는 색이 아니다. 다음에 한정한다.
- Primary CTA
- 현재 선택된 하단 메뉴
- My Player marker/card
- 완료/정상 상태 일부
- Focus ring
- Stadium/pitch 데이터에서 핵심 포인트

대형 패널, 배경, 긴 텍스트 영역에는 사용하지 않는다.

## 5. App Shell
### Player Bottom Navigation
HOME / TRAINING / COMMUNITY / VIDEO / MORE를 항상 텍스트와 아이콘으로 표시한다. 활성 메뉴는 green + indicator shape로 표시하며 색상만으로 선택 상태를 표현하지 않는다.

### Manager Shell
업무 가독성이 감성보다 우선한다. field mode에서는 52px 이상 action target, 높은 surface contrast, 명확한 sync/offline 상태를 유지한다.

## 6. My Football World
첫 화면은 카드 대시보드가 아니다.

`Stadium Exterior -> Zoom -> Pitch -> My Position -> My Team -> Spatial Home`

- Pitch/Stadium visual share 최소 70% 목표.
- My Player는 동료보다 명확히 크고 Focus Green edge를 사용한다.
- Scoreboard는 Surface graphite + white text + 제한된 green accent.
- Bottom navigation은 stadium scene 위에서도 불투명에 가까운 surface를 유지한다.
- 3D가 불가능하면 동일 데이터의 STATIC pitch 화면으로 전환한다.

## 7. Community
Community는 체류시간의 핵심 기능이지만 피드가 과도하게 화려해서 My Football World와 다른 제품처럼 보이면 안 된다.
- 카드: Graphite Surface
- 본문: Primary text
- 메타: Secondary text
- 반응/선택: limited Pitch Green
- 영상/사진이 visual hero이며 카드 chrome은 최소화
- 기존 community ordering/기능 parity는 유지

## 8. Bottom Sheet / Modal
- Bottom Sheet = Elevated graphite + strong top edge.
- Modal = Floating graphite.
- 배경 stadium/영상이 비쳐 텍스트를 방해하는 반투명 glass-only 디자인 금지.
- Drag handle은 muted text보다 낮은 가시성으로 만들지 않는다.

## 9. High Contrast Graphite
별도 기능이나 별도 디자인이 아니라 동일 화면의 접근성 profile이다.
- 더 밝은 surface
- 더 강한 border
- secondary/muted text 밝기 상승
- 동일 정보/동일 CTA/동일 route
- 휴대폰 모델명/연식으로 자동 판정 금지
- 사용자 설정 또는 OS increased-contrast signal을 우선

## 10. Old / Low-Contrast Display QA
출시 전 핵심 화면을 다음 조건에서 검증한다.
- 20% 화면 밝기
- 50% 화면 밝기
- LCD 계열 테스트 기기
- OLED 계열 테스트 기기
- Grayscale 접근성 simulation
- 야외 Field Mode
- Stadium night scene 뒤 Bottom Navigation
- Community video thumbnail 뒤 overlay controls

실패 조건:
- 카드 경계를 눈으로 구분하기 어려움
- secondary text가 배경에 묻힘
- 활성/비활성 메뉴가 색상 없이는 구분되지 않음
- Bottom Sheet와 background scene 경계가 사라짐
- disabled와 normal control이 혼동됨

## 11. Forbidden Patterns
- Dark Navy를 기본 background/surface hierarchy로 재도입
- #000000 순수 검정을 모든 surface에 동일 적용
- opacity 5~10% 차이만으로 카드 계층 구분
- green neon 과다 사용
- 투명 glass card만으로 stadium scene 위 텍스트 표시
- 상태를 red/green 색상 하나로만 구분
- 화면마다 임의 hex color 작성

## 12. Implementation Rule
색상은 `SNAPN_SPORTS_V2_FRONTEND_DESIGN_TOKENS_v1.7.yaml`의 semantic token만 사용한다. 실제 저장소의 styling system은 READ-ONLY Audit 후 binding하되 token 의미는 변경하지 않는다.
