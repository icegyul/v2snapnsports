# SNAPN SPORTS V2 ENGINE DEPENDENCY & RELEASE MAP

**v1.3 | 2026-08-27 | Football Life + Safeguarding expansion**

```text
Identity / Primary Experience (E01)
 ├─ Manager Role Experience (E02)
 │   └─ Role Verification (E26)
 │       └─ Authorization / Data Scope (E03)
 │            └─ Safeguarding & Trust (E40) [interaction hard gate]
 ├─ Guardian & Consent (E04) ───────────────┘
 └─ Organization / Team / Season (E05)
      ├─ Match & Competition (E27)
      │    ├─ Referee Workspace
      │    ├─ Home State / Notification
      │    └─ Earthus Context Adapter (E35) [OPTIONAL, SOFT]
      ├─ Training / Schedule / Attendance (E13)
      ├─ Formation & Position (E09) → My Football World (E08)
      ├─ Tactical Board (E14)
      └─ Football Career Passport (E36)
            ├─ Growth / Football Career presentation (E18)
            ├─ Stadium Legacy Wall presentation
            ├─ Media/Highlight (E17)
            └─ Scouting Consent & Opportunity (E37)
                   └─ Agent Portfolio Workspace (E28)

Legacy Adapter (E06) → Community Compatibility (E15) → Community Safety (E16)
                                      └─ Feed Intelligence (E33) [OFF V2.0]

Team Communication (E39)
 ├─ Organization/Team membership
 ├─ Guardian relationships
 ├─ Match/Training/Schedule context
 ├─ Notification delivery (E19)
 └─ Safeguarding hard gate (E40)

Permission-aware Search (E32)
 ├─ Community
 ├─ Team/Match/Video
 └─ Approved Career/Scouting projection only

Offline Sync (E29) → Training / Attendance / Match Event / Coach Note / Communication draft-send
Data Lifecycle (E30) → Consent / Media / Search / Analytics / Career / Scouting / Safety retention
Product Analytics (E31) observes UX only; Safety/Scouting/Player performance data are not ranking features.

Stadium Experience (E08)
 ├─ Formation (E09)
 ├─ Home State (E10)
 ├─ Stadium Composition (E11)
 ├─ Spatial Navigation (E12)
 └─ 3D Asset Delivery & Cache (E34)

Feature Flag (E07)
 ├─ Feed Intelligence experiment
 ├─ Search experiment
 ├─ Earthus Context adapter optional
 ├─ Stadium Audio
 ├─ EPTS [HARD OFF]
 ├─ Camera/Vision [PILOT]
 └─ Evidence Sports AI [EVIDENCE GATE]
```

## Release grouping

- **V2.0 P0:** Identity/Permission/Guardian/Legacy/Community/Safety/Communication base/Offline/Privacy/Analytics/My Football World/Training core.
- **V2.0/P1:** Match & Competition, Tactical, advanced Media, Career Passport, Stadium DIY.
- **V2.1:** Scouting/Opportunity, Agent advanced workspace, Search, Feed experiment, Earthus Context, advanced asset delivery.
- **Future gated:** EPTS, Camera/Vision, Evidence Sports AI.
- **Reserved:** E38 Tournament & League Extension. Not active in v1.3.

## Earthus dependency

```text
Earthus Context API
       ↓
E35 Earthus Context Adapter
       ↓
Training / Match / Venue projections
```

E35 timeout, stale data, or provider outage MUST NOT block the core SnapN workflow.
