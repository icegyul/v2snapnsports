# 06. SHARED SERVICE OWNERSHIP — KO

## 1. Rule

Common security/operations capabilities are single-owner shared canonical services. PACK-specific modules must call them; they must not reimplement them.

| Service | Canonical owner | Consumer PACKs | Code owner | Engine/Algorithm |
| --- | --- | --- | --- | --- |
| Authorization | SHARED/SECURITY | PACK01, PACK02, PACK03, PACK04 | backend/src/modules/role + authorization policy layer | E03 / A03 |
| RoleGrant | SHARED/ROLE | PACK01, PACK02, PACK03, PACK04 | backend/src/modules/role | E02,E03,E26 / A02,A27 |
| Guardian/Consent | SHARED/GUARDIAN | PACK01, PACK02, PACK03, PACK04 | backend/src/modules/guardian | E04 / A04,A31 |
| Safeguarding | SHARED/SAFETY | PACK01, PACK02, PACK03, PACK04 | backend/src/modules/safeguarding (target); policy before domain service | E40 / A44,A45 |
| Audit | SHARED/OPS | PACK01, PACK02, PACK03, PACK04 | backend/src/modules/admin/audit adapter + core.audit_events | E25 |
| Feature Flags | SHARED/RELEASE | all | feature service + platform.feature_flags/rules | E07 / A22 |
| Notifications | SHARED/NOTIFICATION | PACK01, PACK02, PACK03 | backend/src/modules/notification | E19 / A20 |
| Permission-aware Search | SHARED/SEARCH | PACK02, PACK03 | backend/src/modules/search | E32 / A33 |
| Media Permission | SHARED/MEDIA | PACK01, PACK02, PACK03, PACK04 | backend/src/modules/media | E17 / A21 |
| Earthus Context | SHARED/EARTHUS | PACK01, PACK03, PACK04 | apps/web/src/adapters/EarthusContextAdapter.ts + backend earthus adapter | E35 / A36,A37 |
| Offline | SHARED/OFFLINE | PACK01, PACK03 | offline journal/sync adapter | E29 / A30 |
| Outbox | SHARED/OPS | all mutation domains | platform.outbox_events adapter | E25,E29 |

## 2. Required call order for sensitive operations

```text
authenticate
→ resolve active role_grant_id
→ tenant/org/team/resource scope
→ blocked relationship / safeguarding
→ guardian/consent
→ feature hard gate
→ domain state/version/idempotency
→ mutation
→ audit + outbox
```

No PACK may place a domain mutation before the shared permission/safety chain.

## 3. Service-specific invariants

- **Authorization**: client role names are display state only. Server RoleGrant is authoritative.
- **RoleGrant**: self-grant and RolePreference escalation are denied.
- **Guardian/Consent**: revocation blocks new access before asynchronous cleanup.
- **Safeguarding**: minor direct contact restrictions apply to Coach/Agent/Referee/Admin alike.
- **Audit**: every Admin mutation records actor, scope, action, resource, decision, correlation/idempotency key.
- **Notifications**: delivery failure does not roll back core domain mutation.
- **Media Permission**: metadata/url generation occurs only after field/asset permission.
- **Earthus**: dependency errors degrade to stale/unavailable context; core workflow succeeds.
- **Offline/Outbox**: never delete unacknowledged local events; server reauthorizes replay.
