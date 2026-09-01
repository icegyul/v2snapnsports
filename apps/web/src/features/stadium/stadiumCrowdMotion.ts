// Ambient life in the stands. The movement itself runs on the GPU (the crowd
// materials are patched in the renderer), so a frame costs one uniform write
// plus the normal draw — this profile only decides how often that happens and
// how far a fan may move.

export interface StadiumCrowdMotionProfile {
  readonly enabled: boolean;
  /** Frame budget: the stands do not need 60fps to read as alive. */
  readonly frameIntervalMs: number;
  /** Radians per second the cheer travels around the bowl. */
  readonly waveSpeed: number;
  /** Metres a fan rises at the crest of the wave. */
  readonly waveLift: number;
  /** Metres of constant idle bob, independent of the wave. */
  readonly swayAmplitude: number;
}

const STILL: StadiumCrowdMotionProfile = {
  enabled: false,
  frameIntervalMs: 0,
  waveSpeed: 0,
  waveLift: 0,
  swayAmplitude: 0,
};

const ALIVE: StadiumCrowdMotionProfile = {
  enabled: true,
  frameIntervalMs: 1000 / 30,
  waveSpeed: 0.55,
  waveLift: 0.34,
  swayAmplitude: 0.035,
};

export function getStadiumCrowdMotionProfile(reducedMotion: boolean): StadiumCrowdMotionProfile {
  return reducedMotion ? STILL : ALIVE;
}

export function shouldAdvanceCrowdFrame(
  profile: StadiumCrowdMotionProfile,
  lastFrameMs: number | null,
  nowMs: number,
  documentHidden: boolean,
): boolean {
  if (!profile.enabled || documentHidden) return false;
  if (lastFrameMs === null) return true;
  return nowMs - lastFrameMs >= profile.frameIntervalMs;
}
