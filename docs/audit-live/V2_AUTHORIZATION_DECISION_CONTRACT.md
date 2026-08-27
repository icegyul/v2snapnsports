# V2 Authorization Decision Contract

## Canonical sequence

```text
Request
 -> Authenticate session
 -> Resolve current identity state
 -> Resolve active RoleGrant from authority store
 -> Resolve organization tenant
 -> Resolve team/athlete/resource scope
 -> Resolve GuardianRelationship and Consent when relevant
 -> Apply safeguarding policy
 -> Authorize or deny by default
 -> Write sanitized audit event
```

## Inputs

- subject ID and current active/suspended state;
- session ID/version, authentication time, and assurance level;
- active role grants with scope, validity, issuer, and revocation;
- organization/team/athlete/resource identifiers;
- guardian relationship type and status;
- consent type, version, scope, evidence, validity, and revocation;
- action, data classification, purpose, and client channel.

## Output

```json
{
  "decision": "ALLOW|DENY",
  "reasonCode": "STABLE_MACHINE_CODE",
  "policyVersion": "string",
  "scope": {"organizationId": null, "teamId": null, "athleteId": null},
  "auditRequired": true
}
```

The public response exposes only a safe reason class. Detailed policy facts stay in protected logs.

## Hard rules

1. Default deny.
2. UI visibility, token role claims, title, account type, and cached view mode never grant access.
3. Roles are re-resolved from the current authority source for sensitive requests.
4. No self-grant, cross-tenant admin bypass, or implicit guardian type.
5. Suspended identities and revoked/expired grants deny immediately.
6. Minor contact/export/share requires explicit safeguarding and consent checks.
7. Every sensitive allow and policy denial has a request ID and audit event without token or unnecessary PII.

## Initial implementation boundary

The first adapter slice may reuse V1's existing authenticated GET behavior, but it must normalize results and cannot declare the V2 policy engine implemented. Sensitive endpoints stay unavailable until the negative matrix passes in staging.

