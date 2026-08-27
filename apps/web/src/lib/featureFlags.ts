export type FeatureKey = "EPTS" | "CAMERA_AI" | "SPORTS_AI" | "COMMUNITY_FEED_INTELLIGENCE" | "EARTHUS_CONTEXT" | "STADIUM_3D";

export const featureFlags: Readonly<Record<FeatureKey, boolean>> = Object.freeze({
  EPTS: false,
  CAMERA_AI: false,
  SPORTS_AI: false,
  COMMUNITY_FEED_INTELLIGENCE: false,
  EARTHUS_CONTEXT: true,
  STADIUM_3D: true
});

export function isFeatureVisible(key: FeatureKey): boolean {
  return featureFlags[key] === true;
}

export function isHardDisabled(key: FeatureKey): boolean {
  return key === "EPTS" || key === "CAMERA_AI" || key === "SPORTS_AI";
}
