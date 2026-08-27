# Legacy External API Map

## Evidence rule

Provider names, domains, and configuration names below are repository references. Credentials were not read or copied, and no provider request was made. Availability, quota, billing, rights, OAuth approval, and production dependency are `PRODUCTION_UNVERIFIED` unless stated otherwise.

## Main app providers

| Provider/integration | Repository location | Configuration names observed | Purpose | V2 disposition |
|---|---|---|---|---|
| SnapN Cafe24 API | frontend `snapnApi.js` | `VITE_API_BASE` | primary app API | compatibility adapter candidate |
| Kakao OAuth/API | `social_kakao.php`, `kakao_lib.php` | Kakao client ID/secret, JWT/cron references | login/link and optional notifications | adapter after callback/security validation |
| Naver OAuth/API | `social_naver.php` | Naver client ID/secret | login/link | adapter after callback/security validation |
| K League site | `kleague.php` | no confirmed public key name in audited file | K League data/content reference | rights, source stability, and terms review required |
| API-Football | `euro.php` | `SN_APIFOOTBALL_KEY` | European football data | optional; contract/cost/rights verification required |
| YouTube | `youtube.php` | `SN_YT_CHANNEL`, `SN_YT_HANDLE` | public video cards/thumbnails | UI adapter candidate; rights and availability required |
| Google Gemini | `roster_ocr.php`, AI helpers | `SN_GEMINI_KEY`, `SN_GEMINI_MODEL` | roster OCR and AI paths | hard disabled where it constitutes SPORTS_AI/CAMERA_AI |
| OpenAI/Anthropic/Gemini selector | `ai_lib.php` | `SN_AI_PROVIDER`, `SN_AI_API_KEY`, `SN_AI_MODEL` | assistant/course/tactics prototypes | `SPORTS_AI` hard disabled |
| Mail servers | `mail.php`, cron mail path | encrypted account/server configuration | POP3/SMTP operational mail | separate admin integration review |

## Separate Shorts Factory providers

The `ss/` subsystem references fal.ai, Kling, Anthropic, Google Drive/YouTube OAuth, Naver, Meta/Instagram/Facebook, and publishing/generation endpoints. These are outside the main V2 migration boundary. Their configuration and data remain separate.

## Production-dependency classification

| Class | Current conclusion |
|---|---|
| Required for basic login/core records | Cafe24 API and server DB configuration |
| Required for social login users | provider-specific Kakao/Naver configuration and verified identity links |
| Optional content enrichment | K League, API-Football, YouTube |
| Optional/prototype AI | Gemini/OpenAI/Anthropic paths; disabled in V2 |
| Separate operations product | Shorts Factory providers |

The current number of users dependent on each OAuth provider, current token validity, provider review status, billing plan, and outage behavior were not measured.

## Secret and environment handling

- Server-only `api/config.php`, `api/secrets.php`, `api/db_config.php`, and `ss/config.php` are ignored.
- Tracked sample files document configuration shape but must never be copied as live values.
- V2 `.env.example` includes only the confirmed client variable in this phase.
- New V2 credentials must be created or securely provisioned; no credential is migrated through Git, chat, documentation, logs, or scaffold files.

## Required provider characterization

For every retained provider, record:

1. exact endpoint and version;
2. request/response schema and error behavior;
3. authentication method and rotation owner;
4. callback/redirect allowlist;
5. scopes, user consent, and account-link identity key;
6. rate limits, quota, price, and outage fallback;
7. data residency, retention, and subprocessor terms;
8. media/data rights and display/attribution requirements;
9. production usage evidence and a provider-disable path;
10. sanitized contract fixtures.

## Hard-disabled rule

No environment variable, menu, placeholder metric, sample analysis, or provider call may activate `EPTS`, `CAMERA_AI`, or `SPORTS_AI` in V2 production. Adapter interfaces may be designed later, but calls remain disabled until separately authorized and verified.
