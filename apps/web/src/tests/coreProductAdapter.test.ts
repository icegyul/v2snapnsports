import { describe, expect, it } from "vitest";
import { FixtureCoreProductAdapter } from "../adapters/fixtureCoreProductAdapter";

describe("fixture Core Product adapter", () => {
  it("returns synthetic stadium data without performance or AI metrics", async () => {
    const stadium = await new FixtureCoreProductAdapter().getStadiumHome();

    expect(stadium.source).toBe("SYNTHETIC_FIXTURE");
    expect(stadium.player.displayName).toBe("데모 선수");
    expect(stadium).not.toHaveProperty("metrics");
  });

  it("keeps formation teammates private and limits Spatial Home to five anchors", async () => {
    const adapter = new FixtureCoreProductAdapter();
    const [formation, spatial] = await Promise.all([adapter.getFormation(), adapter.getSpatialHome()]);

    expect(formation.teammates.every((teammate) => teammate.publicName === null && teammate.avatarUrl === null)).toBe(true);
    expect(spatial.anchors).toHaveLength(5);
    expect(spatial.anchors.map((anchor) => anchor.kind)).toEqual(["PLAYER", "TRAINING", "TEAM", "CAREER", "VIDEO"]);
  });

  it("keeps external fixture media attributable and non-autoplaying", async () => {
    const video = await new FixtureCoreProductAdapter().getVideoSurface();

    expect(video.source).toBe("SYNTHETIC_FIXTURE");
    expect(video.autoplay).toBe(false);
    expect(video.publisherName).toBeTruthy();
  });
});
