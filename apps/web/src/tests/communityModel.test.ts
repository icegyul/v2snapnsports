import { describe, expect, it } from "vitest";
import { FixtureCommunityStore, sanitizeCommunityText } from "../features/community/communityModel";

describe("fixture Community safety", () => {
  it("renders user text as text and rejects unsafe URL schemes", () => {
    expect(sanitizeCommunityText("<img src=x onerror=alert(1)>안전한 글 javascript:alert(1)")).toBe("안전한 글");
  });

  it("enforces audience, single-level comments, a local draft, and one like per actor", () => {
    const store = new FixtureCommunityStore();
    expect(store.listFor({ accountId: "fixture-player", teamId: "demo-u17-a" })).toHaveLength(1);
    expect(store.listFor({ accountId: "other", teamId: "other-team" })).toHaveLength(1);
    expect(store.createComment("post-public-1", "fixture-player", "좋아요", "parent-id")).toEqual({ ok: false, reason: "SINGLE_LEVEL_ONLY" });
    expect(store.like("post-public-1", "fixture-player").liked).toBe(true);
    expect(store.like("post-public-1", "fixture-player").liked).toBe(false);
    expect(store.saveDraft("제목", "본문").status).toBe("LOCAL_DRAFT");
  });

  it("removes blocked and hidden posts without pretending they were deleted", () => {
    const store = new FixtureCommunityStore();
    store.hide("post-public-1");
    expect(store.hiddenLabel("post-public-1")).toBe("숨긴 게시글입니다");
    store.restore("post-public-1");
    store.blockAuthor("fixture-author");
    expect(store.listFor({ accountId: "fixture-player", teamId: "demo-u17-a" })).toHaveLength(0);
  });
});
