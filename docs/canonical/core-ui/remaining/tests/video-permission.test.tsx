import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { VideoAssetView } from '../src-contracts/contracts';

function ReferenceVideoDetail({ video }: { video: VideoAssetView }) {
  if (!video.capabilities.canView) {
    return <main><h1>영상을 볼 수 없습니다</h1></main>;
  }
  return <main><h1>{video.title}</h1><video aria-label={video.title} controls /></main>;
}

const denied: VideoAssetView = {
  videoId: 'v-foreign',
  assetId: 'a-foreign',
  title: '노출되면 안 되는 제목',
  ownership: { ownerType: 'PLAYER', ownerPlayerId: 'minor-other', sourceContext: 'TRAINING' },
  visibility: 'PRIVATE',
  containsMinorPrivateMedia: true,
  representativeForCareer: false,
  playback: { state: 'UNAVAILABLE' },
  capabilities: { canView: false, canShare: false, canReport: false, canSetRepresentative: false },
  meta: { stale: false, offlineCache: false },
};

describe('video permission projection', () => {
  it('does not leak denied media metadata', () => {
    render(<ReferenceVideoDetail video={denied} />);
    expect(screen.getByText('영상을 볼 수 없습니다')).toBeTruthy();
    expect(screen.queryByText('노출되면 안 되는 제목')).toBeNull();
    expect(screen.queryByRole('video')).toBeNull();
  });
});
