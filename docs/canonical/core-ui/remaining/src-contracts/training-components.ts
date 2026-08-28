import type {
  AppDataState,
  ParticipationState,
  SafeError,
  TrainingSessionView,
  TrainingSummary,
} from './contracts';

export interface TrainingRemoteState {
  state: AppDataState;
  staleAt?: string;
  updatedAt?: string;
  error?: SafeError;
  onRetry?: () => void;
}

export interface TrainingHomeProps extends TrainingRemoteState {
  upcoming: TrainingSummary[];
  recent: TrainingSummary[];
  onOpenSession: (sessionId: string) => void;
  onOpenSchedule: () => void;
}

export interface UpcomingTrainingCardProps {
  session: TrainingSummary;
  onOpen: (sessionId: string) => void;
}

export interface TrainingSessionDetailProps extends TrainingRemoteState {
  session: TrainingSessionView | null;
  onParticipationChange: (state: Extract<ParticipationState, 'GOING' | 'NOT_GOING' | 'LATE'>) => void;
  onOpenHistory?: () => void;
}

export interface TrainingScheduleProps extends TrainingRemoteState {
  sessions: TrainingSummary[];
  selectedDate?: string;
  onSelectDate: (dateIso: string) => void;
  onOpenSession: (sessionId: string) => void;
}

export interface ParticipationControlProps {
  current: ParticipationState;
  allowed: Array<Extract<ParticipationState, 'GOING' | 'NOT_GOING' | 'LATE'>>;
  disabled: boolean;
  saving: boolean;
  onChange: (state: Extract<ParticipationState, 'GOING' | 'NOT_GOING' | 'LATE'>) => void;
}

export interface TrainingHistoryProjectionSeamProps {
  available: boolean;
  count?: number;
  label: string;
  onOpen?: () => void;
}

/**
 * HARD CONTRACT:
 * These props intentionally contain no wearable metric, AI score, fatigue score,
 * speed metric, heart-rate metric, or sample analysis field.
 */
