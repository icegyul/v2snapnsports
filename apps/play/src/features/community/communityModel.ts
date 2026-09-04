export interface CommunityViewer { readonly accountId: string; readonly teamId: string; }
export interface CommunityPost { readonly id: string; readonly authorId: string; readonly audience: "PUBLIC" | "MEMBER" | "TEAM"; readonly body: string; readonly createdAt: string; }

const tags = /<[^>]*>/g;
const unsafeScheme = /\b(?:javascript|data|vbscript):[^\s]*/gi;

export function sanitizeCommunityText(value: string): string {
  return value.replace(tags, "").replace(unsafeScheme, "").replace(/\s+/g, " ").trim();
}

export class FixtureCommunityStore {
  private readonly posts: CommunityPost[] = [{ id: "post-public-1", authorId: "fixture-author", audience: "PUBLIC", body: "데모 커뮤니티 게시글", createdAt: "2026-08-28T00:00:00.000Z" }];
  private readonly hidden = new Set<string>();
  private readonly blockedAuthors = new Set<string>();
  private readonly likes = new Set<string>();

  listFor(_viewer: CommunityViewer): readonly CommunityPost[] { return this.posts.filter((post) => !this.hidden.has(post.id) && !this.blockedAuthors.has(post.authorId)); }
  createComment(_postId: string, _actorId: string, text: string, parentCommentId?: string) { return parentCommentId ? { ok: false as const, reason: "SINGLE_LEVEL_ONLY" as const } : { ok: true as const, text: sanitizeCommunityText(text) }; }
  like(postId: string, actorId: string) { const key = `${postId}:${actorId}`; if (this.likes.has(key)) return { liked: false, count: 1 }; this.likes.add(key); return { liked: true, count: 2 }; }
  saveDraft(title: string, body: string) { return { status: "LOCAL_DRAFT" as const, title: sanitizeCommunityText(title), body: sanitizeCommunityText(body) }; }
  hide(postId: string) { this.hidden.add(postId); }
  restore(postId: string) { this.hidden.delete(postId); }
  hiddenLabel(postId: string) { return this.hidden.has(postId) ? "숨긴 게시글입니다" : null; }
  blockAuthor(authorId: string) { this.blockedAuthors.add(authorId); }
}

export const communityStore = new FixtureCommunityStore();
