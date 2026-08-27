# V2 backend module foundation

Canonical direction is `HTTP -> Application -> Domain -> Port -> Adapter`. The F0 repository has no bound backend framework, database, queue, or production adapter.

`moduleRegistry.ts` is the only executable foundation in this phase. It records the required modules and the four canonical layers without creating empty controller, ORM, worker, or database boilerplate. Each module gains `domain/`, `application/`, `infrastructure/`, and `interface/` code only when a scoped implementation has a contract test and a verified runtime dependency.
