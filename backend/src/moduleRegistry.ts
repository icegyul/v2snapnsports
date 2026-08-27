export type BackendLayer = "domain" | "application" | "infrastructure" | "interface";
export type BackendModuleName = "identity" | "organization" | "team" | "player" | "guardian" | "role" | "schedule" | "training" | "match" | "tactics" | "stadium" | "community" | "media" | "notification" | "career" | "scouting" | "communication" | "safeguarding" | "privacy" | "earthus" | "admin";

export interface BackendModuleDescriptor {
  name: BackendModuleName;
  layers: readonly BackendLayer[];
  foundationStatus: "PARTIAL" | "NOT_IMPLEMENTED" | "HARD_DISABLED" | "RESERVED";
}

const layers = ["domain", "application", "infrastructure", "interface"] as const;
const partialModules: BackendModuleName[] = [
  "identity", "organization", "team", "player", "guardian", "role", "schedule", "training", "match", "stadium", "community", "career", "scouting", "communication", "safeguarding", "privacy", "earthus", "admin"
];
const reservedModules: BackendModuleName[] = ["tactics", "media", "notification"];

export const backendModules: readonly BackendModuleDescriptor[] = [
  ...partialModules.map((name) => ({ name, layers, foundationStatus: "PARTIAL" as const })),
  ...reservedModules.map((name) => ({ name, layers, foundationStatus: "RESERVED" as const }))
];
