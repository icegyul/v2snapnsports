import type {
  AppDataState,
  PlayerFormationProjection,
  PlayerHomeProjection,
  PrimaryPlayerTab,
  SafeError,
  VisualMode,
  ViewportClass,
} from './contracts';

export type StadiumExperienceStage =
  | 'EXTERIOR'
  | 'APPROACH'
  | 'PITCH_ENTRY'
  | 'MY_POSITION'
  | 'TEAM_REVEAL'
  | 'SPATIAL_HOME';

export interface PlayerFlowRemoteState {
  state: AppDataState;
  error?: SafeError;
  onRetry?: () => void;
}

export interface PlayerFlowSceneProps extends PlayerFlowRemoteState {
  stage: StadiumExperienceStage;
  visualMode: VisualMode;
  home: PlayerHomeProjection | null;
  formation: PlayerFormationProjection | null;
  reducedMotion: boolean;
  onAdvance: () => void;
  onSkipToSpatialHome: () => void;
  onVisualModeFailure: (mode: VisualMode, reason: string) => void;
}

export interface StaticPlayerHomeProps extends PlayerFlowRemoteState {
  home: PlayerHomeProjection;
  activeTab: PrimaryPlayerTab;
  onNavigateTab: (tab: PrimaryPlayerTab) => void;
  onOpenPlayerCard: () => void;
  onOpenTraining: () => void;
  onOpenMatch: () => void;
}

export interface PlayerBottomNavigationProps {
  active: PrimaryPlayerTab;
  safeAreaBottomPx?: number;
  onNavigate: (tab: PrimaryPlayerTab) => void;
}

export interface MyPlayerCardProps {
  home: PlayerHomeProjection;
  onOpenCareerPassport: () => void;
}

export interface TeamFormationViewProps {
  formation: PlayerFormationProjection;
  visualMode: VisualMode;
  onOpenPlayer?: (athleteId: string) => void;
}

export interface ResponsiveShellProps {
  viewport: ViewportClass;
  landscape: boolean;
  keyboardOpen: boolean;
  reducedMotion: boolean;
  children: unknown;
}
