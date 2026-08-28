# SCREEN ACCEPTANCE CHECKLIST

DONE은 아래 각 행의 11개 열이 모두 PASS일 때만 선언한다.

## Community

| Screen | Design | Component | Route | State | Adapter | Permission | Engine | Fallback | Test | A11y | Responsive |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Home | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Post Detail | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Composer | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Report/Block | ☐ | ☐ | action | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Hidden/Empty/Offline/Forbidden | ☐ | ☐ | same | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

Community additional gate:
- ☐ Feed Intelligence OFF = legacy order
- ☐ unsafe URL scheme blocked
- ☐ raw HTML direct render 0
- ☐ Team Communication import/store dependency 0

## Training

| Screen | Design | Component | Route | State | Adapter | Permission | Engine | Fallback | Test | A11y | Responsive |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Home | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Detail | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Schedule | ☐ | ☐ | parent | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Participation | ☐ | ☐ | action | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| History seam | ☐ | ☐ | Career | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

Training hard gate:
- ☐ wearable metric 0
- ☐ AI score 0
- ☐ fatigue score 0
- ☐ speed metric 0
- ☐ sample analysis 0
- ☐ Earthus failure does not block

## Video

| Screen | Design | Component | Route | State | Adapter | Permission | Engine | Fallback | Test | A11y | Responsive |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Home/Library | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Detail | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Representative selection | ☐ | ☐ | action | ☐ | ☐ | ☐ | E17/E36 | ☐ | ☐ | ☐ | ☐ |
| Permission/Empty/Offline/Error | ☐ | ☐ | same | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

Video hard gate:
- ☐ production URL derived from assetId = 0
- ☐ fake tracking/AI overlay = 0
- ☐ foreign minor private thumbnail leak = 0

## Career Passport

| Screen | Design | Component | Route | State | Adapter | Permission | Engine | Fallback | Test | A11y | Responsive |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Overview | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | E36 | ☐ | ☐ | ☐ | ☐ |
| Timeline | ☐ | ☐ | parent | ☐ | ☐ | ☐ | E36 | ☐ | ☐ | ☐ | ☐ |
| Season | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | E36 | ☐ | ☐ | ☐ | ☐ |
| Team/Position | ☐ | ☐ | parent | ☐ | ☐ | ☐ | E36 | ☐ | ☐ | ☐ | ☐ |
| Milestones/Videos/Achievements | ☐ | ☐ | parent | ☐ | ☐ | ☐ | E36/E17 | ☐ | ☐ | ☐ | ☐ |
| Share seam | ☐ | ☐ | action | ☐ | ☐ | ☐ | E37/E40 | ☐ | ☐ | ☐ | ☐ |

Career hard gate:
- ☐ every event has provenance
- ☐ synthetic/pro-potential/AI rating 0
- ☐ revoked source updates projection
- ☐ Growth bottom tab 0

## Player E2E

- ☐ login → home restore
- ☐ EXTERIOR
- ☐ APPROACH
- ☐ PITCH_ENTRY
- ☐ MY_POSITION
- ☐ TEAM_REVEAL
- ☐ SPATIAL_HOME
- ☐ bottom nav 5
- ☐ direct URL
- ☐ refresh
- ☐ back
- ☐ forward
- ☐ invalid route
- ☐ forbidden route
- ☐ offline
- ☐ stale
- ☐ FULL→FAST/LIGHT/STATIC
- ☐ STATIC parity
- ☐ low performance fallback
- ☐ reduced motion
