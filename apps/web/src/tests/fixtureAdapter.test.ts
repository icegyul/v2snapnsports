import { describe, expect, it } from "vitest";
import { FixtureLegacyAdapter, ProductionAdapterDisabledError, ProductionLegacyAdapter } from "../adapters/legacyAdapters";

describe("legacy adapter boundary", () => {
  it("returns a synthetic player, guardian, team, and schedule without a network call", async () => {
    const adapter = new FixtureLegacyAdapter();
    const [player, guardian, teams, schedule] = await Promise.all([
      adapter.getCurrentPlayer(),
      adapter.getGuardianRelationship(),
      adapter.getTeams(),
      adapter.getSchedule()
    ]);

    expect(player.source).toBe("SYNTHETIC_FIXTURE");
    expect(guardian?.source).toBe("SYNTHETIC_FIXTURE");
    expect(teams[0]?.source).toBe("SYNTHETIC_FIXTURE");
    expect(schedule).toHaveLength(2);
  });

  it("keeps the production adapter disabled", async () => {
    await expect(new ProductionLegacyAdapter().getCurrentUser()).rejects.toBeInstanceOf(ProductionAdapterDisabledError);
  });
});
