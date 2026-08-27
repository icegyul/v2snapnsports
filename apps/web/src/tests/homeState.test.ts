import { describe, expect, it } from "vitest";
import { selectHomeState } from "../features/home/homeState";

describe("home state priority", () => {
  it("prioritizes the nearest scheduled match over a noncritical message", () => {
    expect(selectHomeState([
      { id: "notice", kind: "NOTICE", startsAt: "2026-08-29T12:00:00+09:00" },
      { id: "match", kind: "MATCH", startsAt: "2026-08-28T18:00:00+09:00" }
    ])).toMatchObject({ id: "match", kind: "MATCH" });
  });
});
