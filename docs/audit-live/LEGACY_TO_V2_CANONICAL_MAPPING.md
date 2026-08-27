# Legacy to V2 Canonical Mapping

## Common envelope

Every DTO includes:

```text
sourceSystem = LEGACY_V1
sourceId = exact legacy identifier
mappingVersion = snapn-v2-read-v1
capturedAt = adapter response time
sourceUpdatedAt = legacy timestamp or null
missingFields = explicit list
```

## CanonicalUser

| Canonical field | Legacy field | Rule |
|---|---|---|
| `memberId` | `member_srl` | Preserve numeric ID; never derive from player ID |
| `loginName` | `user_id` | Private/authenticated only |
| `displayName` | `nick_name` | Decode display entities; do not use as identity |
| `email` | `email`/`email_address` | Exclude from first UI unless a specific approved purpose requires it |
| `accountState` | member current state | `UNKNOWN` if denied/suspended state is not returned by a trusted current check |
| `legacyGroups` | `groups` | Evidence only; not final V2 grants |

## CanonicalPlayer

| Canonical field | Legacy field | Rule |
|---|---|---|
| `playerId` | `player_id` | Preserve |
| `memberId` | authenticated relationship | Include only from protected contract; public API omits it |
| `teamId` | `team_id` | Preserve; null/unknown stays explicit |
| `displayName` | `name` | Display value |
| `position` | `position` | Preserve known code; unknown null |
| `jerseyNumber` | `back_no` | Integer or null |
| `birthYear`, `gender` | same | Sensitive; exclude from public/read-model default |
| `seasonStats` | match/stat fields | Attach season/source provenance; never imply live completeness |

## CanonicalTeamMembership

| Canonical field | Legacy source | Rule |
|---|---|---|
| `teamId`, `teamName` | team/mine response | Preserve |
| `legacyRole` | `sn_club_members.role` | Exact `owner/coach/manager/player/guardian` value |
| `roleGrant` | none | `null`; do not translate to V2 authority until canonical grant exists |
| `teamType`, `region`, `logoUrl` | optional profile fields | Null with missingness if absent |
| `membershipState` | presence in current response | `OBSERVED_ACTIVE`; validity dates unknown |

## CanonicalGuardianLink

| Canonical field | Legacy field | Rule |
|---|---|---|
| `linkId` | `link_id` | Preserve |
| `guardianMemberId` | authenticated subject / protected row | Preserve only in protected context |
| `playerId` | `player_id` | Preserve |
| `legacyStatus` | `status` | Exact pending/approved/rejected-style value |
| `relationshipType` | none | `UNKNOWN`; never infer Primary/Co/Emergency |
| `authorityScopes` | none | Empty; V2 contract must supply later |
| `consentRecordId` | none/current coarse consent | null until typed mapping is reviewed |

## CanonicalScheduleItem

| Canonical field | Match source | Training source | Rule |
|---|---|---|---|
| `scheduleId` | `match_id` | `session_id` | Prefix `match:`/`training:` to prevent collisions |
| `kind` | `MATCH` | `TRAINING` | Fixed enum |
| `teamIds` | home/away IDs | team ID | Preserve exact IDs |
| `startsAt` | match date/time | session date/start time | Include timezone confidence; no invented timezone conversion |
| `title` | team labels/competition | title/type | Display only |
| `venue` | venue if returned | null unless returned | Unknown remains null |
| `status` | legacy match status/result | legacy session state | Map only documented values; otherwise `UNKNOWN` |
| `accessScope` | V1 endpoint decision | V1 endpoint decision | Never broaden |

## Null/missing rule

Zero, empty string, null, absent, and `UNKNOWN` are not interchangeable. Mapping tests must preserve the source distinction or record the normalization explicitly.

