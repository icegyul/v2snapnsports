export type ServiceViewport = "DESKTOP" | "MOBILE";

export interface ServiceCameraPose {
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly fov: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveServiceCamera(
  viewport: ServiceViewport,
  orbitInput: number,
  zoomInput: number,
  riseInput = 0,
): ServiceCameraPose {
  const orbit = clamp(orbitInput, -30, 30);
  const zoom = clamp(zoomInput, 0.9, 1.1);
  const rise = clamp(riseInput, 0, 1);
  const mobile = viewport === "MOBILE";
  // Mobile pulls further back so the blades and roof crown stay in frame on a
  // narrow portrait viewport instead of cropping to the atrium alone.
  const baseZ = mobile ? 246 : 198;
  const baseY = mobile ? 14 : 18;
  const x = orbit * (mobile ? 1.42 : 1.72);
  const groundZ = (baseZ - Math.abs(orbit) * 0.22) / zoom;
  const groundY = baseY / zoom;

  // Rise lifts the camera from the plaza approach up over the roof line into
  // an aerial pose that looks down through the aperture onto the pitch.
  const eased = rise * rise * (3 - 2 * rise);
  const aerialY = mobile ? 214 : 192;
  const aerialZ = (mobile ? 152 : 138) / zoom;

  return {
    position: [
      x * (1 - eased * 0.55),
      groundY + (aerialY - groundY) * eased,
      groundZ + (aerialZ - groundZ) * eased,
    ],
    target: [0, 18 - 16 * eased, 52 - 50 * eased],
    fov: (mobile ? 54 : 44) + eased * 6,
  };
}
