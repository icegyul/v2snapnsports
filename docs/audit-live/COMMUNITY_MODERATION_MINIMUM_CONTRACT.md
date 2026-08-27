# Community Moderation Minimum Contract

## Mandatory entities

- `ContentState`: `VISIBLE`, `AUTHOR_WITHDRAWN`, `MODERATOR_HIDDEN`, `QUARANTINED`, `DELETED_TOMBSTONE`.
- `Report`: reporter, target, reason code, optional safe note, state, created/resolved timestamps.
- `ModerationAction`: actor grant, target, action, reason, policy version, audit request ID.
- `UserSafetyRelation`: `BLOCK` or `MUTE`, subject/object, scope, validity/revocation.
- `Audience`: `PUBLIC` for migrated V1 records; new values require separate approval.

## Minimum permissions

| Action | Allowed subject |
|---|---|
| Withdraw own post/comment | Current author, subject to retention/tombstone policy |
| Report content/user | Authenticated active member; rate limited |
| Hide/quarantine/restore | Active moderator grant in tenant/global scope |
| View report queue | Moderator/admin only |
| Block private interaction | Authenticated subject; immediate enforcement |
| Mute feed content | Authenticated subject; local effect |
| Hard delete | Exceptional policy workflow with audit/legal-retention check |

## Safeguarding

- Minor-private-contact reports receive a separate high-priority reason code.
- Agents/scouts/referees cannot start private contact with unrelated minors through a generic Community grant.
- Moderator access is tenant-scoped; system admin cross-tenant access needs explicit incident/support purpose and audit.
- Hidden content is excluded from normal feed/detail/search/media delivery, but preserved according to approved evidence/retention rules.

## Compatibility

Migrated V1 posts begin as `VISIBLE`, `PUBLIC`, and `sourceSystem=LEGACY_V1`. Missing historical moderation data remains `UNKNOWN`; it is not inferred as “clean.”

