import type {
  CoreScreenId,
  FormationSnapshot,
  GuardianInviteContext,
  ISODateTime,
  PlayerIdentity,
  RolePreference,
  ScreenStateModel,
  SpatialHomeViewModel,
  StadiumHomeViewModel,
  TeamStateLayer,
  UiResourceStateKind,
  VisualMode,
} from "./contracts";
import type {
  CommunityComment,
  CommunityFeedItem,
  CommunityFeedQuery,
  CommunityPost,
  CommunityReportInput,
  DevelopmentRequest,
  MatchPrediction,
  PredictionLeaderboard,
} from "./community-contracts";
import type {
  ApprovedDataSource,
  ClubOverviewViewModel,
  CoachGroundViewModel,
  ManagerContext,
  RefereeAssignment,
  TeamOperationsViewModel,
} from "./manager-contracts";

export type SyncAction = () => void;
export type AsyncAction = () => Promise<void>;
export type RouteAction = (destination: string) => void;

export interface AppShellProps {
  readonly activeNavigationId: "HOME" | "TRAINING" | "COMMUNITY" | "VIDEO" | "MORE";
  readonly onNavigate: RouteAction;
  readonly ariaLabel: string;
}

export interface ScreenStateBoundaryProps {
  readonly state: ScreenStateModel;
  readonly onPrimaryAction: SyncAction | AsyncAction | null;
  readonly onSecondaryAction: SyncAction | AsyncAction | null;
  readonly childrenVisibleWhenStaleOrOffline: boolean;
}

export interface RoleSelectPageProps {
  readonly state: UiResourceStateKind;
  readonly selected: RolePreference | null;
  readonly guardianInvite: GuardianInviteContext | null;
  readonly onSelect: (preference: RolePreference) => void;
  readonly onContinue: AsyncAction;
  readonly onOpenGuardianInviteHelp: SyncAction;
}

export interface RoleChoiceCardProps {
  readonly value: RolePreference;
  readonly title: "선수로 시작" | "매니저로 시작";
  readonly description: string;
  readonly selected: boolean;
  readonly onSelect: (preference: RolePreference) => void;
}

export interface StadiumExteriorPageProps {
  readonly state: ScreenStateModel;
  readonly viewModel: StadiumHomeViewModel | null;
  readonly onEnter: SyncAction;
  readonly onOpenTwoDimensionalMode: SyncAction;
  readonly onRetry: AsyncAction;
  readonly onNavigate: RouteAction;
}

export interface StadiumViewportProps {
  readonly visualMode: VisualMode;
  readonly player: PlayerIdentity;
  readonly stateLayer: TeamStateLayer;
  readonly orbitDegrees: number;
  readonly onEnter: SyncAction;
  readonly onRendererFailure: (mode: VisualMode, reason: string) => void;
}

export interface PitchEntryPageProps {
  readonly state: ScreenStateModel;
  readonly visualMode: VisualMode;
  readonly reducedMotion: boolean;
  readonly startedAt: ISODateTime;
  readonly onTransitionComplete: SyncAction;
  readonly onContinueWithTwoDimensionalMode: SyncAction;
  readonly onSkipToSpatialHome: SyncAction;
}

export interface MyPositionPageProps {
  readonly state: ScreenStateModel;
  readonly formation: FormationSnapshot | null;
  readonly visualMode: VisualMode;
  readonly onOpenPlayer: SyncAction;
  readonly onOpenTeammate: (teammateId: string) => void;
  readonly onEnterSpatialHome: SyncAction;
  readonly onSelectSeason: (seasonLabel: string) => void;
}

export interface SpatialHomePageProps {
  readonly state: ScreenStateModel;
  readonly viewModel: SpatialHomeViewModel | null;
  readonly onOpenAnchor: (anchorId: string, destination: string) => void;
  readonly onNavigate: RouteAction;
  readonly onRetry: AsyncAction;
}

export interface CommunityShellProps {
  readonly activeCategory: CommunityFeedQuery["kind"];
  readonly onChangeCategory: (category: CommunityFeedQuery["kind"]) => void;
  readonly onSearch: SyncAction;
  readonly onCreatePost: SyncAction;
  readonly onNavigate: RouteAction;
}

export interface CommunityFeedPageProps {
  readonly state: ScreenStateModel;
  readonly items: readonly CommunityFeedItem[];
  readonly hasNextPage: boolean;
  readonly onLoadNextPage: AsyncAction;
  readonly onRefresh: AsyncAction;
  readonly onOpenItem: (item: CommunityFeedItem) => void;
  readonly onCreatePost: SyncAction;
}

export interface CommunityPostDetailPageProps {
  readonly state: ScreenStateModel;
  readonly post: CommunityPost | null;
  readonly comments: readonly CommunityComment[];
  readonly onLike: AsyncAction;
  readonly onCreateComment: (text: string) => Promise<void>;
  readonly onHide: AsyncAction;
  readonly onBlockAuthor: AsyncAction;
  readonly onReport: (input: CommunityReportInput) => Promise<void>;
}

export interface CommunityComposerPageProps {
  readonly mode: "CREATE" | "EDIT";
  readonly state: UiResourceStateKind;
  readonly initialPost: CommunityPost | null;
  readonly onSaveDraft: AsyncAction;
  readonly onPublish: AsyncAction;
  readonly onCancel: SyncAction;
}

export interface PredictionPageProps {
  readonly prediction: MatchPrediction;
  readonly serverNow: ISODateTime;
  readonly onSubmit: (selection: "HOME_WIN" | "DRAW" | "AWAY_WIN") => Promise<void>;
}

export interface PredictionLeaderboardPageProps {
  readonly state: UiResourceStateKind;
  readonly leaderboard: PredictionLeaderboard | null;
  readonly onChangePeriod: (period: "WEEK" | "MONTH" | "SEASON") => void;
}

export interface DevelopmentRequestPageProps {
  readonly state: UiResourceStateKind;
  readonly requests: readonly DevelopmentRequest[];
  readonly onCreate: AsyncAction;
  readonly onSupport: (requestId: string) => Promise<void>;
  readonly onOpen: (requestId: string) => void;
}

export interface ManagerAppShellProps {
  readonly context: ManagerContext;
  readonly activeNavigationId: string;
  readonly onChangeScope: (scopeObjectId: string) => Promise<void>;
  readonly onNavigate: RouteAction;
}

export interface CoachGroundPageProps {
  readonly state: ScreenStateModel;
  readonly viewModel: CoachGroundViewModel | null;
  readonly canWritePlan: boolean;
  readonly canManageSession: boolean;
  readonly onOpenPlan: SyncAction;
  readonly onStartSession: AsyncAction;
}

export interface TeamManagerHomePageProps {
  readonly state: ScreenStateModel;
  readonly viewModel: TeamOperationsViewModel | null;
  readonly onOpenSchedule: SyncAction;
  readonly onOpenSquad: SyncAction;
  readonly onOpenComms: SyncAction;
}

export interface ClubDirectorHomePageProps {
  readonly state: ScreenStateModel;
  readonly viewModel: ClubOverviewViewModel | null;
  readonly onOpenTeams: SyncAction;
  readonly onOpenPeople: SyncAction;
}

export interface RefereeHomePageProps {
  readonly state: ScreenStateModel;
  readonly assignments: readonly RefereeAssignment[];
  readonly onOpenAssignment: (assignmentId: string) => void;
  readonly onOpenMatchCenter: (matchId: string) => void;
}

export interface AgentHomePageProps {
  readonly state: ScreenStateModel;
  readonly consentPendingCount: number;
  readonly opportunityCount: number;
  readonly onOpenPlayers: SyncAction;
  readonly onOpenOpportunities: SyncAction;
}

export interface AnalystWorkspacePageProps {
  readonly state: ScreenStateModel;
  readonly sources: readonly ApprovedDataSource[];
  readonly selectedSourceId: string | null;
  readonly onSelectSource: (sourceId: string) => void;
  readonly onCreateReport: AsyncAction;
}

export interface CoreScreenRegistryEntry {
  readonly id: CoreScreenId;
  readonly route: string;
  readonly supportsVisualMode: boolean;
  readonly supportsOfflineCache: boolean;
}

