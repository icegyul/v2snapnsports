/**
 * SNAPN SPORTS V2 — CORE UI REMAINING DATA CONTRACT
 *
 * Canonical alignment:
 * - Engine Catalog v1.3
 * - Algorithm Catalog v1.3
 * - API/Data Contract v1.3
 * - OpenAPI physical contract v1.4
 * - Frontend/Graphite lock v1.7
 *
 * This file defines UI projection DTOs. It does NOT create production DB schema.
 * Raw legacy responses must be mapped by adapters before reaching React components.
 */

export type EntityId = string;
export type ISODateTime = string;

export type AppDataState =
  | 'LOADING'
  | 'READY'
  | 'EMPTY'
  | 'ERROR'
  | 'OFFLINE'
  | 'FORBIDDEN'
  | 'STALE'
  | 'SAVING'
  | 'SYNCING'
  | 'READ_ONLY';

export type DataFreshness = 'FRESH' | 'STALE' | 'UNKNOWN';
export type VisualMode = 'FULL' | 'FAST' | 'LIGHT' | 'STATIC';
export type PrimaryPlayerTab = 'HOME' | 'TRAINING' | 'COMMUNITY' | 'VIDEO' | 'MORE';

export interface RequestMeta {
  requestId?: string;
  fetchedAt?: ISODateTime;
  updatedAt?: ISODateTime;
  stale: boolean;
  offlineCache: boolean;
  sourceVersion?: string | number;
}

export interface SafeError {
  code:
    | 'AUTH_REQUIRED'
    | 'AUTH_INVALID'
    | 'ACCOUNT_INACTIVE'
    | 'ROLE_PREFERENCE_NOT_AUTHORITY'
    | 'ROLE_GRANT_REQUIRED'
    | 'ROLE_VERIFICATION_PENDING'
    | 'TENANT_SCOPE_DENIED'
    | 'TEAM_SCOPE_DENIED'
    | 'SUBJECT_SCOPE_DENIED'
    | 'CONSENT_REQUIRED'
    | 'CONSENT_REVOKED'
    | 'MINOR_DIRECT_CONTACT_BLOCKED'
    | 'BLOCK_RELATIONSHIP_DENIED'
    | 'FEATURE_DISABLED'
    | 'FEATURE_HARD_DISABLED'
    | 'RESOURCE_VERSION_CONFLICT'
    | 'IDEMPOTENCY_CONFLICT'
    | 'OFFLINE_SEQUENCE_CONFLICT'
    | 'GUARDIAN_INVITE_EXPIRED'
    | 'LEGACY_WRITE_OWNER'
    | 'COMMUNITY_PARITY_NOT_CLEARED'
    | 'MEDIA_ACCESS_DENIED'
    | 'PRIVACY_REQUEST_LOCKED'
    | 'VALIDATION_FAILED'
    | 'NOT_FOUND'
    | 'RATE_LIMITED'
    | 'EARTHUS_CONTEXT_UNAVAILABLE'
    | 'DEPENDENCY_UNAVAILABLE'
    | 'INTERNAL_ERROR'
    | 'UNKNOWN';
  message: string;
  retryable: boolean;
  requestId?: string;
}

export interface ViewerCapabilities {
  canView: boolean;
  canCreate: boolean;
  canEditOwn: boolean;
  canDeleteOwn: boolean;
  canReact: boolean;
  canComment: boolean;
  canReport: boolean;
  canBlock: boolean;
  canModerate: boolean;
  canShare: boolean;
}

export interface PlayerIdentityView {
  athleteId: EntityId;
  displayName: string;
  jerseyNumber?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  teamId?: EntityId;
  teamName?: string;
  seasonId?: EntityId;
  avatarRef?: string;
}

export type CommunityContentType =
  | 'POST'
  | 'IMAGE'
  | 'NEWS'
  | 'YOUTUBE'
  | 'MATCH_HIGHLIGHT'
  | 'PREDICTION'
  | 'LEADERBOARD'
  | 'DEVELOPMENT_REQUEST';

export type CommunityVisibility = 'PUBLIC' | 'CLUB' | 'TEAM' | 'FOLLOWERS' | 'PRIVATE';

export type CommunityModerationState =
  | 'VISIBLE'
  | 'UNDER_REVIEW'
  | 'HIDDEN'
  | 'REMOVED';

export interface CommunityAuthorView {
  userId?: EntityId;
  safeLabel: string;
  avatarRef?: string;
  isBlockedByViewer: boolean;
}

export interface CommunityMediaRef {
  assetId: EntityId;
  kind: 'IMAGE' | 'VIDEO' | 'YOUTUBE' | 'LINK_CARD';
  thumbnailRef?: string;
  externalUrl?: string;
  altText?: string;
}

export interface CommunityPost {
  postId: EntityId;
  contentType: CommunityContentType;
  title?: string;
  /** Adapter/sanitizer output only. Never render raw legacy HTML. */
  sanitizedBody: string;
  visibility: CommunityVisibility;
  organizationId?: EntityId;
  teamId?: EntityId;
  author: CommunityAuthorView;
  media: CommunityMediaRef[];
  likeCount: number;
  commentCount: number;
  viewerLiked: boolean;
  moderationState: CommunityModerationState;
  hiddenReasonCode?: 'MODERATION' | 'BLOCKED' | 'AUDIENCE' | 'DELETED' | 'UNKNOWN';
  capabilities: ViewerCapabilities;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
  meta: RequestMeta;
}

export interface CommunityComment {
  commentId: EntityId;
  postId: EntityId;
  /** V2 launch parity is single-level comments. */
  parentCommentId: null;
  sanitizedBody: string;
  author: CommunityAuthorView;
  moderationState: CommunityModerationState;
  capabilities: Pick<ViewerCapabilities, 'canReport' | 'canBlock' | 'canModerate'>;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
}

export interface CommunityFeedPage {
  items: CommunityPost[];
  nextCursor?: string;
  legacyOrderPreserved: true;
  meta: RequestMeta;
}

export interface CommunityPostDetail {
  post: CommunityPost;
  comments: CommunityComment[];
  nextCommentCursor?: string;
  meta: RequestMeta;
}

export type ParticipationState =
  | 'UNKNOWN'
  | 'INVITED'
  | 'GOING'
  | 'NOT_GOING'
  | 'LATE'
  | 'ATTENDED'
  | 'ABSENT'
  | 'EXCUSED';

export interface VenueView {
  venueId?: EntityId;
  name: string;
  addressLabel?: string;
}

export interface EarthusContextBadge {
  kind: 'WEATHER' | 'HEAT_COLD' | 'AIR_QUALITY';
  label: string;
  freshness: DataFreshness;
  issuedAt?: ISODateTime;
}

export interface TrainingSummary {
  sessionId: EntityId;
  teamId: EntityId;
  teamName: string;
  title: string;
  objective?: string;
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  venue?: VenueView;
  participation: ParticipationState;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  contextBadges: EarthusContextBadge[];
  coachApproved: boolean;
  meta: RequestMeta;
}

export interface TrainingPlanSummary {
  planId?: EntityId;
  title: string;
  summary: string;
  source: 'COACH_APPROVED' | 'MANUAL_TEAM_INFO';
  updatedAt?: ISODateTime;
}

export interface TrainingSessionView extends TrainingSummary {
  plan?: TrainingPlanSummary;
  attendanceLabel?: string;
  participationCanChange: boolean;
  historyProjectionAvailable: boolean;
  /** Deliberately no wearable, AI score, fatigue, speed, heart-rate fields. */
}

export type VideoVisibility = 'PRIVATE' | 'GUARDIAN' | 'TEAM' | 'CLUB' | 'COMMUNITY' | 'PUBLIC';

export interface VideoOwnership {
  ownerType: 'PLAYER' | 'TEAM' | 'CLUB' | 'COMMUNITY_POST';
  ownerPlayerId?: EntityId;
  ownerTeamId?: EntityId;
  ownerOrganizationId?: EntityId;
  sourceContext: 'TRAINING' | 'MATCH' | 'COMMUNITY' | 'MANUAL_UPLOAD' | 'CAREER';
  sourceContextId?: EntityId;
}

export interface VideoPlaybackSource {
  state: 'AVAILABLE' | 'UNAVAILABLE';
  /**
   * Adapter-provided ephemeral/local locator only.
   * UI must never derive a production media URL from assetId.
   */
  src?: string;
  posterSrc?: string;
  expiresAt?: ISODateTime;
}

export interface VideoAssetView {
  videoId: EntityId;
  assetId: EntityId;
  title: string;
  description?: string;
  capturedAt?: ISODateTime;
  durationSeconds?: number;
  ownership: VideoOwnership;
  visibility: VideoVisibility;
  containsMinorPrivateMedia: boolean;
  representativeForCareer: boolean;
  playback: VideoPlaybackSource;
  capabilities: Pick<ViewerCapabilities, 'canView' | 'canShare' | 'canReport'> & {
    canSetRepresentative: boolean;
  };
  meta: RequestMeta;
}

export type CareerVisibility = 'PRIVATE' | 'PLAYER_GUARDIAN' | 'CLUB' | 'SCOUTING_ALLOWED';

export type CareerEventType =
  | 'TEAM_JOINED'
  | 'TEAM_LEFT'
  | 'CLUB_JOINED'
  | 'CLUB_LEFT'
  | 'SEASON_STARTED'
  | 'SEASON_COMPLETED'
  | 'POSITION_CHANGED'
  | 'TRAINING_MILESTONE'
  | 'MATCH_PARTICIPATION'
  | 'COACH_APPROVED_MILESTONE'
  | 'REPRESENTATIVE_VIDEO_ADDED'
  | 'USER_SELECTED_HIGHLIGHT'
  | 'ACHIEVEMENT_VERIFIED';

export type CareerEventSourceType =
  | 'TEAM_MEMBERSHIP'
  | 'CLUB_MEMBERSHIP'
  | 'SEASON'
  | 'POSITION_HISTORY'
  | 'TRAINING_ATTENDANCE'
  | 'MATCH'
  | 'COACH_APPROVED_FEEDBACK'
  | 'MEDIA'
  | 'VERIFIED_ACHIEVEMENT'
  | 'LEGACY_VERIFIED_IMPORT';

export interface CareerEventSource {
  type: CareerEventSourceType;
  id: EntityId;
  version: string | number;
  verifiedState: 'VERIFIED' | 'SOURCE_CONFIRMED' | 'REVOKED' | 'DELETED';
  sourceOccurredAt?: ISODateTime;
}

export interface CareerEvent {
  careerEventId: EntityId;
  athleteId: EntityId;
  type: CareerEventType;
  title: string;
  occurredAt: ISODateTime;
  teamId?: EntityId;
  teamName?: string;
  seasonId?: EntityId;
  seasonLabel?: string;
  position?: string;
  videoId?: EntityId;
  visibility: CareerVisibility;
  source: CareerEventSource;
}

export interface CareerSeasonChapter {
  seasonId: EntityId;
  label: string;
  startsAt?: ISODateTime;
  endsAt?: ISODateTime;
  teamId?: EntityId;
  teamName?: string;
  positions: string[];
  eventIds: EntityId[];
  representativeVideoIds: EntityId[];
}

export interface CareerAchievementView {
  achievementId: EntityId;
  title: string;
  occurredAt?: ISODateTime;
  source: CareerEventSource;
  visibility: CareerVisibility;
}

export interface CareerPassportView {
  athlete: PlayerIdentityView;
  visibility: CareerVisibility;
  currentSeasonId?: EntityId;
  seasons: CareerSeasonChapter[];
  events: CareerEvent[];
  representativeVideos: VideoAssetView[];
  achievements: CareerAchievementView[];
  capabilities: {
    canView: boolean;
    canEditVisibility: boolean;
    canSelectRepresentativeVideo: boolean;
    canSharePortfolio: boolean;
  };
  meta: RequestMeta;
}

export interface FormationPlayerProjection {
  athleteId: EntityId;
  jerseyNumber?: string;
  position?: string;
  normalizedX: number;
  normalizedY: number;
  isMe: boolean;
  displayName?: string;
  avatarRef?: string;
}

export interface PlayerFormationProjection {
  teamId: EntityId;
  teamName: string;
  seasonId?: EntityId;
  formationSystem: string;
  players: FormationPlayerProjection[];
  updatedAt?: ISODateTime;
}

export interface PlayerHomeProjection {
  player: PlayerIdentityView;
  teamContext: {
    teamId?: EntityId;
    teamName?: string;
    seasonId?: EntityId;
  };
  formation?: PlayerFormationProjection;
  nextTraining?: TrainingSummary;
  nextMatch?: {
    matchId: EntityId;
    title: string;
    startsAt: ISODateTime;
    venue?: VenueView;
  };
  primaryAction?: {
    kind: 'TRAINING' | 'MATCH' | 'VIDEO' | 'COMMUNITY' | 'NONE';
    label: string;
    route?: string;
  };
  visualMode: VisualMode;
  meta: RequestMeta;
}

export interface AdapterPage<T> {
  items: T[];
  nextCursor?: string;
  meta: RequestMeta;
}

export type AdapterResult<T> =
  | { ok: true; data: T; meta: RequestMeta }
  | { ok: false; error: SafeError; cachedData?: T; meta: RequestMeta };

export type ViewportClass = 'SMALL_MOBILE' | 'STANDARD_MOBILE' | 'LARGE_MOBILE' | 'TABLET' | 'DESKTOP';

export function classifyViewport(widthCssPx: number): ViewportClass {
  if (widthCssPx < 360) return 'SMALL_MOBILE';
  if (widthCssPx < 420) return 'STANDARD_MOBILE';
  if (widthCssPx < 600) return 'LARGE_MOBILE';
  if (widthCssPx < 1024) return 'TABLET';
  return 'DESKTOP';
}

export const HARD_DISABLED_FEATURES = ['EPTS', 'CAMERA_AI', 'SPORTS_AI'] as const;
export type HardDisabledFeature = (typeof HARD_DISABLED_FEATURES)[number];

export function isHardDisabledFeatureVisible(feature: string): boolean {
  return !HARD_DISABLED_FEATURES.includes(feature as HardDisabledFeature);
}

export function hasCareerProvenance(event: CareerEvent): boolean {
  return Boolean(event.source?.id) && event.source.version !== undefined && Boolean(event.source.type);
}

export function isSafeCommunityUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (/^(\/(?!\/)|\.{1,2}\/|#)/.test(trimmed)) return true;
  if (/^\/\//.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
