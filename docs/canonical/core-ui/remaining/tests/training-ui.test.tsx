import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TrainingSessionView } from '../src-contracts/contracts';

function ReferenceTrainingDetail({ session }: { session: TrainingSessionView }) {
  return (
    <main>
      <h1>{session.title}</h1>
      <p>{session.objective}</p>
      <p>{session.venue?.name}</p>
      <p>참가 상태: {session.participation}</p>
    </main>
  );
}

const session: TrainingSessionView = {
  sessionId: 's1',
  teamId: 't1',
  teamName: 'U17 A',
  title: '기술 훈련',
  objective: '패스 선택과 움직임',
  startsAt: '2026-08-28T18:30:00+09:00',
  venue: { name: '훈련장 A' },
  participation: 'GOING',
  status: 'UPCOMING',
  contextBadges: [],
  coachApproved: true,
  participationCanChange: true,
  historyProjectionAvailable: true,
  meta: { stale: false, offlineCache: false },
};

describe('player training UI contract', () => {
  it('shows only allowed manual/schedule information', () => {
    render(<ReferenceTrainingDetail session={session} />);
    expect(screen.getByText('기술 훈련')).toBeTruthy();
    expect(screen.getByText('패스 선택과 움직임')).toBeTruthy();
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/fatigue|speed|heart.?rate|AI score|피로도|속도|심박|AI 점수/i);
  });
});
