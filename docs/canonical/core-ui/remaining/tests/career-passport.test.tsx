import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { hasCareerProvenance, type CareerEvent } from '../src-contracts/contracts';

const event: CareerEvent = {
  careerEventId: 'ce1',
  athleteId: 'ath1',
  type: 'TEAM_JOINED',
  title: 'U17 A팀 합류',
  occurredAt: '2026-03-01T00:00:00+09:00',
  visibility: 'PLAYER_GUARDIAN',
  source: { type: 'TEAM_MEMBERSHIP', id: 'membership1', version: 4, verifiedState: 'VERIFIED' },
};

function ReferenceCareerEvent({ item }: { item: CareerEvent }) {
  if (!hasCareerProvenance(item)) return <p>검증할 수 없는 기록</p>;
  return <article><h2>{item.title}</h2><p>검증된 기록</p></article>;
}

describe('career passport contract', () => {
  it('requires provenance', () => {
    expect(hasCareerProvenance(event)).toBe(true);
    render(<ReferenceCareerEvent item={event} />);
    expect(screen.getByText('U17 A팀 합류')).toBeTruthy();
  });

  it('contains no synthetic ability/pro potential field in rendered event', () => {
    render(<ReferenceCareerEvent item={event} />);
    expect(document.body.textContent ?? '').not.toMatch(/potential|ability score|AI 평가|프로 가능성/i);
  });
});
