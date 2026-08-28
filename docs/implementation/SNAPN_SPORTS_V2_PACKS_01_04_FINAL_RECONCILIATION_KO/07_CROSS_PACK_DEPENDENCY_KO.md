# 07. CROSS-PACK DEPENDENCY — KO

## Required dependency edges

| Edge | Source owner | Consumer | Rule |
| --- | --- | --- | --- |
| Training → Career Passport | PACK01 owns Training event truth | PACK02 normalizes provenance CareerEvent | No direct career write from Training UI |
| Match → Career Passport | PACK01 owns match/final report | PACK02 projects approved career event/milestone | No fabricated score/event |
| Tactics → Coach / Analyst | PACK01 owns tactic versions | PACK03 role projection consumes | Analyst read scope only unless explicit capability |
| Training → Coach Workspace | PACK01 domain API | PACK03 workspace projection | RoleGrant + team scope |
| Match → Referee Workspace | PACK01 match API | PACK03 Referee projection | Exact match assignment relation required |
| Communication → Team Manager | PACK02 owns E39/A42/A43 | PACK03 Team Manager consumes | Community API cannot substitute Team Communication |
| Opportunity → Agent → Guardian/Club | PACK02 owns opportunity/action | PACK03 Agent consumes | A40/A44 consent/safety before detail/contact |
| Role Verification → Manager RoleGrant | PACK04/shared role service | PACK03 active role switch consumes | No self-grant; preference not authority |
| Community Report → Admin Moderation | Community report truth | PACK04 permission-scoped projection/action | Legacy write-owner gate for V2.0 mutation |
| Safeguarding → Communication / Scouting / Community | Shared E40/A44/A45 | all PACKs consume | Hard gate before content/contact/share |
| Earthus → Schedule / Training / Match | Shared E35/A36/A37 | PACK01 consumes, PACK03 projects | soft dependency only |

## No-cycle rule

Workspace projections must not become write owners. The dependency direction is:

```text
shared security/safety
      ↓
domain owner PACK (01/02/04)
      ↓
PACK03 workspace projection
```

PACK03 may call multiple owner queries but cannot merge unauthorized tenant data client-side.

## Event ownership

- Training/Match domain events: PACK01
- Career normalized events: PACK02, derived from PACK01 truth with provenance
- Communication messages: PACK02
- Role verification decisions: shared Role/Pack04
- Community moderation write: current Legacy owner until cutover gate
- Audit/outbox: shared platform service
