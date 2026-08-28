import { describe, expect, it } from 'vitest';
import { isSafeCommunityUrl } from '../src-contracts/contracts';

describe('community safety contract', () => {
  it('allows http/https and safe relative routes', () => {
    expect(isSafeCommunityUrl('https://example.com/x')).toBe(true);
    expect(isSafeCommunityUrl('http://example.com/x')).toBe(true);
    expect(isSafeCommunityUrl('/community/post/1')).toBe(true);
  });

  it('blocks unsafe schemes and protocol-relative URLs', () => {
    for (const value of [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'file:///etc/passwd',
      'vbscript:msgbox(1)',
      '//evil.example/path',
    ]) {
      expect(isSafeCommunityUrl(value)).toBe(false);
    }
  });
});
