# SNAPN SPORTS V2 FRONTEND SCAFFOLD RULES v1.6

## Non-negotiable
- READ-ONLY audit determines the real framework, router, state library, query client, 3D runtime and build system.
- The reference scaffold is logical, not permission to rewrite the repository.
- Page/route components do not call storage or raw HTTP directly; they use feature/application adapters.
- Client-side hiding is not security. Server capabilities and scopes remain authoritative.
- EPTS / Camera AI / Sports AI hard-disabled features are not rendered, not teased with sample metrics, and not reachable through hidden routes.
- Community V2.0 preserves legacy behavior until parity/cutover gate is cleared.
- 3D scene objects emit semantic actions into the navigation bridge; they never mutate business state directly.
- Every remote feature supports LOADING / EMPTY / ERROR / OFFLINE / FORBIDDEN / STALE where applicable.

## Logical layers
1. App bootstrap/session restore
2. Router + role projection
3. App shells/navigation
4. Feature view-model/application layer
5. API/query/cache adapters
6. Reusable components/design tokens
7. 3D runtime + asset loader + semantic bridge
8. Offline/sync/media upload
9. Analytics/accessibility/testing

## Forbidden shortcuts
- Hard-coded role menus without GET /v2/me capability projection.
- Client-generated player ratings, EPTS numbers, AI confidence or health flags.
- Community redesign that silently changes legacy ordering/visibility/reporting.
- 3D-only route with no functional 2D/Static equivalent for a core task.
- Direct object-storage URLs persisted in UI state.
- Swallowing 403/409 as generic success.
