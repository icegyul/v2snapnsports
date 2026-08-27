# Legacy Authentication Map

## Current authentication paths

| Flow | Repository evidence | State |
|---|---|---|
| Password login | `auth.php?action=login` | code confirmed, live behavior unverified |
| Token identity | `auth.php?action=me` | code confirmed, live behavior unverified |
| Registration | `register.php` | code confirmed |
| Profile/password change | `profile.php` | code confirmed |
| Password recovery | `find_password.php` and reset record references | code confirmed |
| Kakao OAuth | `social_kakao.php` and `social_lib.php` | code confirmed, provider config/live callback unverified |
| Naver OAuth | `social_naver.php` and `social_lib.php` | code confirmed, provider config/live callback unverified |
| Social linking | `social_link.php` | code confirmed |

## Password and account handling

- Login searches `sn_members` by user ID or email.
- Denied accounts are rejected during password login.
- Password verification uses a server helper; registration writes bcrypt hashes with PHP `PASSWORD_BCRYPT`.
- Registration assigns the default permission group when available.
- Required agreements and birth-date validation are stored during registration.
- Under-14 accounts are represented as locked until guardian consent; ages 14–18 use a pending guardian-link path without the same hard lock.

The exact legal wording, consent versioning, revocation behavior, and evidence retention need policy review; current records are not a complete typed V2 consent model.

## Token transport and storage

```text
Login or OAuth success
  -> server creates JWT
  -> client stores token in localStorage key snapn.token
  -> requests send Authorization: Bearer and X-Auth-Token
  -> 401 matching auth-expiry patterns clears token and redirects to login
```

No cookie-backed application session was found in the audited primary auth path. OAuth uses database-backed state records. V2 must not assume a cookie session exists.

## Confirmed client safety behavior

- Return intents are restricted to `join`, `checkin`, `addmember`, `jointrain`, and `consent` with a constrained payload format.
- Arbitrary post-login URLs are not accepted by the client helper.
- A current token is cleared only for recognized token/authentication 401 responses; credential errors on login do not clear an unrelated current token by this helper.
- JSON responses are expected in a `{success, data}` or error envelope.

## Unknown or server-only details

The ignored `api/config.php` owns helpers and secrets needed to prove:

- JWT algorithm and allowed algorithms;
- token lifetime, issuer, audience, clock skew, and key rotation;
- whether every protected request rechecks current member denial/revocation;
- CORS policy and accepted auth headers at the server boundary;
- rate limits, brute-force controls, login audit, and device/session revocation;
- social-provider production redirect configuration.

These remain `PRODUCTION_UNVERIFIED`.

## V2 migration requirements

1. Capture sanitized login, me, registration, reset, and OAuth callback contracts.
2. Prove denied/revoked members cannot continue with an older token.
3. Define a versioned V2 session contract before choosing cookie or token storage.
4. Preserve current invite/QR/consent return intents through a compatibility adapter.
5. Add explicit rate-limit, audit, rotation, logout/revocation, and old-client overlap requirements.
6. Run authenticated player, guardian, coach, manager, admin, revoked, and cross-tenant tests.
7. Do not copy JWT or OAuth secrets. Provision new V2 credentials through the approved secure store.

## Reuse classification

- `normalizeNextIntent`/return-intent semantics: candidate `REUSE_AS_IS` after isolated tests.
- Current response unwrapping and auth-expiry behavior: `REUSE_WITH_ADAPTER`.
- Current JWT implementation and localStorage choice: not approved for direct reuse; architecture/security decision required.
- Member IDs and verified social account links: `MIGRATE_DATA_ONLY` after backup, consent, integrity, and provider-identity verification.
- Login/signup UI: `REBUILD_NEW` under Graphite Stadium UI.
