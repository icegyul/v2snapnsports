# JWT Security Gap Report

## Verdict

**Status: `FAIL / UNKNOWN`**

| Area | Evidence | Gap |
|---|---|---|
| Token creation/verify | helper calls exist | implementation absent from repo |
| Storage | localStorage `snapn.token` | exposed to successful script execution/XSS |
| Transport | Bearer plus `X-Auth-Token` | duplicate header surface; server/CORS policy unknown |
| Denied user | login checks `denied` | stale-token recheck unknown; `me` query omits denied |
| Rotation | none observed | key/session rotation unknown |
| Expiry/issuer/audience | none available | validation contract unknown |
| Logout | client removes token | no proven server revocation |
| OAuth | state records referenced | callback/scopes/link integrity live state unknown |
| Browser hardening | sampled app response lacked CSP and other common security headers | stored HTML plus localStorage token raises severity |

## Required controls before V2 auth ownership

- Explicit algorithm allowlist and key IDs; rotation and overlap procedure.
- Short-lived access session plus server-side revocation/session version.
- Issuer, audience, expiry, not-before, and clock-skew validation.
- Active/suspended subject recheck.
- Secure cookie design review for web, or a documented alternative for Capacitor; no blind localStorage copy.
- CSRF protections if cookies are adopted.
- CSP, sanitization, dependency review, and security headers.
- Login/OAuth rate limits, audit, callback allowlists, and account-link collision tests.

No token value or secret was read or copied during this audit.

