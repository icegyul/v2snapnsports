export interface ServiceButtressSpec {
  readonly x: number;
  readonly z: number;
  readonly height: number;
  readonly lean: number;
}

export interface ServiceStairRunSpec {
  readonly width: number;
  readonly depth: number;
  readonly y: number;
  readonly z: number;
}

export interface ServiceArchitectureSpec {
  readonly entrance: { readonly width: number; readonly height: number; readonly depth: number; readonly z: number };
  readonly buttresses: readonly ServiceButtressSpec[];
  readonly perimeterButtressCount: number;
  readonly mullionCount: number;
  readonly interiorSlabHeights: readonly number[];
  readonly stairRuns: readonly ServiceStairRunSpec[];
  readonly plaza: { readonly width: number; readonly depth: number };
  readonly heroSkylineCount: 0;
  readonly heroTreeCount: 0;
}

export function resolveServiceArchitecture(): ServiceArchitectureSpec {
  // Six blades frame the glass atrium from its edges outward — none stand in
  // front of the lit lobby (poster: blades flank the entrance, never cross it).
  const xPositions = [-53, -40, -27, 27, 40, 53] as const;
  return {
    entrance: { width: 52, height: 30, depth: 5, z: 86.2 },
    buttresses: xPositions.map((x) => ({
      x,
      z: 85.5 - Math.abs(x) * 0.03,
      height: 32 + (53 - Math.abs(x)) * 0.07,
      lean: Math.sign(x) * 0.075,
    })),
    perimeterButtressCount: 32,
    mullionCount: 18,
    interiorSlabHeights: [5.5, 11.5, 17.5, 23.5],
    stairRuns: Array.from({ length: 6 }, (_, index) => ({
      width: 52 - index * 2.6,
      depth: 3.2,
      y: 0.18 + index * 0.28,
      z: 91.5 + index * 3.1,
    })),
    // Deep enough that even the pulled-back mobile camera never sees sky
    // where ground should be.
    plaza: { width: 380, depth: 470 },
    heroSkylineCount: 0,
    heroTreeCount: 0,
  };
}
