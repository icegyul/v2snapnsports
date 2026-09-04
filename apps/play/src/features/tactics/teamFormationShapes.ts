import { ownCoordinate, teammateCoordinate, type PitchCoordinate } from "./tacticalProjection";
import { resolveTacticsRole, type TacticsRole } from "./teamTacticsCards";

// Formation shapes for the squad screen. A shape is 11 slots on the pitch;
// only people who are actually connected fill them, the rest stay visibly
// empty. Nobody is ever invented to complete a shape.

export const FORMATION_IDS = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"] as const;

export type FormationId = (typeof FORMATION_IDS)[number];

export interface FormationSlot {
  readonly id: string;
  readonly label: string;
  readonly role: TacticsRole;
  readonly x: number;
  readonly z: number;
}

export interface FormationShape {
  readonly id: FormationId;
  readonly slots: readonly FormationSlot[];
}

export type LineupEntry =
  | Readonly<{ kind: "OWN"; slot: FormationSlot; shirtNumber: string; position: string }>
  | Readonly<{ kind: "TEAMMATE"; slot: FormationSlot; shirtNumber: string; position: string }>
  | Readonly<{ kind: "EMPTY"; slot: FormationSlot }>;

export interface LineupPlayer {
  readonly shirtNumber: string;
  readonly primaryPosition: string;
}

export interface LineupTeammate {
  readonly shirtNumber: string;
  readonly position: string;
  readonly x: number;
  readonly y: number;
}

const slot = (id: string, label: string, role: TacticsRole, x: number, z: number): FormationSlot =>
  ({ id, label, role, x, z });

export const FORMATION_SHAPES: readonly FormationShape[] = [
  {
    id: "4-3-3",
    slots: [
      slot("gk", "GK", "GK", -44, 0),
      slot("lb", "LB", "DF", -30, -23),
      slot("lcb", "LCB", "DF", -34, -8),
      slot("rcb", "RCB", "DF", -34, 8),
      slot("rb", "RB", "DF", -30, 23),
      slot("cdm", "CDM", "MF", -16, 0),
      slot("lcm", "LCM", "MF", -6, -15),
      slot("rcm", "RCM", "MF", -6, 15),
      slot("lw", "LW", "FW", 26, -23),
      slot("st", "ST", "FW", 38, 0),
      slot("rw", "RW", "FW", 26, 23),
    ],
  },
  {
    id: "4-4-2",
    slots: [
      slot("gk", "GK", "GK", -44, 0),
      slot("lb", "LB", "DF", -30, -23),
      slot("lcb", "LCB", "DF", -34, -8),
      slot("rcb", "RCB", "DF", -34, 8),
      slot("rb", "RB", "DF", -30, 23),
      slot("lm", "LM", "MF", -2, -24),
      slot("lcm", "LCM", "MF", -10, -8),
      slot("rcm", "RCM", "MF", -10, 8),
      slot("rm", "RM", "MF", -2, 24),
      slot("lst", "ST", "FW", 32, -9),
      slot("rst", "ST", "FW", 32, 9),
    ],
  },
  {
    id: "3-5-2",
    slots: [
      slot("gk", "GK", "GK", -44, 0),
      slot("lcb", "LCB", "DF", -34, -15),
      slot("cb", "CB", "DF", -36, 0),
      slot("rcb", "RCB", "DF", -34, 15),
      slot("lwb", "LWB", "MF", 0, -26),
      slot("lcm", "LCM", "MF", -8, -10),
      slot("cdm", "CDM", "MF", -18, 0),
      slot("rcm", "RCM", "MF", -8, 10),
      slot("rwb", "RWB", "MF", 0, 26),
      slot("lst", "ST", "FW", 32, -9),
      slot("rst", "ST", "FW", 32, 9),
    ],
  },
  {
    id: "4-2-3-1",
    slots: [
      slot("gk", "GK", "GK", -44, 0),
      slot("lb", "LB", "DF", -30, -23),
      slot("lcb", "LCB", "DF", -34, -8),
      slot("rcb", "RCB", "DF", -34, 8),
      slot("rb", "RB", "DF", -30, 23),
      slot("ldm", "LDM", "MF", -18, -8),
      slot("rdm", "RDM", "MF", -18, 8),
      slot("lam", "LAM", "MF", 12, -21),
      slot("cam", "CAM", "MF", 14, 0),
      slot("ram", "RAM", "MF", 12, 21),
      slot("st", "ST", "FW", 38, 0),
    ],
  },
] as const;

export const DEFAULT_FORMATION_ID: FormationId = "4-3-3";

export function getFormationShape(id: FormationId): FormationShape {
  return FORMATION_SHAPES.find((shape) => shape.id === id) ?? FORMATION_SHAPES[0];
}

export function resolveFormationId(value: string | null | undefined): FormationId {
  const match = FORMATION_IDS.find((id) => id === value?.trim());
  return match ?? DEFAULT_FORMATION_ID;
}

function nearestFreeSlot(
  shape: FormationShape,
  taken: ReadonlySet<string>,
  role: TacticsRole,
  at: PitchCoordinate,
): FormationSlot | null {
  const free = shape.slots.filter((candidate) => !taken.has(candidate.id));
  if (free.length === 0) return null;
  // Prefer a slot the person actually plays; fall back to any open slot so a
  // squad with an unusual mix still places everyone.
  const sameRole = free.filter((candidate) => candidate.role === role);
  const pool = sameRole.length > 0 ? sameRole : free;
  let best = pool[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of pool) {
    const distance = (candidate.x - at.x) ** 2 + (candidate.z - at.z) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}

export function buildFormationLineup(
  shape: FormationShape,
  player: LineupPlayer,
  teammates: readonly LineupTeammate[],
): readonly LineupEntry[] {
  const taken = new Set<string>();
  const filled = new Map<string, LineupEntry>();

  const ownSlot = nearestFreeSlot(
    shape,
    taken,
    resolveTacticsRole(player.primaryPosition),
    ownCoordinate(player.primaryPosition),
  );
  if (ownSlot) {
    taken.add(ownSlot.id);
    filled.set(ownSlot.id, {
      kind: "OWN",
      slot: ownSlot,
      shirtNumber: player.shirtNumber,
      position: player.primaryPosition,
    });
  }

  for (const teammate of teammates) {
    const target = nearestFreeSlot(
      shape,
      taken,
      resolveTacticsRole(teammate.position),
      teammateCoordinate(teammate.x, teammate.y),
    );
    if (!target) break;
    taken.add(target.id);
    filled.set(target.id, {
      kind: "TEAMMATE",
      slot: target,
      shirtNumber: teammate.shirtNumber,
      position: teammate.position,
    });
  }

  return shape.slots.map((current) => filled.get(current.id) ?? { kind: "EMPTY", slot: current });
}

export const TACTICS_FORMATION_STORAGE_KEY = "snapn:play:tactics-formation";

export interface FormationStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadFormationId(storage: FormationStorage, fallback?: string): FormationId {
  const stored = storage.getItem(TACTICS_FORMATION_STORAGE_KEY);
  if (stored) return resolveFormationId(stored);
  return resolveFormationId(fallback);
}

export function saveFormationId(storage: FormationStorage, id: FormationId): void {
  storage.setItem(TACTICS_FORMATION_STORAGE_KEY, id);
}
