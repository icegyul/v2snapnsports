# Auth Migration Compatibility Plan

## Decision

V1 remains the authentication and identity write owner during the first read-only slice. V2 does not copy JWT keys, passwords, social tokens, or live config.

## Sequence

1. Freeze sanitized V1 login/me/error fixtures and old-client header behavior.
2. First V2 adapter forwards the caller's existing auth proof only to approved V1 GET endpoints; it never logs or persists the token.
3. Adapter maps V1 identity to canonical IDs and strips unapproved fields.
4. Sensitive reads remain disabled until current-role and object-scope deny tests pass in staging.
5. Introduce a versioned V2 session contract behind a feature flag after key/session design approval.
6. Run old PWA, installed Capacitor shell, and new V2 client overlap tests.
7. Move authentication ownership only after revocation, OAuth, recovery, denied-user, audit, and rollback tests pass.

## Compatibility requirements

- Preserve current `{success,data}`/error meanings at the adapter boundary.
- Preserve constrained login return intents.
- Accept current Bearer and compatibility header only at the V1 boundary; V2 publishes one canonical session transport.
- Never trust role claims carried in the legacy JWT for final V2 authorization.
- On V1 unavailable/malformed response, fail closed; never create a synthetic identity.

## Rollback

Disable V2 auth/read routing and return users to the unchanged V1 login/application. There is no V2 identity write or credential migration in this phase.

