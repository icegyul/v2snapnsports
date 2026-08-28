import { describe, expect, it } from 'vitest';
import {
  HARD_DISABLED_FEATURES,
  isHardDisabledFeatureVisible,
} from '../src-contracts/contracts';

describe('feature visibility hard gate', () => {
  it('never renders EPTS/CAMERA_AI/SPORTS_AI in normal user UI', () => {
    expect(HARD_DISABLED_FEATURES).toEqual(['EPTS', 'CAMERA_AI', 'SPORTS_AI']);
    for (const feature of HARD_DISABLED_FEATURES) {
      expect(isHardDisabledFeatureVisible(feature)).toBe(false);
    }
  });

  it('does not treat unrelated features as hard-disabled', () => {
    expect(isHardDisabledFeatureVisible('COMMUNITY')).toBe(true);
  });
});
