export interface StadiumBuilderMotionProfile {
  readonly panel: Readonly<{
    type?: "spring";
    stiffness?: number;
    damping?: number;
    mass?: number;
    duration?: number;
  }>;
  readonly panelOffset: number;
  readonly preview: Readonly<{
    enabled: boolean;
    duration: number;
    fromOrbit: number;
    toOrbit: number;
    fromZoom: number;
    toZoom: number;
  }>;
}

export function getStadiumBuilderMotionProfile(reduced: boolean): StadiumBuilderMotionProfile {
  if (reduced) {
    return {
      panel: { duration: 0.16 },
      panelOffset: 0,
      preview: {
        enabled: false,
        duration: 0,
        fromOrbit: 0,
        toOrbit: 0,
        fromZoom: 1,
        toZoom: 1,
      },
    };
  }

  return {
    panel: { type: "spring", stiffness: 280, damping: 30, mass: 0.86 },
    panelOffset: 18,
    preview: {
      enabled: true,
      duration: 1650,
      fromOrbit: -7,
      toOrbit: 11,
      fromZoom: 0.96,
      toZoom: 1.025,
    },
  };
}
