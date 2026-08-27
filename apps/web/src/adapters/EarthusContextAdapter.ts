import type { EarthusContext } from "../api/contracts";

export interface EarthusContextAdapter {
  getEventContext(input: { venueId: string; startsAt: string }): Promise<EarthusContext>;
}

export class FixtureEarthusContextAdapter implements EarthusContextAdapter {
  constructor(private readonly mode: "fresh" | "unavailable" = "unavailable") {}

  async getEventContext(_input: { venueId: string; startsAt: string }): Promise<EarthusContext> {
    return this.mode === "fresh"
      ? { status: "FRESH", issuedAt: "2026-08-28T00:00:00.000Z", summary: "Synthetic venue context" }
      : { status: "UNAVAILABLE" };
  }
}
