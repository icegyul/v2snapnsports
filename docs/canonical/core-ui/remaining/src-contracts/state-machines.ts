import type {
  AppDataState,
  PlayerHomeProjection,
  VisualMode,
} from './contracts';

export interface ViewState {
  status: AppDataState;
  hasData: boolean;
  stale: boolean;
  updatedAt?: string;
}

export type ViewEvent =
  | { type: 'LOAD' }
  | { type: 'RESOLVE_READY'; hasData: boolean; stale?: boolean; updatedAt?: string }
  | { type: 'FAIL'; hasCachedData: boolean; offline: boolean }
  | { type: 'FORBID' }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_DONE'; stale?: boolean; updatedAt?: string }
  | { type: 'SYNC_START' }
  | { type: 'SYNC_DONE'; stale?: boolean; updatedAt?: string }
  | { type: 'SET_READ_ONLY' };

export function reduceViewState(current: ViewState, event: ViewEvent): ViewState {
  switch (event.type) {
    case 'LOAD':
      return { ...current, status: 'LOADING' };
    case 'RESOLVE_READY':
      if (!event.hasData) return { status: 'EMPTY', hasData: false, stale: false, updatedAt: event.updatedAt };
      return {
        status: event.stale ? 'STALE' : 'READY',
        hasData: true,
        stale: Boolean(event.stale),
        updatedAt: event.updatedAt,
      };
    case 'FAIL':
      if (event.offline) {
        return {
          status: 'OFFLINE',
          hasData: event.hasCachedData || current.hasData,
          stale: event.hasCachedData || current.hasData,
          updatedAt: current.updatedAt,
        };
      }
      return { status: 'ERROR', hasData: current.hasData, stale: current.stale, updatedAt: current.updatedAt };
    case 'FORBID':
      return { status: 'FORBIDDEN', hasData: false, stale: false };
    case 'SAVE_START':
      return { ...current, status: 'SAVING' };
    case 'SAVE_DONE':
      return { status: event.stale ? 'STALE' : 'READY', hasData: true, stale: Boolean(event.stale), updatedAt: event.updatedAt };
    case 'SYNC_START':
      return { ...current, status: 'SYNCING' };
    case 'SYNC_DONE':
      return { status: event.stale ? 'STALE' : 'READY', hasData: true, stale: Boolean(event.stale), updatedAt: event.updatedAt };
    case 'SET_READ_ONLY':
      return { ...current, status: 'READ_ONLY' };
    default: {
      const neverEvent: never = event;
      return neverEvent;
    }
  }
}

export type StadiumExperienceState =
  | 'EXTERIOR'
  | 'APPROACH'
  | 'PITCH_ENTRY'
  | 'MY_POSITION'
  | 'TEAM_REVEAL'
  | 'SPATIAL_HOME';

export type StadiumExperienceEvent =
  | 'START'
  | 'APPROACH_COMPLETE'
  | 'PITCH_ENTRY_COMPLETE'
  | 'POSITION_REACHED'
  | 'FORMATION_READY'
  | 'TEAM_REVEAL_COMPLETE'
  | 'SKIP'
  | 'RESET';

export function transitionStadiumExperience(
  current: StadiumExperienceState,
  event: StadiumExperienceEvent,
): StadiumExperienceState {
  if (event === 'RESET') return 'EXTERIOR';
  if (event === 'SKIP') return 'SPATIAL_HOME';

  const transitions: Record<StadiumExperienceState, Partial<Record<StadiumExperienceEvent, StadiumExperienceState>>> = {
    EXTERIOR: { START: 'APPROACH' },
    APPROACH: { APPROACH_COMPLETE: 'PITCH_ENTRY' },
    PITCH_ENTRY: { PITCH_ENTRY_COMPLETE: 'MY_POSITION' },
    MY_POSITION: { POSITION_REACHED: 'TEAM_REVEAL' },
    TEAM_REVEAL: { FORMATION_READY: 'SPATIAL_HOME', TEAM_REVEAL_COMPLETE: 'SPATIAL_HOME' },
    SPATIAL_HOME: {},
  };

  return transitions[current][event] ?? current;
}

export const VISUAL_MODE_ORDER: VisualMode[] = ['FULL', 'FAST', 'LIGHT', 'STATIC'];

export function downgradeVisualMode(current: VisualMode): VisualMode {
  const index = VISUAL_MODE_ORDER.indexOf(current);
  if (index < 0 || index >= VISUAL_MODE_ORDER.length - 1) return 'STATIC';
  return VISUAL_MODE_ORDER[index + 1];
}

export function resolveEntryMode(input: {
  webgl2: boolean;
  accessibilityStatic: boolean;
  repeated3dFailure: boolean;
  lowPowerOrThermal: boolean;
  deviceTier: 'LOW' | 'MID' | 'HIGH';
  assetsReady: boolean;
  firstSuccessfulEntry: boolean;
  userRequestedFull: boolean;
}): VisualMode {
  if (!input.webgl2 || input.accessibilityStatic || input.repeated3dFailure) return 'STATIC';
  if (input.lowPowerOrThermal || input.deviceTier === 'LOW') return 'LIGHT';
  if ((input.firstSuccessfulEntry || input.userRequestedFull) && input.assetsReady) return 'FULL';
  return 'FAST';
}

export const STATIC_PARITY_REQUIRED_FIELDS = [
  'player',
  'teamContext',
  'formation',
  'nextTraining',
  'nextMatch',
  'primaryAction',
] as const;

export function getMissingStaticParityFields(home: PlayerHomeProjection): string[] {
  const missing: string[] = [];
  if (!home.player?.athleteId) missing.push('player');
  if (!home.teamContext) missing.push('teamContext');
  if (!home.formation) missing.push('formation');
  if (!home.nextTraining) missing.push('nextTraining');
  if (!home.nextMatch) missing.push('nextMatch');
  if (!home.primaryAction) missing.push('primaryAction');
  return missing;
}
