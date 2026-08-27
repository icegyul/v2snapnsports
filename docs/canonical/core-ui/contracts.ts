export type EntityId = string;
export type ISODateTime = string;
export type Cursor = string;

export type RolePreference = "PLAYER" | "MANAGER";

export type AccountKind = "PLAYER" | "MANAGER" | "GUARDIAN";

export type ManagerRole =
  | "COACH"
  | "TEAM_MANAGER"
  | "CLUB_DIRECTOR"
  | "REFEREE"
  | "AGENT"
  | "ANALYST";

export type VerificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REVOKED"
  | "EXPIRED";

export type DataFreshness = "FRESH" | "STALE" | "UNKNOWN";

export type DataAvailability =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "NOT_COMPUTED"
  | "INSUFFICIENT_DATA";

export type EvidenceGrade =
  | "SPEC_READY"
  | "CODE_EXISTS"
  | "PACKAGE_VERIFIED"
  | "UI_VERIFIED"
  | "AUTH_VERIFIED"
  | "LIVE_VERIFIED";

export type VisualMode = "FULL" | "FAST" | "LIGHT" | "STATIC";

export type CoreScreenId =
  | "SIGNUP_ROLE_SELECT"
  | "STADIUM_EXTERIOR"
  | "PITCH_ENTRY"
  | "MY_POSITION"
  | "SPATIAL_HOME"
  | "COMMUNITY";

export type UiResourceStateKind =
  | "IDLE"
  | "LOADING"
  | "READY"
  | "EMPTY"
  | "ERROR"
  | "OFFLINE"
  | "FORBIDDEN"
  | "STALE";

export interface DataEnvelope<T> {
  readonly data: T;
  readonly asOf: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly staleAt: ISODateTime;
  readonly freshness: DataFreshness;
  readonly source: string;
}

export interface PageInfo {
  readonly nextCursor: Cursor | null;
  readonly hasNextPage: boolean;
}

export interface CursorPage<T> {
  readonly items: readonly T[];
  readonly pageInfo: PageInfo;
  readonly asOf: ISODateTime;
}

export interface RolePreferenceSubmission {
  readonly preference: RolePreference;
  readonly submittedAt: ISODateTime;
}

export interface GuardianInviteContext {
  readonly inviteId: EntityId;
  readonly playerDisplayName: string;
  readonly expiresAt: ISODateTime;
  readonly status: "VALID" | "EXPIRED" | "REVOKED" | "ACCEPTED";
}

export interface SafeImageAsset {
  readonly id: EntityId;
  readonly url: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly mimeType: "image/jpeg" | "image/png" | "image/webp";
}

export interface ExternalSourceAttribution {
  readonly publisherName: string;
  readonly canonicalUrl: string;
  readonly publishedAt: ISODateTime;
  readonly fetchedAt: ISODateTime;
}

export interface TeamSummary {
  readonly id: EntityId;
  readonly displayName: string;
  readonly ageGroupLabel: string | null;
  readonly seasonLabel: string | null;
}

export interface PlayerIdentity {
  readonly playerId: EntityId;
  readonly displayName: string;
  readonly shirtNumber: string | null;
  readonly primaryPosition: string | null;
  readonly secondaryPosition: string | null;
  readonly team: TeamSummary | null;
}

export interface PrivacySafeTeammate {
  readonly teammateId: EntityId;
  readonly shirtNumber: string | null;
  readonly position: string;
  readonly displayLabel: string;
  readonly publicName: string | null;
  readonly avatar: SafeImageAsset | null;
}

export interface PitchCoordinate {
  readonly x: number;
  readonly y: number;
}

export interface PlayerPositionMarker {
  readonly identity: PlayerIdentity;
  readonly coordinate: PitchCoordinate;
  readonly label: string;
}

export interface TeammatePositionMarker {
  readonly teammate: PrivacySafeTeammate;
  readonly coordinate: PitchCoordinate;
}

export interface FormationSnapshot {
  readonly id: EntityId;
  readonly teamId: EntityId;
  readonly seasonLabel: string | null;
  readonly shapeLabel: string | null;
  readonly player: PlayerPositionMarker | null;
  readonly teammates: readonly TeammatePositionMarker[];
  readonly updatedAt: ISODateTime;
}

export type TeamStateKind =
  | "LIVE_MATCH"
  | "MATCH_DAY"
  | "UPCOMING_MATCH"
  | "NEXT_TRAINING"
  | "TEAM_ANNOUNCEMENT"
  | "NO_EVENT";

export interface TeamStateLayer {
  readonly kind: TeamStateKind;
  readonly title: string;
  readonly primaryText: string;
  readonly secondaryText: string | null;
  readonly startsAt: ISODateTime | null;
  readonly destination: string | null;
}

export type SpatialAnchorKind =
  | "PLAYER"
  | "TRAINING"
  | "TEAM"
  | "CAREER"
  | "VIDEO"
  | "MATCH";

export interface SpatialAnchor {
  readonly id: EntityId;
  readonly kind: SpatialAnchorKind;
  readonly title: string;
  readonly detail: string | null;
  readonly destination: string;
  readonly coordinate: PitchCoordinate;
  readonly availability: DataAvailability;
}

export interface StadiumHomeViewModel {
  readonly team: TeamSummary | null;
  readonly player: PlayerIdentity;
  readonly stateLayer: TeamStateLayer;
  readonly visualMode: VisualMode;
  readonly updatedAt: ISODateTime;
}

export interface SpatialHomeViewModel {
  readonly team: TeamSummary;
  readonly player: PlayerIdentity;
  readonly anchors: readonly SpatialAnchor[];
  readonly visualMode: VisualMode;
  readonly updatedAt: ISODateTime;
}

export type ApiProblemCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_FAILED"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "NETWORK_OFFLINE"
  | "UNKNOWN";

export interface ApiFieldError {
  readonly field: string;
  readonly message: string;
}

export interface ApiProblem {
  readonly code: ApiProblemCode;
  readonly userMessage: string;
  readonly referenceId: string | null;
  readonly retryable: boolean;
  readonly fieldErrors: readonly ApiFieldError[];
}

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly problem: ApiProblem };

export interface RequestContext {
  readonly signal?: AbortSignal;
  readonly idempotencyKey?: string;
}

export interface PermissionDecision {
  readonly allowed: boolean;
  readonly reason:
    | "ALLOWED"
    | "UNAUTHENTICATED"
    | "GRANT_NOT_VERIFIED"
    | "GRANT_EXPIRED"
    | "GRANT_REVOKED"
    | "ROLE_MISMATCH"
    | "CAPABILITY_MISSING"
    | "OBJECT_SCOPE_MISMATCH";
  readonly checkedAt: ISODateTime;
}

export interface UiActionContract {
  readonly id: string;
  readonly label: string;
  readonly kind: "BUTTON" | "LINK";
  readonly destination: string | null;
}

export interface ScreenStateCopy {
  readonly title: string;
  readonly description: string;
  readonly primaryAction: UiActionContract | null;
  readonly secondaryAction: UiActionContract | null;
}

export interface ScreenStateModel {
  readonly screen: CoreScreenId;
  readonly kind: UiResourceStateKind;
  readonly copy: ScreenStateCopy;
  readonly asOf: ISODateTime | null;
  readonly preserveContent: boolean;
  readonly announceMode: "OFF" | "POLITE" | "ASSERTIVE";
}

