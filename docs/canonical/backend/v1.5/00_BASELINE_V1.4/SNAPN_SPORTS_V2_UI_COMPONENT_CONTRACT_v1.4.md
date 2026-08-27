# SNAPN SPORTS V2 UI COMPONENT CONTRACT v1.4

## Locks
- Server decides authorization and capability.
- Every remote component: loading/empty/error/offline/forbidden.
- 3D always has 2D/Static equivalent for core tasks.
- EPTS/Camera/AI hard-disabled components are not rendered.
- Player bottom nav is HOME / TRAINING / COMMUNITY / VIDEO / MORE.

## Core components
- AppShell
- PlayerBottomNav
- ManagerRoleSwitcher (verified grants only)
- StadiumEntryScene / PitchViewport / MyPlayerMarker / TeamFormationLayer / ScoreboardStateCard
- StadiumBuilderStepper
- PlanEditor2D / TacticalBoard2D / TrainingSessionPanel / MatchCenter
- CommunityFeed / CommunityComposer / TeamCommunicationInbox
- CareerPassportTimeline / PortfolioShareSheet / OpportunityCard

## Required state contract
LOADING, EMPTY, ERROR, OFFLINE, FORBIDDEN, STALE.
