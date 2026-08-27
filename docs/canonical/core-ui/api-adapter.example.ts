import type {
  ApiFieldError,
  ApiProblem,
  ApiProblemCode,
  FormationSnapshot,
  PlayerIdentity,
  RequestContext,
  Result,
  RolePreference,
  RolePreferenceSubmission,
  SpatialAnchor,
  SpatialHomeViewModel,
  StadiumHomeViewModel,
  TeamStateKind,
  VisualMode,
} from "./contracts";

type FetchLike = typeof fetch;

interface RawApiErrorBody {
  readonly reference_id?: unknown;
  readonly errors?: unknown;
}

interface RawTeamSummary {
  readonly id: string;
  readonly display_name: string;
  readonly age_group_label: string | null;
  readonly season_label: string | null;
}

interface RawPlayerIdentity {
  readonly player_id: string;
  readonly display_name: string;
  readonly shirt_number: string | null;
  readonly primary_position: string | null;
  readonly secondary_position: string | null;
  readonly team: RawTeamSummary | null;
}

interface RawTeamStateLayer {
  readonly kind: TeamStateKind;
  readonly title: string;
  readonly primary_text: string;
  readonly secondary_text: string | null;
  readonly starts_at: string | null;
  readonly destination: string | null;
}

interface RawStadiumHomeResponse {
  readonly player: RawPlayerIdentity;
  readonly team: RawTeamSummary | null;
  readonly state_layer: RawTeamStateLayer;
  readonly visual_mode: VisualMode;
  readonly updated_at: string;
}

interface RawCoordinate {
  readonly x: number;
  readonly y: number;
}

interface RawTeammateMarker {
  readonly teammate_id: string;
  readonly shirt_number: string | null;
  readonly position: string;
  readonly display_label: string;
  readonly public_name: string | null;
  readonly coordinate: RawCoordinate;
}

interface RawFormationResponse {
  readonly id: string;
  readonly team_id: string;
  readonly season_label: string | null;
  readonly shape_label: string | null;
  readonly player: {
    readonly identity: RawPlayerIdentity;
    readonly coordinate: RawCoordinate;
    readonly label: string;
  } | null;
  readonly teammates: readonly RawTeammateMarker[];
  readonly updated_at: string;
}

interface RawSpatialAnchor {
  readonly id: string;
  readonly kind: SpatialAnchor["kind"];
  readonly title: string;
  readonly detail: string | null;
  readonly destination: string;
  readonly coordinate: RawCoordinate;
  readonly availability: SpatialAnchor["availability"];
}

interface RawSpatialHomeResponse {
  readonly team: RawTeamSummary;
  readonly player: RawPlayerIdentity;
  readonly anchors: readonly RawSpatialAnchor[];
  readonly visual_mode: VisualMode;
  readonly updated_at: string;
}

interface RawRolePreferenceResponse {
  readonly preference: RolePreference;
  readonly submitted_at: string;
}

function mapTeam(raw: RawTeamSummary) {
  return {
    id: raw.id,
    displayName: raw.display_name,
    ageGroupLabel: raw.age_group_label,
    seasonLabel: raw.season_label,
  } as const;
}

function mapPlayer(raw: RawPlayerIdentity): PlayerIdentity {
  return {
    playerId: raw.player_id,
    displayName: raw.display_name,
    shirtNumber: raw.shirt_number,
    primaryPosition: raw.primary_position,
    secondaryPosition: raw.secondary_position,
    team: raw.team === null ? null : mapTeam(raw.team),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapFieldErrors(value: unknown): readonly ApiFieldError[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): readonly ApiFieldError[] => {
    if (!isRecord(item) || typeof item.field !== "string" || typeof item.message !== "string") {
      return [];
    }

    return [{ field: item.field, message: item.message }];
  });
}

function problemForStatus(status: number, body: RawApiErrorBody | null): ApiProblem {
  const mapping: Readonly<Record<number, { code: ApiProblemCode; message: string; retryable: boolean }>> = {
    401: { code: "UNAUTHENTICATED", message: "로그인이 필요합니다.", retryable: false },
    403: { code: "FORBIDDEN", message: "이 작업을 수행할 권한이 없습니다.", retryable: false },
    404: { code: "NOT_FOUND", message: "요청한 정보를 찾을 수 없습니다.", retryable: false },
    409: { code: "CONFLICT", message: "다른 변경과 충돌했습니다. 최신 정보를 확인해 주세요.", retryable: true },
    422: { code: "VALIDATION_FAILED", message: "입력한 내용을 확인해 주세요.", retryable: false },
    429: { code: "RATE_LIMITED", message: "요청이 많습니다. 잠시 후 다시 시도해 주세요.", retryable: true },
  };

  const fallback = status >= 500
    ? { code: "SERVER_ERROR" as const, message: "서버에서 요청을 처리하지 못했습니다.", retryable: true }
    : { code: "UNKNOWN" as const, message: "요청을 처리하지 못했습니다.", retryable: false };
  const mapped = mapping[status] ?? fallback;

  return {
    code: mapped.code,
    userMessage: mapped.message,
    referenceId: typeof body?.reference_id === "string" ? body.reference_id : null,
    retryable: mapped.retryable,
    fieldErrors: mapFieldErrors(body?.errors),
  };
}

export class SnapnUiApiAdapter {
  public constructor(
    private readonly baseUrl: string,
    private readonly fetcher: FetchLike = fetch,
  ) {}

  public async submitRolePreference(
    preference: RolePreference,
    context: RequestContext = {},
  ): Promise<Result<RolePreferenceSubmission>> {
    return this.requestJson<RawRolePreferenceResponse, RolePreferenceSubmission>(
      "/v2/account/role-preference",
      {
        method: "POST",
        body: JSON.stringify({ preference }),
      },
      context,
      (raw) => ({ preference: raw.preference, submittedAt: raw.submitted_at }),
    );
  }

  public async getStadiumHome(
    context: RequestContext = {},
  ): Promise<Result<StadiumHomeViewModel>> {
    return this.requestJson<RawStadiumHomeResponse, StadiumHomeViewModel>(
      "/v2/player/stadium-home",
      { method: "GET" },
      context,
      (raw) => ({
        team: raw.team === null ? null : mapTeam(raw.team),
        player: mapPlayer(raw.player),
        stateLayer: {
          kind: raw.state_layer.kind,
          title: raw.state_layer.title,
          primaryText: raw.state_layer.primary_text,
          secondaryText: raw.state_layer.secondary_text,
          startsAt: raw.state_layer.starts_at,
          destination: raw.state_layer.destination,
        },
        visualMode: raw.visual_mode,
        updatedAt: raw.updated_at,
      }),
    );
  }

  public async getFormation(
    context: RequestContext = {},
  ): Promise<Result<FormationSnapshot>> {
    return this.requestJson<RawFormationResponse, FormationSnapshot>(
      "/v2/player/formation",
      { method: "GET" },
      context,
      (raw) => ({
        id: raw.id,
        teamId: raw.team_id,
        seasonLabel: raw.season_label,
        shapeLabel: raw.shape_label,
        player: raw.player === null
          ? null
          : {
              identity: mapPlayer(raw.player.identity),
              coordinate: raw.player.coordinate,
              label: raw.player.label,
            },
        teammates: raw.teammates.map((marker) => ({
          teammate: {
            teammateId: marker.teammate_id,
            shirtNumber: marker.shirt_number,
            position: marker.position,
            displayLabel: marker.display_label,
            publicName: marker.public_name,
            avatar: null,
          },
          coordinate: marker.coordinate,
        })),
        updatedAt: raw.updated_at,
      }),
    );
  }

  public async getSpatialHome(
    context: RequestContext = {},
  ): Promise<Result<SpatialHomeViewModel>> {
    return this.requestJson<RawSpatialHomeResponse, SpatialHomeViewModel>(
      "/v2/player/spatial-home",
      { method: "GET" },
      context,
      (raw) => ({
        team: mapTeam(raw.team),
        player: mapPlayer(raw.player),
        anchors: raw.anchors.map((anchor) => ({
          id: anchor.id,
          kind: anchor.kind,
          title: anchor.title,
          detail: anchor.detail,
          destination: anchor.destination,
          coordinate: anchor.coordinate,
          availability: anchor.availability,
        })),
        visualMode: raw.visual_mode,
        updatedAt: raw.updated_at,
      }),
    );
  }

  private async requestJson<Raw, Mapped>(
    path: string,
    init: RequestInit,
    context: RequestContext,
    map: (raw: Raw) => Mapped,
  ): Promise<Result<Mapped>> {
    try {
      const headers = new Headers(init.headers);
      headers.set("Accept", "application/json");
      if (init.body !== undefined) {
        headers.set("Content-Type", "application/json");
      }
      if (context.idempotencyKey !== undefined) {
        headers.set("Idempotency-Key", context.idempotencyKey);
      }

      const response = await this.fetcher(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        credentials: "include",
        signal: context.signal,
      });

      if (!response.ok) {
        const errorBody = await this.readErrorBody(response);
        return { ok: false, problem: problemForStatus(response.status, errorBody) };
      }

      const raw = (await response.json()) as Raw;
      return { ok: true, value: map(raw) };
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          ok: false,
          problem: {
            code: "UNKNOWN",
            userMessage: "요청이 취소되었습니다.",
            referenceId: null,
            retryable: true,
            fieldErrors: [],
          },
        };
      }

      const isNetworkFailure = error instanceof TypeError;

      return {
        ok: false,
        problem: {
          code: isNetworkFailure ? "NETWORK_OFFLINE" : "UNKNOWN",
          userMessage: isNetworkFailure
            ? "인터넷 연결을 확인해 주세요."
            : "응답 형식을 확인하지 못했습니다.",
          referenceId: null,
          retryable: isNetworkFailure,
          fieldErrors: [],
        },
      };
    }
  }

  private async readErrorBody(response: Response): Promise<RawApiErrorBody | null> {
    try {
      const value: unknown = await response.json();
      return isRecord(value) ? value : null;
    } catch {
      return null;
    }
  }
}
