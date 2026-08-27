# API to Frontend Binding Map

Source of API shape: `docs/canonical/api-db/v1.4/SNAPN_SPORTS_V2_OPENAPI_v1.4.yaml`. No endpoint is activated in F0.

| Canonical operation family | F0 client seam | Current data source | UI boundary | State |
|---|---|---|---|---|
| `/v2/me`, role preference, role verification | `api/contracts.ts` | fixture identity | app shell/role visibility | fixture only |
| `/v2/features` | `lib/featureFlags.ts` | hard-coded safe flags | route/menu visibility | local only |
| `/v2/stadium/*`, `/v2/formation/*` | `adapters/FixtureLegacyAdapter.ts` | synthetic stadium/formation | state machine/fallback | fixture only |
| `/v2/events`, `/v2/training`, `/v2/matches` | schedule adapter | synthetic schedule | home/training shell | fixture only |
| `/v2/community/*` | community boundary | no production/legacy call | unavailable/read contract | write blocked |
| `/v2/athletes/*/career` | career DTO | synthetic sourced events | My Player route seam | fixture only |
| `/v2/sync/*` | offline state seam | local state only | offline/retry banner | no mutation |
| `/v2/context/events/*` | EarthusContextAdapter | no-op/fixture | optional schedule context | soft failure |

All future requests must pass feature visibility, account state, verified role grant, tenant/team/subject scope, consent, and safeguarding checks before route data is considered usable.
