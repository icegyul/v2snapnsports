# SNAPN SPORTS V2 — EARTHUS CONTEXT INTEGRATION SPEC

**v1.3 | E35 | SnapN does not duplicate public-data collection**

## 1. Decision

날씨, 폭염/한파, 대기질, 장소 기반 환경 Context는 SnapN Sports가 원천 공공 API를 직접 중복 연동하지 않고 **Earthus에서 공급받는다.**

SnapN의 책임은 축구 이벤트에 Context를 붙이는 것이고, Earthus의 책임은 지구/기상/환경 데이터를 수집·검증·가공하는 것이다.

## 2. Boundary

```text
EARTHUS
  weather / heat-cold / air quality / place context
        ↓
Earthus Context API
        ↓
E35 Earthus Context Adapter
        ↓
SnapN EventContext
        ↓
Training / Match / Venue UI
```

## 3. Non-goals

- SnapN에서 KMA/AirKorea API 재구현.
- 날씨만으로 자동 훈련 취소.
- 환경 데이터를 선수 부상위험/능력평가로 자동 변환.
- Earthus 장애를 SnapN core 장애로 전파.

## 4. Minimal Provider Interface

```text
get_context(location, event_time, locale) -> {
  weather,
  temperature,
  feels_like,
  precipitation,
  wind,
  humidity,
  heat_risk,
  cold_risk,
  air_quality,
  pm10,
  pm25,
  ozone,
  place_context,
  issued_at,
  fetched_at,
  freshness,
  source_summary,
  schema_version
}
```

실제 Earthus API field naming은 Earthus contract 확정 후 Adapter 내부에서 매핑한다. SnapN public API가 Earthus 내부 스키마에 직접 종속되지 않게 한다.

## 5. Failure policy

| Earthus state | SnapN behavior |
| --- | --- |
| Fresh | 최신 Context 표시 |
| Partial | 존재하는 항목만 표시 |
| Timeout + valid cache | 마지막 Context + stale 표시 |
| No usable data | 환경정보 영역 축소/숨김 |
| Schema mismatch | Adapter error 기록, core route 정상 |

## 6. Caching

- Cache key: rounded location + event time window + Earthus schema version.
- Event venue/time 변경 시 이전 key invalidation.
- freshness는 Earthus metadata를 우선하며 SnapN은 임의 최신값을 생성하지 않는다.

## 7. Security / Privacy

- Earthus 요청은 Venue/Event location Context 수준으로 제한한다.
- 선수 개인 health/identity 데이터를 Earthus에 전달하지 않는다.
- Earthus Context와 athlete performance store를 자동 결합하지 않는다.

## 8. Acceptance

- Earthus disabled 상태에서도 Training/Match/Schedule E2E 정상.
- provider timeout이 앱 primary CTA를 지연시키지 않음.
- stale 표시 없이 오래된 데이터를 최신처럼 표시하지 않음.
- SnapN repository에 중복 KMA/AirKorea secret/config가 신규 추가되지 않음.
