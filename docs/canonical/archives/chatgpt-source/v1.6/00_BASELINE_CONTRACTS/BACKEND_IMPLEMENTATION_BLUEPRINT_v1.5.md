# SNAPN SPORTS V2 BACKEND IMPLEMENTATION BLUEPRINT v1.5

**Backend Lock | 2026-08-27**

## Purpose
Translate the v1.4 physical contracts into a stack-agnostic implementation architecture: module boundaries, request pipeline, transactions, outbox/events, workers, cache, errors, observability, privacy, legacy community, Earthus soft dependency, and hard-disabled future integrations.

## Hard rules
- Bind to the actual repository only after READ-ONLY audit.
- Do not select/replace framework, auth provider, ORM, queue, storage, or legacy schema by assumption.
- Role preference is never authority; verified RoleGrant + server-side scope policy controls access.
- Community keeps Legacy write ownership until parity cutover.
- Earthus is a soft dependency.
- EPTS / Camera AI / Sports AI are HARD_DISABLED until release approval.
- Controller -> Application -> Domain -> Port -> Adapter dependency direction.
- Reliable domain events use the transactional outbox pattern.
- Sensitive mutations create immutable audit evidence.

## Delivery
The detailed canonical content is in `SNAPN_SPORTS_V2_BACKEND_IMPLEMENTATION_BLUEPRINT_v1.5.docx`. Supporting machine-readable registries are included in this package.
