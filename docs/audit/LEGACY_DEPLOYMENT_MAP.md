# Legacy Deployment Map

## Audit status

No build, upload, SFTP connection, HTTP deployment verification, invalidation, native release, or production smoke was executed. This is a code-level map only.

## Web/PWA build and delivery

| Step | Current mechanism |
|---|---|
| Authoring source | `snapn-handoff/snapn-app` |
| Package manager | npm with `package-lock.json` |
| Build | `npm run build` -> Vite `dist/` |
| Public base | `/app/` |
| PWA | Vite PWA/Workbox, auto-update registration |
| Deep-link server behavior | `.htaccess` fallback to `/app/index.html` |
| Static cache | hashed JS/CSS/font/image assets long-lived/immutable |
| Revalidation | `index.html`, `sw.js`, manifest use no-cache |
| Deployment | `snapn-handoff/deploy_app.sh` over guarded SFTP |

The deployment script verifies a known host key, remote lock, local build shape, current remote entry/SW backup, upload round trips, staged delivery, and byte equality. It uploads assets first, atomically switches `index.html`, and switches `sw.js` last. Failure paths preserve or restore the prior entry set.

`verify_app_http.mjs` walks the local distribution and compares public HTTPS files by byte length and SHA-256. Passing this proves file delivery only, not authenticated behavior, API authorization, DB persistence, or business correctness.

## Installed app delivery boundary

`capacitor.config.json` points the shell to `https://snapnsports.com/app/`. Therefore:

- PWA deployment can change installed-app web content without a store binary.
- Native plugins, permissions, icons, splash assets, and shell code still require separate Android/iOS builds and store release evidence.
- V2 must plan service-worker overlap and old-client compatibility during API changes.

## PHP/API delivery

| Step | Current mechanism |
|---|---|
| Staging source | direct children of `snapn-handoff/cafe24-deploy/api` |
| Selection | caller lists exact PHP files; no bulk directory sync |
| Secret protection | config, secrets, DB config, and sample names are blocked |
| Concurrency | remote `.deploy-lock` with `owner.txt` |
| Backup | current remote files copied to a restricted persistent local backup |
| Upload | temporary remote names plus round-trip byte comparison |
| Switch | same-directory rename |
| Verification | remote byte comparison and HTTP smoke |
| Failure | requested file set rolled back and reverified |

The accepted HTTP smoke status set includes expected protected/validation statuses as well as success. It also rejects PHP fatal/parse signatures. This is not an authenticated endpoint contract test.

API rollback is file-only. Any runtime DDL, migration, or data write caused by an endpoint cannot be reversed by `deploy_api.sh`.

## DB migration delivery

- 29 migration SQL files exist locally.
- No current production ledger/checksum evidence exists.
- No complete base schema or full rollback SQL set exists.
- Request-time DDL appears in 58 API files.
- Repository runbooks require inventory, backup, isolated restore, additive expand, evidence-backed backfill, shadow/dual verification, and code-first rollback.

No DB migration is authorized by this foundation.

## Independent TACTICS delivery

`snapn-tactics` and `deploy_tactics.sh` have a separate `/tactics/` deployment, lock, backup, byte verification, and rollback path. V2 must consume TACTICS only through a separately approved contract and verified identity exchange; its code, DB, and deployment are not merged into the main app scaffold.

## Cafe24 and server-only dependencies

- SFTP account and verified host key.
- Apache rewrite/header behavior.
- PHP runtime and extensions including mysqli; optional mail/media integrations have additional runtime needs.
- Server-only API configuration and credentials.
- MariaDB and legacy Rhymix-derived data.
- Web-root `/files/` directories for main-app media.

Exact PHP/MariaDB versions, disk layout, limits, cron definitions, TLS policy, backup schedule, and current hashes are `PRODUCTION_UNVERIFIED`.

## V2 deployment requirements before implementation

1. Decide whether V2 remains on Cafe24 for web/API or uses a separately approved runtime.
2. Preserve `/app/` and current API behavior through explicit compatibility routing.
3. Separate web, native, API, DB, media, and TACTICS release units.
4. Add manifest, provenance, immutable artifact hashes, and environment labels.
5. Test old/new PWA and service-worker overlap.
6. Prove staged/atomic rollback for the selected platform.
7. Pair every DB change with backup, restore rehearsal, ledger, verify, and rollback evidence.
8. Define production smoke versus authenticated end-to-end acceptance.
