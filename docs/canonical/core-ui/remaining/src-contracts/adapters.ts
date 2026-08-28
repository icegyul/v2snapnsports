import type {
  AdapterPage,
  AdapterResult,
  CareerPassportView,
  CareerVisibility,
  CommunityContentType,
  CommunityFeedPage,
  CommunityPostDetail,
  CommunityVisibility,
  EntityId,
  ParticipationState,
  PlayerHomeProjection,
  TrainingSessionView,
  TrainingSummary,
  VideoAssetView,
} from './contracts';

/**
 * Adapter error policy:
 * - Permission errors return safe generic errors and never leak hidden resource metadata.
 * - Offline can return cachedData with meta.offlineCache=true.
 * - Stale is data, not a fatal error.
 * - ProductionLegacyAdapter remains disabled by the existing F0 foundation.
 */
export interface AdapterRequestContext {
  signal?: AbortSignal;
  online: boolean;
  nowIso: string;
}

export interface CommunityAdapter {
  listFeed(input: {
    cursor?: string;
    type?: CommunityContentType | 'ALL';
    context: AdapterRequestContext;
  }): Promise<AdapterResult<CommunityFeedPage>>;

  getPost(input: {
    postId: EntityId;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<CommunityPostDetail>>;

  createPost(input: {
    type: CommunityContentType;
    title?: string;
    body: string;
    visibility: CommunityVisibility;
    organizationId?: EntityId;
    teamId?: EntityId;
    mediaAssetIds: EntityId[];
    idempotencyKey: string;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<{ postId: EntityId }>>;

  toggleReaction(input: {
    postId: EntityId;
    reaction: 'LIKE';
    idempotencyKey: string;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<{ liked: boolean; likeCount: number }>>;

  addComment(input: {
    postId: EntityId;
    body: string;
    idempotencyKey: string;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<{ commentId: EntityId }>>;

  report(input: {
    targetType: 'POST' | 'COMMENT' | 'USER';
    targetId: EntityId;
    reasonCode: string;
    details?: string;
    idempotencyKey: string;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<{ reportId: EntityId }>>;

  block(input: {
    userId: EntityId;
    idempotencyKey: string;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<{ blocked: true }>>;
}

export interface TrainingAdapter {
  list(input: {
    from?: string;
    to?: string;
    cursor?: string;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<AdapterPage<TrainingSummary>>>;

  getSession(input: {
    sessionId: EntityId;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<TrainingSessionView>>;

  setParticipation(input: {
    sessionId: EntityId;
    state: Extract<ParticipationState, 'GOING' | 'NOT_GOING' | 'LATE'>;
    idempotencyKey: string;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<{ participation: ParticipationState }>>;
}

export interface VideoAdapter {
  listVisible(input: {
    cursor?: string;
    context?: 'ALL_VISIBLE' | 'MY_VIDEOS' | 'TEAM' | 'CAREER';
    request: AdapterRequestContext;
  }): Promise<AdapterResult<AdapterPage<VideoAssetView>>>;

  getVideo(input: {
    videoId: EntityId;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<VideoAssetView>>;
}

export interface CareerAdapter {
  getPassport(input: {
    athleteId: EntityId;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<CareerPassportView>>;

  getSeason(input: {
    athleteId: EntityId;
    seasonId: EntityId;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<CareerPassportView>>;

  setRepresentativeVideo(input: {
    athleteId: EntityId;
    videoId: EntityId;
    idempotencyKey: string;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<{ selectedVideoId: EntityId }>>;

  setVisibility(input: {
    athleteId: EntityId;
    visibility: CareerVisibility;
    context: AdapterRequestContext;
  }): Promise<AdapterResult<{ visibility: CareerVisibility }>>;
}

export interface PlayerHomeAdapter {
  getHome(input: {
    context: AdapterRequestContext;
  }): Promise<AdapterResult<PlayerHomeProjection>>;
}

/**
 * F0 FixtureLegacyAdapter boundary.
 * Codex must adapt these methods to the EXISTING FixtureLegacyAdapter rather than
 * creating a second fixture store.
 */
export interface FixtureLegacyAdapterPort {
  invoke<T>(operation: FixtureOperation, input?: Record<string, unknown>): Promise<T>;
}

export type FixtureOperation =
  | 'getStadiumHome'
  | 'listEvents'
  | 'getTrainingSession'
  | 'setTrainingAttendance'
  | 'getCommunityFeed'
  | 'getCommunityPost'
  | 'createCommunityPost'
  | 'addCommunityComment'
  | 'reactCommunityPost'
  | 'reportCommunity'
  | 'blockCommunityUser'
  | 'listVisibleVideos'
  | 'getMedia'
  | 'getCareerPassport'
  | 'getCareerPassportEvents'
  | 'getCareerPassportHighlights'
  | 'setCareerPassportHighlight'
  | 'setCareerPassportVisibility';

/**
 * Canonical operation mapping.
 *
 * Existing in OpenAPI v1.4:
 * - getStadiumHome, listEvents, getCommunityFeed, createCommunityPost,
 *   addCommunityComment, createMediaUpload, getCareerPassport (physical path /career)
 *
 * Present in API/Data Contract v1.3 but not fully represented in OpenAPI v1.4:
 * - GET training-sessions/{id}
 * - POST training-sessions/{id}/attendance
 * - GET community/posts/{id}
 * - POST community/posts/{id}/reactions
 * - POST community/reports
 * - POST community/blocks
 * - GET media/{id}
 * - GET videos
 * - passport events/highlights + highlight/visibility mutations
 *
 * These are PROMOTION GAPS, not invented new APIs. Do not create conflicting endpoints.
 */
export const CANONICAL_OPERATION_STATUS = {
  getStadiumHome: 'OPENAPI_V1_4',
  listEvents: 'OPENAPI_V1_4',
  getTrainingSession: 'PROMOTE_V1_3_TO_OPENAPI',
  setTrainingAttendance: 'PROMOTE_V1_3_TO_OPENAPI',
  getCommunityFeed: 'OPENAPI_V1_4',
  getCommunityPost: 'PROMOTE_V1_3_TO_OPENAPI',
  createCommunityPost: 'OPENAPI_V1_4',
  addCommunityComment: 'OPENAPI_V1_4',
  reactCommunityPost: 'PROMOTE_V1_3_TO_OPENAPI',
  reportCommunity: 'PROMOTE_V1_3_TO_OPENAPI',
  blockCommunityUser: 'PROMOTE_V1_3_TO_OPENAPI',
  listVisibleVideos: 'PROMOTE_V1_3_TO_OPENAPI',
  getMedia: 'PROMOTE_V1_3_TO_OPENAPI',
  getCareerPassport: 'OPENAPI_V1_4_PATH_DIFFERS_FROM_V1_3',
  getCareerPassportEvents: 'PROMOTE_V1_3_TO_OPENAPI',
  getCareerPassportHighlights: 'PROMOTE_V1_3_TO_OPENAPI',
  setCareerPassportHighlight: 'PROMOTE_V1_3_TO_OPENAPI',
  setCareerPassportVisibility: 'PROMOTE_V1_3_TO_OPENAPI',
} as const;

export interface HtmlSanitizer {
  sanitize(untrusted: string): string;
}

export interface AdapterMapper<TRaw, TView> {
  map(raw: TRaw): TView;
}

export class FixtureCommunityAdapter implements CommunityAdapter {
  constructor(
    private readonly fixture: FixtureLegacyAdapterPort,
    private readonly sanitizer: HtmlSanitizer,
    private readonly mapFeed: AdapterMapper<unknown, CommunityFeedPage>,
    private readonly mapDetail: AdapterMapper<unknown, CommunityPostDetail>,
  ) {}

  async listFeed(input: Parameters<CommunityAdapter['listFeed']>[0]) {
    const raw = await this.fixture.invoke('getCommunityFeed', {
      cursor: input.cursor,
      type: input.type === 'ALL' ? undefined : input.type,
    });
    const mapped = this.mapFeed.map(raw);
    return { ok: true as const, data: mapped, meta: mapped.meta };
  }

  async getPost(input: Parameters<CommunityAdapter['getPost']>[0]) {
    const raw = await this.fixture.invoke('getCommunityPost', { postId: input.postId });
    const mapped = this.mapDetail.map(raw);
    mapped.post.sanitizedBody = this.sanitizer.sanitize(mapped.post.sanitizedBody);
    mapped.comments = mapped.comments.map((comment) => ({
      ...comment,
      parentCommentId: null,
      sanitizedBody: this.sanitizer.sanitize(comment.sanitizedBody),
    }));
    return { ok: true as const, data: mapped, meta: mapped.meta };
  }

  async createPost(input: Parameters<CommunityAdapter['createPost']>[0]) {
    const raw = await this.fixture.invoke<{ postId: string }>('createCommunityPost', {
      ...input,
      body: this.sanitizer.sanitize(input.body),
    });
    return {
      ok: true as const,
      data: { postId: raw.postId },
      meta: { stale: false, offlineCache: false, fetchedAt: input.context.nowIso },
    };
  }

  async toggleReaction(input: Parameters<CommunityAdapter['toggleReaction']>[0]) {
    const raw = await this.fixture.invoke<{ liked: boolean; likeCount: number }>('reactCommunityPost', input);
    return {
      ok: true as const,
      data: raw,
      meta: { stale: false, offlineCache: false, fetchedAt: input.context.nowIso },
    };
  }

  async addComment(input: Parameters<CommunityAdapter['addComment']>[0]) {
    const raw = await this.fixture.invoke<{ commentId: string }>('addCommunityComment', {
      postId: input.postId,
      body: this.sanitizer.sanitize(input.body),
      parentCommentId: null,
      idempotencyKey: input.idempotencyKey,
    });
    return {
      ok: true as const,
      data: raw,
      meta: { stale: false, offlineCache: false, fetchedAt: input.context.nowIso },
    };
  }

  async report(input: Parameters<CommunityAdapter['report']>[0]) {
    const raw = await this.fixture.invoke<{ reportId: string }>('reportCommunity', input);
    return {
      ok: true as const,
      data: raw,
      meta: { stale: false, offlineCache: false, fetchedAt: input.context.nowIso },
    };
  }

  async block(input: Parameters<CommunityAdapter['block']>[0]) {
    await this.fixture.invoke('blockCommunityUser', input);
    return {
      ok: true as const,
      data: { blocked: true as const },
      meta: { stale: false, offlineCache: false, fetchedAt: input.context.nowIso },
    };
  }
}

/**
 * Production implementation rule:
 * - Do NOT construct URLs here.
 * - Do NOT enable ProductionLegacyAdapter.
 * - Codex maps the interfaces above onto the existing F0 adapter/query layer.
 * - On permission/offline/stale errors, preserve AdapterResult semantics.
 */
