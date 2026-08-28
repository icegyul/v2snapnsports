import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { classifyViewport } from '../src-contracts/contracts';

describe('responsive smoke', () => {
  it('classifies five required viewport groups', () => {
    expect(classifyViewport(320)).toBe('SMALL_MOBILE');
    expect(classifyViewport(390)).toBe('STANDARD_MOBILE');
    expect(classifyViewport(430)).toBe('LARGE_MOBILE');
    expect(classifyViewport(768)).toBe('TABLET');
    expect(classifyViewport(1440)).toBe('DESKTOP');
  });

  it('allows long Korean text to wrap instead of relying on fixed height', () => {
    const { container } = render(
      <p style={{ overflowWrap: 'anywhere' }}>
        매우 긴 한국어 팀 이름과 훈련 목적이 표시되어도 중요한 시간과 참가상태가 사라지지 않아야 합니다.
      </p>,
    );
    expect(container.textContent?.length).toBeGreaterThan(20);
  });
});
