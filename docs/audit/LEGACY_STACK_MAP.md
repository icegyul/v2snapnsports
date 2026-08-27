# Legacy Stack Map

## Snapshot and evidence boundary

This map describes the V1 repository at HEAD `2cc39d25fa69a32e883cea63328964991f49c7bd`. No package installation, build, deployment, server access, or production DB access was performed.

## Runtime topology

```text
Browser or Capacitor shell
  -> React PWA at /app/
  -> Cafe24 PHP endpoints at /api/*.php
  -> MariaDB sn_* application data
  -> selected Rhymix-derived records
  -> server-only config and provider credentials

Independent /tactics/
  -> separate snapn-tactics product boundary

Shorts Factory /ss/
  -> separate sf_* subsystem and external media providers
```

## Frontend stack

| Layer | Observed stack | Evidence |
|---|---|---|
| Language | JavaScript and JSX | `snapn-app/src` |
| Framework | React `^18.3.1` | `package.json` |
| Routing | React Router DOM `^6.26.2` | `package.json`, `App.jsx` |
| Build | Vite `^5.4.10` | `package.json`, `vite.config.js` |
| PWA | `vite-plugin-pwa` `^0.20.5`, Workbox | `vite.config.js` |
| Native shell | Capacitor `^7.6.8` for Android/iOS | `package.json`, `capacitor.config.json` |
| Visualization | Recharts and Three.js | `package.json` |
| Utilities | jsQR, qrcode, pdf.js, lucide-react | `package.json` |
| Package manager | npm with lockfile v3 | `package-lock.json` |

Confirmed scripts are `dev`, `build`, `preview`, and feature-local Node test scripts for Stadium and tactics. There is no repository-wide lint/typecheck/application-test script in the main package.

## Backend stack

| Layer | Observed stack | Evidence state |
|---|---|---|
| Runtime | PHP action endpoints | `REPOSITORY_CONFIRMED` |
| Data access | mysqli helpers and direct SQL | `REPOSITORY_CONFIRMED` |
| Authentication | custom JWT helper in server-only config | helper calls confirmed; implementation details unverified |
| Data store | MariaDB references; prior document reports 10.6.17 | repository references confirmed; live version unverified |
| Legacy CMS coupling | selected Rhymix-style identity/content tables and sequence | `CODE_REFERENCE_ONLY` |
| API shape | one PHP file per endpoint/action, no versioned router | `REPOSITORY_CONFIRMED` |

Request-time DDL is widespread: 58 API files contain 126 DDL term matches in the current snapshot. This prevents treating the migration directory as a complete reproducible schema.

## Environment and secrets structure

- Frontend reads only the confirmed `VITE_API_BASE` variable and otherwise defaults to `https://snapnsports.com/api`.
- API DB configuration uses ignored server-only files, with tracked sample shapes for host/user/password/database/port.
- JWT, OAuth, mail, AI, K League/API-Football, YouTube, and cron settings are referenced through PHP constants/configuration.
- Shorts Factory has a separate ignored `ss/config.php` and a tracked sample.
- Actual `config.php`, `secrets.php`, `db_config.php`, and `ss/config.php` are ignored and were not copied or inspected for values.

The tracked samples contain secret-shaped placeholder material. V2 must copy names only after review, never literal values.

## Deployment structure

### Web/PWA

- Vite builds to `snapn-app/dist` with base `/app/`.
- `deploy_app.sh` uses verified host keys, a remote deployment lock, persistent local rollback backups, hashed assets first, staged HTML/SW byte verification, `index.html` atomic switch, and `sw.js` last.
- `verify_app_http.mjs` compares every deployed file by byte length and SHA-256 over HTTPS.
- `.htaccess` rewrites deep links to `/app/index.html`, gives hashed assets long immutable caching, and forces HTML/SW/manifest revalidation.

Capacitor uses `server.url=https://snapnsports.com/app/`. A web release can affect installed apps immediately through the live PWA; native permissions, icons, and shell changes still need separate store binaries.

### PHP/API

- `deploy_api.sh` accepts only direct PHP children of the API staging directory.
- It blocks config, secret, DB config, and sample files.
- It obtains a remote lock, verifies atomic rename support, captures each current file, round-trips temporary uploads, switches files, runs HTTP smoke, and rolls back the full requested set after failure.
- API rollback restores files only. It cannot reverse schema or data changes.

### Independent TACTICS

`deploy_tactics.sh` has its own path, lock, backup, verification, and rollback boundary. It must remain separate from the main V2 app unless an explicit integration contract is approved.

## V1 versus V2 foundation decision

| Decision | Result |
|---|---|
| Copy the V1 app wholesale | Rejected |
| Replace React/Vite immediately | Rejected; no evidence supports a framework change |
| Pin a V2 backend framework now | Rejected; Cafe24/runtime and migration constraints are unresolved |
| Keep requested monorepo directories | Accepted as a neutral boundary only |
| Begin with compatibility contracts/adapters | Recommended after audit blockers close |
| Keep web and mobile concerns separate | Accepted; mobile native behavior is not identical to web delivery |

The safest next architecture is contract-first selective migration: preserve the current IDs and API meanings behind adapters, build a new Graphite Stadium shell, keep V1 as write owner, and move domain ownership only through shadow read/write and dual verification. No package manifest is created in this phase because choosing a workspace tool or server framework would exceed the evidence.
