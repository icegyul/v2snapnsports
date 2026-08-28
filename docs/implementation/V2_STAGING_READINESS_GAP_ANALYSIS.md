# Staging readiness gaps

| Class | Blocker | Requirement |
| --- | --- | --- |
| IDENTITY | Real authenticated identity/operator grants | isolated staging identity and revoke tests |
| BACKEND | P1 interface-only handlers/repositories | deployed staging handlers with authorization |
| DATABASE/MIGRATION | No migration rehearsal | backup, restore, migration checksum and rollback evidence |
| SAFEGUARDING/PRIVACY | No real specialist case workflow | approved policy, redacted staging fixtures and QA |
| MEDIA/NOTIFICATION | Jobs/media/outbox deferred | scoped infra and idempotent staging evidence |
| QA | No authenticated staging/browser/device run | role, minor and responsive acceptance |
| INFRASTRUCTURE | No staging environment/deployment | secrets managed outside source and deployment approval |

SAFE FOR STAGING remains NO. Production cutover remains NO.
