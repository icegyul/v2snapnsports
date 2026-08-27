# V2 Deployment Target

## Recommended transitional topology

```text
https://snapnsports.com/v2/              static V2 read-only web shell
https://snapnsports.com/api/v1/...       V2 PHP read adapter
                         |
                         +-> approved V1 HTTPS GET endpoints

https://snapnsports.com/app/             unchanged V1 PWA/write owner
https://snapnsports.com/api/*.php         unchanged V1 API/write owner
```

The same Cafe24 account is the recommended **transitional** physical target because guarded SFTP and current domain routing already exist. This is conditional on verifying PHP version/extensions, web-root layout, TLS/security headers, disk/quota, log path, and the ability to isolate `/v2/` service-worker scope.

## Required release properties

- Separate `/v2/` deployment lock and persistent artifact backup.
- Hashed assets first, atomic V2 `index.html`, V2 service worker last.
- Exact manifest/byte/hash verification over HTTPS.
- Adapter files selected explicitly and atomically replaced with full-set rollback.
- No V1 file modification or bulk sync.
- No config/secrets in the web deployment set.
- Read-only route allowlist and a release kill switch.
- Old V1 PWA, current Capacitor shell, and `/v2/` overlap tests.
- Security headers and cache headers verified from live responses.

## Physical blockers

- Exact production PHP/runtime/extensions and server limits are unknown.
- V2 SFTP path, locks, and rollback scripts do not exist.
- Current sampled responses lack required security headers.
- Log/monitoring destination and alert owner are unknown.
- No approved V2 secret/config provisioning path is recorded.

**Deployment verdict: `FAIL` until these physical facts are verified. No deployment is authorized.**

