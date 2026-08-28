import type {
  AppDataState,
  CareerAchievementView,
  CareerEvent,
  CareerPassportView,
  CareerSeasonChapter,
  CareerVisibility,
  SafeError,
  VideoAssetView,
} from './contracts';

export interface CareerRemoteState {
  state: AppDataState;
  updatedAt?: string;
  error?: SafeError;
  onRetry?: () => void;
}

export interface CareerOverviewProps extends CareerRemoteState {
  passport: CareerPassportView | null;
  onOpenTimeline: () => void;
  onOpenSeason: (seasonId: string) => void;
  onOpenVideos: () => void;
  onOpenAchievements: () => void;
  onOpenShare: () => void;
}

export interface CareerTimelineProps extends CareerRemoteState {
  events: CareerEvent[];
  onOpenEvent: (eventId: string) => void;
}

export interface CareerSeasonHistoryProps {
  seasons: CareerSeasonChapter[];
  currentSeasonId?: string;
  onOpenSeason: (seasonId: string) => void;
}

export interface CareerTeamHistoryItem {
  teamId?: string;
  teamName: string;
  startsAt?: string;
  endsAt?: string;
  sourceEventIds: string[];
}

export interface CareerTeamHistoryProps {
  items: CareerTeamHistoryItem[];
}

export interface CareerPositionHistoryItem {
  position: string;
  startsAt?: string;
  endsAt?: string;
  sourceEventId: string;
}

export interface CareerPositionHistoryProps {
  items: CareerPositionHistoryItem[];
}

export interface CareerMilestonesProps {
  items: CareerEvent[];
  onOpen: (eventId: string) => void;
}

export interface CareerVideosProps {
  videos: VideoAssetView[];
  onOpenVideo: (videoId: string) => void;
  onSetRepresentative: (videoId: string) => void;
}

export interface CareerAchievementsProps {
  achievements: CareerAchievementView[];
}

export interface CareerSharePortfolioSeamProps {
  currentVisibility: CareerVisibility;
  allowedVisibilities: CareerVisibility[];
  minorPolicyLabel?: string;
  selectedVideoIds: string[];
  saving: boolean;
  onVisibilityChange: (visibility: CareerVisibility) => void;
  onSelectedVideoIdsChange: (videoIds: string[]) => void;
  onSave: () => void;
}

/**
 * HARD CONTRACT:
 * No pro-potential score, AI rating, synthetic ability score, or source-less career record.
 */
