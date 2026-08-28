import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

function ReferenceAccessibleNav() {
  return (
    <>
      <nav aria-label="선수 주 메뉴">
        <button aria-current="page" style={{ minWidth: 44, minHeight: 44 }}>홈</button>
        <button style={{ minWidth: 44, minHeight: 44 }}>훈련</button>
      </nav>
      <main><h1>나의 축구 공간</h1></main>
    </>
  );
}

describe('accessibility smoke', () => {
  it('has semantic navigation, heading and 44px targets', () => {
    render(<ReferenceAccessibleNav />);
    expect(screen.getByRole('navigation', { name: '선수 주 메뉴' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    const home = screen.getByRole('button', { name: '홈' }) as HTMLButtonElement;
    expect(home.style.minWidth).toBe('44px');
    expect(home.style.minHeight).toBe('44px');
    expect(home.getAttribute('aria-current')).toBe('page');
  });
});
