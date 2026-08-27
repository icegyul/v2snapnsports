# SNAPN SPORTS V2 BACKEND SCAFFOLD RULES v1.5

## Binding rule
This is a responsibility map, not a forced framework. READ-ONLY audit binds these concepts to the current repository.

## Required dependency direction
`HTTP -> Application -> Domain -> Port -> Adapter`

- Controllers never query DB directly.
- Domain does not import HTTP/ORM/vendor SDK.
- Authorization and safeguarding are server policies, not UI conditions.
- Mutations requiring reliable events write the outbox in the same transaction.
- Community keeps Legacy write ownership until parity cutover approval.
- Earthus is a soft dependency.
- EPTS / Camera AI / Sports AI remain HARD_DISABLED.

## Reference directories
See `reference_scaffold/`. Each directory contains a `.keep` or README only. Do not generate framework boilerplate until audit identifies the current stack.
