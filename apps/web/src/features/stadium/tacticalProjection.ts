export type PitchCoordinate = Readonly<{ x: number; z: number }>;
export type FieldPercent = Readonly<{ left: number; top: number }>;

const PITCH_HALF_LENGTH = 47;
const PITCH_HALF_WIDTH = 29;

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Maps the player's primary position label (Korean label or contract enum)
 * to pitch coordinates. x runs from own goal (-47) toward attack (+47),
 * z across the width (-29 left, +29 right).
 */
export function ownCoordinate(position: string): PitchCoordinate {
  const normalized = position.trim().toUpperCase();
  if (position.includes("골키퍼")) return { x: -45, z: 0 };
  if (position.includes("왼쪽 풀백")) return { x: -28, z: -23 };
  if (position.includes("오른쪽 풀백")) return { x: -28, z: 23 };
  if (position.includes("수비형 미드필더")) return { x: -14, z: 0 };
  if (position.includes("중앙 미드필더")) return { x: 0, z: 0 };
  if (position.includes("공격형 미드필더")) return { x: 16, z: 0 };
  if (position.includes("왼쪽 윙")) return { x: 24, z: -25 };
  if (position.includes("오른쪽 윙")) return { x: 24, z: 25 };
  if (position.includes("스트라이커") || position.includes("공격수")) return { x: 38, z: 0 };
  if (position.includes("센터백") || position.includes("중앙 수비수")) return { x: -30, z: 0 };
  switch (normalized) {
    case "GK": return { x: -45, z: 0 };
    case "LB": return { x: -28, z: -23 };
    case "LCB": return { x: -30, z: -10 };
    case "CB": return { x: -30, z: 0 };
    case "RCB": return { x: -30, z: 10 };
    case "RB": return { x: -28, z: 23 };
    case "CDM":
    case "DM": return { x: -14, z: 0 };
    case "CM": return { x: 0, z: 0 };
    case "CAM":
    case "AM": return { x: 16, z: 0 };
    case "LW": return { x: 24, z: -25 };
    case "RW": return { x: 24, z: 25 };
    case "CF": return { x: 31, z: 0 };
    case "ST": return { x: 38, z: 0 };
    default: return { x: 0, z: 0 };
  }
}

/** Converts contract teammate x/y percentages (0..100) to pitch coordinates. */
export function teammateCoordinate(xPercent: number, yPercent: number): PitchCoordinate {
  return {
    x: ((clampPercent(xPercent) - 50) / 50) * PITCH_HALF_LENGTH,
    z: ((clampPercent(yPercent) - 50) / 50) * PITCH_HALF_WIDTH,
  };
}

/** Projects pitch coordinates onto tactical-field percentages (left/top 0..100). */
export function pitchToFieldPercent(coordinate: PitchCoordinate): FieldPercent {
  return {
    left: clampPercent(50 + (coordinate.x / PITCH_HALF_LENGTH) * 50),
    top: clampPercent(50 + (coordinate.z / PITCH_HALF_WIDTH) * 50),
  };
}

/** Clamps a raw contract percentage (0..100) for direct field placement. */
export function fieldPercent(value: number): number {
  return clampPercent(value);
}
