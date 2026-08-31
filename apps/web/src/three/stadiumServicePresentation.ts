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

// FIFA-style stand camera inside the bowl. Envelope facts (default bowl
// profile): tiers span x-radius 58..113 with z = 0.70x, tier tops at y 33,
// roof underside clutter from y 36.7 — so the camera must stay under y 34.5,
// keep its elliptical x-radius within ~60..104, and sit above the seating
// line y = 0.6*(R-58) so the stands never occlude the view.
const BOWL_Z_RATIO = 0.7;

export function resolveInteriorCamera(
  viewport: ServiceViewport,
  orbitInput: number,
  zoomInput: number,
  riseInput = 0,
): ServiceCameraPose {
  const orbit = clamp(orbitInput, -30, 30);
  const zoom = clamp(zoomInput, 0.9, 1.2);
  const rise = clamp(riseInput, 0, 1);
  const mobile = viewport === "MOBILE";

  // Rise walks the camera up the stands: higher AND further back, like
  // climbing from a first-tier seat to the upper-deck broadcast gantry.
  const eased = rise * rise * (3 - 2 * rise);
  const baseRadius = (74 + eased * 22) * (mobile ? 1.06 : 1);
  const radius = clamp(baseRadius / zoom, 60, 104);
  const height = clamp(Math.max(16 + eased * 17, 0.6 * (radius - 58) + 4), 12, 34);

  // Drag orbit is amplified so the ±30° gesture range sweeps a wide arc of
  // the bowl. Base angle 90° puts the camera on the +z stand, looking at the
  // scoreboard end (-z), matching the FIFA broadcast default.
  const theta = Math.PI / 2 - (orbit * 3 * Math.PI) / 180;

  return {
    position: [radius * Math.cos(theta), height, radius * BOWL_Z_RATIO * Math.sin(theta)],
    target: [0, 1.4, 0],
    fov: (mobile ? 60 : 50) + eased * 4,
  };
}
