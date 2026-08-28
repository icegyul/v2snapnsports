import { describe, expect, it } from 'vitest';
import {
  transitionStadiumExperience,
  resolveEntryMode,
} from '../src-contracts/state-machines';
import { PLAYER_ROUTES, resolveInvalidPlayerRoute } from '../src-contracts/routes';

describe('player canonical flow', () => {
  it('transitions exterior to spatial home in order', () => {
    let state = 'EXTERIOR' as const;
    state = transitionStadiumExperience(state, 'START') as any;
    expect(state).toBe('APPROACH');
    state = transitionStadiumExperience(state, 'APPROACH_COMPLETE') as any;
    expect(state).toBe('PITCH_ENTRY');
    state = transitionStadiumExperience(state, 'PITCH_ENTRY_COMPLETE') as any;
    expect(state).toBe('MY_POSITION');
    state = transitionStadiumExperience(state, 'POSITION_REACHED') as any;
    expect(state).toBe('TEAM_REVEAL');
    state = transitionStadiumExperience(state, 'FORMATION_READY') as any;
    expect(state).toBe('SPATIAL_HOME');
  });

  it('supports direct canonical route contracts', () => {
    expect(PLAYER_ROUTES.home).toBe('/home');
    expect(PLAYER_ROUTES.trainingSession('s1')).toBe('/training/s1');
    expect(PLAYER_ROUTES.careerPassport).toBe('/player/me/career');
  });

  it('falls back to static when WebGL is unavailable', () => {
    expect(resolveEntryMode({
      webgl2: false,
      accessibilityStatic: false,
      repeated3dFailure: false,
      lowPowerOrThermal: false,
      deviceTier: 'HIGH',
      assetsReady: true,
      firstSuccessfulEntry: true,
      userRequestedFull: false,
    })).toBe('STATIC');
  });

  it('uses safe home for invalid player route', () => {
    expect(resolveInvalidPlayerRoute()).toBe('/home');
  });
});
