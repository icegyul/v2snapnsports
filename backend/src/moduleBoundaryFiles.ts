import type { BackendLayer, BackendModuleName } from "./moduleRegistry";

export interface ModuleBoundaryFile {
  name: BackendModuleName;
  layers: readonly BackendLayer[];
  sourceEngines: readonly string[];
}

const layers = ["domain", "application", "infrastructure", "interface"] as const;

export const moduleBoundaryFiles: readonly ModuleBoundaryFile[] = [
  { name: "identity", layers, sourceEngines: ["E01"] },
  { name: "organization", layers, sourceEngines: ["E05"] },
  { name: "team", layers, sourceEngines: ["E05", "E09"] },
  { name: "player", layers, sourceEngines: ["E01", "E36"] },
  { name: "guardian", layers, sourceEngines: ["E04", "E37"] },
  { name: "role", layers, sourceEngines: ["E02", "E03", "E26"] },
  { name: "schedule", layers, sourceEngines: ["E10", "E13"] },
  { name: "training", layers, sourceEngines: ["E13"] },
  { name: "match", layers, sourceEngines: ["E27"] },
  { name: "tactics", layers, sourceEngines: ["E14"] },
  { name: "stadium", layers, sourceEngines: ["E08", "E11", "E12", "E34"] },
  { name: "community", layers, sourceEngines: ["E15", "E16", "E33"] },
  { name: "media", layers, sourceEngines: ["E17"] },
  { name: "notification", layers, sourceEngines: ["E19"] },
  { name: "career", layers, sourceEngines: ["E18", "E36"] },
  { name: "scouting", layers, sourceEngines: ["E28", "E37"] },
  { name: "communication", layers, sourceEngines: ["E39"] },
  { name: "safeguarding", layers, sourceEngines: ["E40"] },
  { name: "privacy", layers, sourceEngines: ["E30"] },
  { name: "earthus", layers, sourceEngines: ["E35"] },
  { name: "admin", layers, sourceEngines: ["E25"] }
];
