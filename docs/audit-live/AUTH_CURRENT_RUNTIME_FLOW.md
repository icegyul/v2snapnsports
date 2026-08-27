# Authentication Current Runtime Flow

## Current flow

```text
Password/OAuth login
  -> V1 PHP authenticates legacy member
  -> server creates JWT through ignored config helper
  -> browser stores token in localStorage key snapn.token
  -> client sends Authorization: Bearer and X-Auth-Token
  -> endpoint calls sn_require_auth / optional sn_jwt_verify
  -> endpoint-specific group, admin, team, guardian, or object check
  -> response
```

## Confirmed behavior

- Password login rejects `sn_members.denied='Y'` before issuing a token.
- Registration uses bcrypt and creates a JWT after member/consent writes.
- `auth.php?action=me` reads the member by ID but does not itself select `denied`.
- The exact `sn_require_auth`/JWT implementation lives in absent `config.php`.
- Client localStorage and both auth headers are repository-confirmed.
- Public Community uses optional token parsing for like state.
- Team authority is primarily `sn_club_members.role`; account type/title is declared non-authoritative in newer helpers.

## Unknown runtime properties

- Algorithm allowlist, signing key source, issuer, audience, lifetime, clock skew, and rotation.
- Token/session revocation and device/session inventory.
- Whether every authenticated request rechecks denied/suspended member state.
- Rate limits, brute-force controls, login audit, and CORS/header behavior.
- OAuth callback allowlists and current provider configuration.

## Limited live evidence

- Public Community rendered in an existing signed-in browser, which proves UI availability only.
- Unauthenticated match-plan and guardian requests returned 401.
- No authenticated allow/deny matrix was executed against production.

**Runtime verdict: `FAIL/UNKNOWN`; authentication exists, but its security contract is not frozen by operational evidence.**

