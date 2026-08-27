# Adapter Cache Policy

## Decision table

| Data class | Browser query cache | Shared/server cache | Stale fallback |
|---|---|---|---|
| Auth/session/current user | memory only; clear on auth event | none | never |
| Guardian/consent/private player | memory only, `staleTime=0`; clear on navigation/logout as defined | none | never |
| Team membership/role evidence | memory only, very short revalidation | none | never for authorization |
| Private schedule | private memory cache, max 15 seconds | none initially | never after 401/403 or role change |
| Public player/team summaries | up to 60 seconds | optional 60 seconds after privacy review | up to 5 minutes only with visible `STALE` label |
| Public news/video/leaderboard | endpoint-specific, max 60 seconds initially | optional | visible stale label only |
| Errors | no cache except public 404 up to 10 seconds | none | no |

## Invalidation

- Logout/auth-expired clears every private query.
- Identity/role/guardian/consent change event clears all scoped queries.
- Tenant/team switch clears resource-scope queries.
- Adapter mapping-version change invalidates all stored query data.

## Prohibitions

- Cache is never authorization evidence.
- No private response in CDN/public cache.
- No token in cache key, log, URL, or persistent browser storage.
- No service-worker caching of authenticated API bodies in slice 1.
- No stale private data after denial, revocation, or subject suspension.

