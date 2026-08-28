import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CommunityPost } from '../src-contracts/contracts';

function ReferenceCommunityFeed({ posts }: { posts: CommunityPost[] }) {
  return (
    <main aria-label="커뮤니티">
      {posts.map((post) =>
        post.moderationState === 'VISIBLE' ? (
          <article key={post.postId}>
            <h2>{post.title ?? '게시물'}</h2>
            <p>{post.sanitizedBody}</p>
          </article>
        ) : (
          <article key={post.postId} aria-label="숨겨진 게시물">
            <p>현재 표시할 수 없는 게시물입니다.</p>
          </article>
        ),
      )}
    </main>
  );
}

const basePost: CommunityPost = {
  postId: 'p1',
  contentType: 'POST',
  sanitizedBody: '훈련 후 느낀 점',
  visibility: 'TEAM',
  author: { safeLabel: '선수', isBlockedByViewer: false },
  media: [],
  likeCount: 0,
  commentCount: 0,
  viewerLiked: false,
  moderationState: 'VISIBLE',
  capabilities: {
    canView: true, canCreate: true, canEditOwn: true, canDeleteOwn: true,
    canReact: true, canComment: true, canReport: true, canBlock: true,
    canModerate: false, canShare: false,
  },
  createdAt: '2026-08-28T09:00:00+09:00',
  meta: { stale: false, offlineCache: false },
};

describe('community UI contract', () => {
  it('renders a visible post as an article', () => {
    render(<ReferenceCommunityFeed posts={[basePost]} />);
    expect(screen.getByRole('article')).toBeTruthy();
    expect(screen.getByText('훈련 후 느낀 점')).toBeTruthy();
  });

  it('replaces hidden content instead of rendering its body', () => {
    render(<ReferenceCommunityFeed posts={[{ ...basePost, moderationState: 'HIDDEN', sanitizedBody: '비공개 원문' }]} />);
    expect(screen.queryByText('비공개 원문')).toBeNull();
    expect(screen.getByLabelText('숨겨진 게시물')).toBeTruthy();
  });
});
