export type SourceKind = "SYNTHETIC_FIXTURE" | "LEGACY_V1";
export type ManagerRole = "COACH" | "TEAM_MANAGER" | "CLUB_DIRECTOR" | "REFEREE" | "AGENT" | "ANALYST";
export type EventKind = "TRAINING" | "MATCH" | "NOTICE";

export interface Provenanced {
  source: SourceKind;
  capturedAt: string;
}

export interface UserProfile extends Provenanced {
  accountId: string;
  displayName: string;
  rolePreference: "PLAYER" | "MANAGER" | ManagerRole;
}

export interface PlayerProfile extends Provenanced {
  athleteId: string;
  displayName: string;
  teamId: string;
  position: "GK" | "DF" | "CM" | "FW";
  jerseyNumber: number;
}

export interface GuardianRelationship extends Provenanced {
  guardianId: string;
  athleteId: string;
  type: "PRIMARY" | "CO" | "EMERGENCY";
  active: boolean;
}

export interface TeamSummary extends Provenanced {
  teamId: string;
  tenantId: string;
  name: string;
  formation: "4-3-3";
}

export interface ScheduleItem extends Provenanced {
  id: string;
  kind: EventKind;
  title: string;
  startsAt: string;
  venueId: string;
}

export interface EarthusContext {
  status: "FRESH" | "STALE" | "PARTIAL" | "UNAVAILABLE";
  issuedAt?: string;
  summary?: string;
}
