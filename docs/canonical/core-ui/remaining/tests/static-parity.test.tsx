import { describe, expect, it } from 'vitest';
import { getMissingStaticParityFields } from '../src-contracts/state-machines';
import type { PlayerHomeProjection } from '../src-contracts/contracts';

const complete: PlayerHomeProjection = {
  player: { athleteId: 'a1', displayName: '선수 7' },
  teamContext: { teamId: 't1', teamName: 'U17 A' },
  formation: {
    teamId: 't1', teamName: 'U17 A', formationSystem: '4-3-3',
    players: [{ athleteId: 'a1', normalizedX: 0.5, normalizedY: 0.7, isMe: true }],
  },
  nextTraining: {
    sessionId: 's1', teamId: 't1', teamName: 'U17 A', title: '기술 훈련',
    startsAt: '2026-08-28T18:30:00+09:00', participation: 'GOING',
    status: 'UPCOMING', contextBadges: [], coachApproved: true,
    meta: { stale: false, offlineCache: false },
  },
  nextMatch: { matchId: 'm1', title: '다음 경기', startsAt: '2026-08-30T14:00:00+09:00' },
  primaryAction: { kind: 'TRAINING', label: '훈련 보기', route: '/training/s1' },
  visualMode: 'STATIC',
  meta: { stale: false, offlineCache: false },
};

describe('STATIC parity', () => {
  it('keeps all required information', () => {
    expect(getMissingStaticParityFields(complete)).toEqual([]);
  });

  it('detects missing formation instead of silently degrading business data', () => {
    expect(getMissingStaticParityFields({ ...complete, formation: undefined })).toContain('formation');
  });
});
