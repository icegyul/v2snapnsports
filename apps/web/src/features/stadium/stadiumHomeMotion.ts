export interface StadiumHomeMotionProfile {
  readonly ui: Readonly<{
    itemOffset: number;
    stagger: number;
    duration: number;
  }>;
  readonly camera: Readonly<{
    enabled: boolean;
    duration: number;
    fromOrbit: number;
    toOrbit: number;
    fromZoom: number;
    toZoom: number;
  }>;
}

export function getStadiumHomeMotionProfile(reduced: boolean): StadiumHomeMotionProfile {
  if (reduced) {
    return {
      ui: { itemOffset: 0, stagger: 0, duration: 0.12 },
      camera: {
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
    ui: { itemOffset: 16, stagger: 0.10, duration: 0.58 },
    camera: {
      enabled: true,
      duration: 1550,
      fromOrbit: -4,
      toOrbit: 0,
      fromZoom: 0.92,
      toZoom: 1,
    },
  };
}
