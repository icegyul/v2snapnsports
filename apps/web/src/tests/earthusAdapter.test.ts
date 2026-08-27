import { describe, expect, it } from "vitest";
import { FixtureEarthusContextAdapter } from "../adapters/EarthusContextAdapter";

describe("Earthus soft dependency", () => {
  it("returns unavailable context without failing schedule data", async () => {
    const context = await new FixtureEarthusContextAdapter("unavailable").getEventContext({ venueId: "venue-fixture", startsAt: "2026-08-28T10:00:00+09:00" });
    expect(context).toEqual({ status: "UNAVAILABLE" });
  });
});
