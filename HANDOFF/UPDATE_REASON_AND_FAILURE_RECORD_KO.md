# 이번 업데이트가 필요한 이유와 실패 기록

## 1. 사용자가 요구한 제품 의미

Stadium Home은 멋있는 경기장 사진을 보여주는 랜딩 화면이 아니다. 사용자가 자기 팀 공간과 전술 맥락으로 들어가는 제품 진입점이다.

필수 의미는 다음과 같다.

```text
경기장 외부
→ 사용자가 직접 줌·탐색
→ 경기장 입장
→ 필드
→ 팀 전술표
→ 내 위치
→ 내 주변의 실제 연결 팀원
```

## 2. 이번 구현이 사용자의 검수에서 실패한 이유

2026-08-31 인앱 브라우저 재현 결과:

### Home

- URL: `/v2/home`
- `data-render-mode="STATIC"`
- `data-render-state="FALLBACK"`
- `.stadium-static-fallback` computed transform: `none`
- STATIC scene의 zoom 범위가 사실상 `1 → 1`이고 wheel handler도 STATIC에서 조기 반환한다.
- 결과: 화면은 상업용 사진처럼 보이지만 사용자는 줌하거나 경기장을 탐색할 수 없다.

### 입장 후

- URL: `/v2/home/full`
- `data-render-mode="STATIC"`
- `data-render-state="FALLBACK"`
- `data-journey-stage="SPATIAL_HOME"`
- `data-journey-progress="1.000"`
- formation teammate count: `3`
- 결과: 전술 필드·내 위치·주변 팀원이 나오지 않고 Spatial Home 링크만 보인다.

## 3. 판단 실패

이전 작업은 Home의 첫 프레임 비주얼을 개선하는 데 집중하면서, STATIC fallback을 실제 제품 경험으로 완성하지 않았다. 포스터 프레임을 상업적으로 보이게 만드는 것과 Stadium 기능을 서비스 가능하게 만드는 것을 혼동했다.

또한 테스트·빌드 통과와 화면의 기능적 의미를 분리하지 못했다. 사용자 입장에서 줌이 되지 않고 입장 후 전술 필드가 없으면, 자동 테스트가 통과해도 제품은 만들어진 것이 아니다.

이 기록은 변명이 아니라 다음 개발자가 같은 판단을 반복하지 않게 하기 위한 결함 기록이다.

## 4. 반드시 고칠 P0

1. STATIC Home에서도 wheel, pinch, keyboard zoom이 작동해야 한다.
2. 줌·드래그 뒤 클릭이 입장으로 오인되지 않아야 한다.
3. `경기장 입장` 후 외부 접근 연출보다 전술 필드가 우선 표시되어야 한다.
4. 전술 필드는 WebGL 성공 여부와 무관하게 표시되어야 한다.
5. `formation.shapeLabel`의 `4-3-3`을 표시한다.
6. 자기 선수 `#8 중앙 미드필더`를 가장 명확한 marker로 표시한다.
7. 현재 실제 연결 데이터인 `#4 DF`, `#7 MF`, `#11 FW`만 주변 팀원으로 표시한다.
8. 빠진 7명을 임의 생성하지 않는다.
9. teammate `publicName`과 avatar를 생성하거나 노출하지 않는다.
10. 실제 브라우저에서 Home zoom, entry, field, own marker, teammate marker를 눈으로 확인한다.

## 5. 완료로 오인하면 안 되는 항목

- 포스터가 선명하다: 기능 완료가 아님
- `READY` label이 있다: 실제 장면 완료가 아님
- component test가 통과한다: 브라우저 interaction 완료가 아님
- 이전 HEAD에서 browser PASS 이력이 있다: 현재 dirty source의 증거가 아님
- WebGL이 성공한다: 데이터·권한·fallback 완료가 아님

## 6. 사용자 기대 수준

데모형 UI, 카드형 대시보드, 검은 링 형태 Stadium, 기술 label로 가득 찬 화면은 허용되지 않는다. 화면 자체는 상업 서비스 수준이어야 하고, 핵심 상호작용은 실제로 작동해야 한다.
