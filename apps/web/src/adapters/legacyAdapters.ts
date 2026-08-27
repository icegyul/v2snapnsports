import type { GuardianRelationship, PlayerProfile, ScheduleItem, TeamSummary, UserProfile } from "../api/contracts";

export interface LegacyUserAdapter { getCurrentUser(): Promise<UserProfile>; }
export interface LegacyPlayerAdapter { getCurrentPlayer(): Promise<PlayerProfile>; }
export interface LegacyTeamAdapter { getTeams(): Promise<TeamSummary[]>; }
export interface LegacyGuardianAdapter { getGuardianRelationship(): Promise<GuardianRelationship | null>; }
export interface LegacyScheduleAdapter { getSchedule(): Promise<ScheduleItem[]>; }

export type LegacyAdapter = LegacyUserAdapter & LegacyPlayerAdapter & LegacyTeamAdapter & LegacyGuardianAdapter & LegacyScheduleAdapter;

const capturedAt = "2026-08-28T00:00:00.000Z";

export class FixtureLegacyAdapter implements LegacyAdapter {
  async getCurrentUser(): Promise<UserProfile> {
    return { source: "SYNTHETIC_FIXTURE", capturedAt, accountId: "fixture-player", displayName: "Fixture Player 08", rolePreference: "PLAYER" };
  }

  async getCurrentPlayer(): Promise<PlayerProfile> {
    return { source: "SYNTHETIC_FIXTURE", capturedAt, athleteId: "fixture-player", displayName: "Fixture Player 08", teamId: "fixture-u15-blue", position: "CM", jerseyNumber: 8 };
  }

  async getTeams(): Promise<TeamSummary[]> {
    return [{ source: "SYNTHETIC_FIXTURE", capturedAt, teamId: "fixture-u15-blue", tenantId: "fixture-academy", name: "Fixture U15 Blue", formation: "4-3-3" }];
  }

  async getGuardianRelationship(): Promise<GuardianRelationship> {
    return { source: "SYNTHETIC_FIXTURE", capturedAt, guardianId: "fixture-guardian", athleteId: "fixture-player", type: "PRIMARY", active: true };
  }

  async getSchedule(): Promise<ScheduleItem[]> {
    return [
      { source: "SYNTHETIC_FIXTURE", capturedAt, id: "fixture-training-01", kind: "TRAINING", title: "Fixture Training", startsAt: "2026-08-28T18:00:00+09:00", venueId: "fixture-venue" },
      { source: "SYNTHETIC_FIXTURE", capturedAt, id: "fixture-match-01", kind: "MATCH", title: "Fixture U15 Blue vs Fixture Academy", startsAt: "2026-08-29T15:00:00+09:00", venueId: "fixture-venue" }
    ];
  }
}

export class ProductionAdapterDisabledError extends Error {
  constructor() {
    super("Production Legacy adapter is disabled in the V2 foundation.");
    this.name = "ProductionAdapterDisabledError";
  }
}

export class ProductionLegacyAdapter implements LegacyAdapter {
  private disabled<T>(): Promise<T> { return Promise.reject(new ProductionAdapterDisabledError()); }
  getCurrentUser(): Promise<UserProfile> { return this.disabled(); }
  getCurrentPlayer(): Promise<PlayerProfile> { return this.disabled(); }
  getTeams(): Promise<TeamSummary[]> { return this.disabled(); }
  getGuardianRelationship(): Promise<GuardianRelationship | null> { return this.disabled(); }
  getSchedule(): Promise<ScheduleItem[]> { return this.disabled(); }
}
