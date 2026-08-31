import type { StadiumRecipe } from "../../three/stadiumWebglV14";

export const STADIUM_BUILDER_STEPS = [
  "STYLE",
  "BOWL",
  "ROOF",
  "STAND",
  "SEAT",
  "FACADE_LIGHT",
  "ENVIRONMENT",
] as const;

export type StadiumBuilderStep = (typeof STADIUM_BUILDER_STEPS)[number];

export const STADIUM_STYLE_FAMILIES = [
  "NEO_ARC",
  "CIVIC_RING",
  "URBAN_COMPACT",
  "OPEN_AIR",
  "LIGHT_CANOPY",
  "GREEN_PARK",
  "NIGHT_EVENT",
  "MONOLITH",
  "COMMUNITY",
  "HORIZON",
] as const;

export type StadiumStyleFamily = (typeof STADIUM_STYLE_FAMILIES)[number];
export type BowlProfile = "COMPACT" | "BALANCED" | "STEEP";
export type RoofProfile = "OPEN_RING" | "HALF_CANOPY" | "FULL_CANOPY";
export type StandProfile = "SINGLE_BOWL" | "DOUBLE_DECK" | "TRIPLE_DECK";
export type SeatPattern = "MONO" | "DUO" | "GRADIENT";
export type FacadeProfile = "SOLID_RIB" | "GLASS_BAND" | "LIGHT_FRAME";
export type LightingProfile = "DAYLIGHT" | "BALANCED" | "EVENT";
export type EnvironmentProfile = "URBAN" | "PARK" | "COASTAL" | "CIVIC" | "NIGHT_EVENT";

export interface StadiumBuilderConfig {
  readonly styleFamily: StadiumStyleFamily;
  readonly bowl: {
    readonly tierCount: 1 | 2 | 3;
    readonly profile: BowlProfile;
  };
  readonly roof: {
    readonly coverage: number;
    readonly profile: RoofProfile;
  };
  readonly stand: {
    readonly profile: StandProfile;
  };
  readonly seat: {
    readonly pattern: SeatPattern;
    readonly primaryColor: string;
    readonly accentColor: string;
    readonly fillDensity: number;
  };
  readonly facadeLight: {
    readonly facade: FacadeProfile;
    readonly lighting: LightingProfile;
  };
  readonly environment: {
    readonly profile: EnvironmentProfile;
  };
}

export interface StadiumBuilderDraft extends StadiumBuilderConfig {
  readonly schemaVersion: 1;
  readonly revision: number;
  readonly selectedPresetId: string;
}

export interface StadiumStyleFamilyOption {
  readonly id: StadiumStyleFamily;
  readonly label: string;
  readonly description: string;
}

export interface StadiumBuilderPreset {
  readonly id: string;
  readonly family: StadiumStyleFamily;
  readonly label: string;
  readonly config: StadiumBuilderConfig;
}

export interface StadiumBuilderValidationIssue {
  readonly code: string;
  readonly field: StadiumBuilderStep;
  readonly message: string;
}

export interface StadiumBuilderValidation {
  readonly valid: boolean;
  readonly errors: readonly StadiumBuilderValidationIssue[];
  readonly warnings: readonly StadiumBuilderValidationIssue[];
}

export const STADIUM_STYLE_FAMILY_OPTIONS: readonly StadiumStyleFamilyOption[] = [
  { id: "NEO_ARC", label: "Neo Arc", description: "가벼운 곡선 지붕과 선명한 야간 라인을 가진 현대형." },
  { id: "CIVIC_RING", label: "Civic Ring", description: "도시 공공 경기장에 맞춘 균형형 링 구조." },
  { id: "URBAN_COMPACT", label: "Urban Compact", description: "도심 소형 부지에 맞춘 밀도 높은 관람석." },
  { id: "OPEN_AIR", label: "Open Air", description: "개방감을 우선하는 최소 지붕형." },
  { id: "LIGHT_CANOPY", label: "Light Canopy", description: "얇은 캐노피와 밝은 파사드 프레임 중심." },
  { id: "GREEN_PARK", label: "Green Park", description: "공원 환경과 낮 경기 표현에 맞춘 절제형." },
  { id: "NIGHT_EVENT", label: "Night Event", description: "야간 이벤트 조명과 강한 액센트 중심." },
  { id: "MONOLITH", label: "Monolith", description: "묵직한 외벽과 깊은 bowl 인상을 가진 타입." },
  { id: "COMMUNITY", label: "Community", description: "훈련·지역 경기 중심의 작고 명확한 구조." },
  { id: "HORIZON", label: "Horizon", description: "낮은 수평선과 넓은 개방 지붕을 가진 타입." },
] as const;

const config = (
  styleFamily: StadiumStyleFamily,
  tierCount: 1 | 2 | 3,
  bowlProfile: BowlProfile,
  roofCoverage: number,
  roofProfile: RoofProfile,
  standProfile: StandProfile,
  seatPattern: SeatPattern,
  primaryColor: string,
  accentColor: string,
  fillDensity: number,
  facade: FacadeProfile,
  lighting: LightingProfile,
  environment: EnvironmentProfile,
): StadiumBuilderConfig => ({
  styleFamily,
  bowl: { tierCount, profile: bowlProfile },
  roof: { coverage: roofCoverage, profile: roofProfile },
  stand: { profile: standProfile },
  seat: { pattern: seatPattern, primaryColor, accentColor, fillDensity },
  facadeLight: { facade, lighting },
  environment: { profile: environment },
});

export const STADIUM_BUILDER_PRESETS: readonly StadiumBuilderPreset[] = [
  { id: "neo-arc-day", family: "NEO_ARC", label: "Neo Arc Day", config: config("NEO_ARC", 3, "BALANCED", 0.84, "FULL_CANOPY", "TRIPLE_DECK", "DUO", "#17344f", "#159bd2", 0.90, "GLASS_BAND", "BALANCED", "CIVIC") },
  { id: "neo-arc-night", family: "NEO_ARC", label: "Neo Arc Night", config: config("NEO_ARC", 3, "STEEP", 0.94, "FULL_CANOPY", "TRIPLE_DECK", "GRADIENT", "#132a42", "#34c8ff", 0.93, "LIGHT_FRAME", "EVENT", "NIGHT_EVENT") },
  { id: "civic-ring-light", family: "CIVIC_RING", label: "Civic Ring Light", config: config("CIVIC_RING", 2, "BALANCED", 0.72, "HALF_CANOPY", "DOUBLE_DECK", "MONO", "#283b49", "#7fc8e8", 0.82, "GLASS_BAND", "DAYLIGHT", "CIVIC") },
  { id: "civic-ring-event", family: "CIVIC_RING", label: "Civic Ring Event", config: config("CIVIC_RING", 2, "STEEP", 0.84, "FULL_CANOPY", "DOUBLE_DECK", "DUO", "#203448", "#51d0ff", 0.90, "SOLID_RIB", "EVENT", "URBAN") },
  { id: "urban-compact-two", family: "URBAN_COMPACT", label: "Urban Compact Two", config: config("URBAN_COMPACT", 2, "STEEP", 0.72, "HALF_CANOPY", "DOUBLE_DECK", "DUO", "#263442", "#ebae54", 0.88, "SOLID_RIB", "BALANCED", "URBAN") },
  { id: "urban-compact-one", family: "URBAN_COMPACT", label: "Urban Compact One", config: config("URBAN_COMPACT", 1, "COMPACT", 0.55, "OPEN_RING", "SINGLE_BOWL", "MONO", "#313b43", "#e2be74", 0.78, "GLASS_BAND", "DAYLIGHT", "URBAN") },
  { id: "open-air-park", family: "OPEN_AIR", label: "Open Air Park", config: config("OPEN_AIR", 1, "BALANCED", 0.55, "OPEN_RING", "SINGLE_BOWL", "MONO", "#315044", "#9cd7a8", 0.72, "LIGHT_FRAME", "DAYLIGHT", "PARK") },
  { id: "open-air-coast", family: "OPEN_AIR", label: "Open Air Coast", config: config("OPEN_AIR", 2, "BALANCED", 0.55, "OPEN_RING", "DOUBLE_DECK", "DUO", "#244258", "#7ed8f4", 0.80, "LIGHT_FRAME", "DAYLIGHT", "COASTAL") },
  { id: "light-canopy-blue", family: "LIGHT_CANOPY", label: "Light Canopy Blue", config: config("LIGHT_CANOPY", 2, "BALANCED", 0.72, "HALF_CANOPY", "DOUBLE_DECK", "GRADIENT", "#1e3850", "#61c8ff", 0.86, "LIGHT_FRAME", "BALANCED", "CIVIC") },
  { id: "light-canopy-event", family: "LIGHT_CANOPY", label: "Light Canopy Event", config: config("LIGHT_CANOPY", 3, "BALANCED", 0.84, "FULL_CANOPY", "TRIPLE_DECK", "DUO", "#1b3044", "#8de3ff", 0.91, "LIGHT_FRAME", "EVENT", "NIGHT_EVENT") },
  { id: "green-park-one", family: "GREEN_PARK", label: "Green Park One", config: config("GREEN_PARK", 1, "COMPACT", 0.55, "OPEN_RING", "SINGLE_BOWL", "MONO", "#29473a", "#82c995", 0.70, "GLASS_BAND", "DAYLIGHT", "PARK") },
  { id: "green-park-two", family: "GREEN_PARK", label: "Green Park Two", config: config("GREEN_PARK", 2, "BALANCED", 0.72, "HALF_CANOPY", "DOUBLE_DECK", "DUO", "#234238", "#9fd78d", 0.82, "LIGHT_FRAME", "BALANCED", "PARK") },
  { id: "night-event-cyan", family: "NIGHT_EVENT", label: "Night Event Cyan", config: config("NIGHT_EVENT", 3, "STEEP", 0.94, "FULL_CANOPY", "TRIPLE_DECK", "GRADIENT", "#17283b", "#27d3ff", 0.94, "SOLID_RIB", "EVENT", "NIGHT_EVENT") },
  { id: "night-event-amber", family: "NIGHT_EVENT", label: "Night Event Amber", config: config("NIGHT_EVENT", 3, "STEEP", 0.84, "FULL_CANOPY", "TRIPLE_DECK", "DUO", "#2c2e35", "#ffba62", 0.92, "SOLID_RIB", "EVENT", "NIGHT_EVENT") },
  { id: "monolith-dark", family: "MONOLITH", label: "Monolith Dark", config: config("MONOLITH", 3, "STEEP", 0.84, "FULL_CANOPY", "TRIPLE_DECK", "MONO", "#242b31", "#9db2bf", 0.91, "SOLID_RIB", "BALANCED", "URBAN") },
  { id: "monolith-civic", family: "MONOLITH", label: "Monolith Civic", config: config("MONOLITH", 2, "STEEP", 0.72, "HALF_CANOPY", "DOUBLE_DECK", "DUO", "#30373d", "#a9d4e5", 0.86, "SOLID_RIB", "DAYLIGHT", "CIVIC") },
  { id: "community-day", family: "COMMUNITY", label: "Community Day", config: config("COMMUNITY", 1, "COMPACT", 0.55, "OPEN_RING", "SINGLE_BOWL", "DUO", "#2c4651", "#74c8e4", 0.68, "GLASS_BAND", "DAYLIGHT", "PARK") },
  { id: "community-evening", family: "COMMUNITY", label: "Community Evening", config: config("COMMUNITY", 2, "COMPACT", 0.72, "HALF_CANOPY", "DOUBLE_DECK", "MONO", "#293843", "#6ed9ff", 0.78, "LIGHT_FRAME", "BALANCED", "CIVIC") },
  { id: "horizon-coast", family: "HORIZON", label: "Horizon Coast", config: config("HORIZON", 2, "BALANCED", 0.55, "OPEN_RING", "DOUBLE_DECK", "GRADIENT", "#204256", "#8bdff3", 0.78, "LIGHT_FRAME", "DAYLIGHT", "COASTAL") },
  { id: "horizon-night", family: "HORIZON", label: "Horizon Night", config: config("HORIZON", 2, "BALANCED", 0.72, "HALF_CANOPY", "DOUBLE_DECK", "DUO", "#203243", "#5ed6ff", 0.86, "GLASS_BAND", "EVENT", "NIGHT_EVENT") },
] as const;

export const DEFAULT_STADIUM_BUILDER_PRESET_ID = "neo-arc-day";

export function getStadiumBuilderPreset(id: string): StadiumBuilderPreset | null {
  return STADIUM_BUILDER_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function createStadiumBuilderDraft(presetId = DEFAULT_STADIUM_BUILDER_PRESET_ID): StadiumBuilderDraft {
  const preset = getStadiumBuilderPreset(presetId) ?? STADIUM_BUILDER_PRESETS[0];
  return {
    schemaVersion: 1,
    revision: 0,
    selectedPresetId: preset.id,
    ...preset.config,
  };
}

export function applyStadiumBuilderPreset(draft: StadiumBuilderDraft, presetId: string): StadiumBuilderDraft {
  const preset = getStadiumBuilderPreset(presetId);
  if (!preset) return draft;
  return {
    schemaVersion: 1,
    revision: draft.revision,
    selectedPresetId: preset.id,
    ...preset.config,
  };
}

export function validateStadiumBuilderDraft(draft: StadiumBuilderDraft): StadiumBuilderValidation {
  const errors: StadiumBuilderValidationIssue[] = [];
  const warnings: StadiumBuilderValidationIssue[] = [];

  if (draft.roof.coverage < 0.55 || draft.roof.coverage > 0.94) {
    errors.push({ code: "ROOF_COVERAGE_RANGE", field: "ROOF", message: "지붕 커버리지는 현재 렌더러 범위 0.55~0.94 안이어야 합니다." });
  }
  if (draft.seat.fillDensity < 0.60 || draft.seat.fillDensity > 0.95) {
    errors.push({ code: "SEAT_DENSITY_RANGE", field: "SEAT", message: "프리뷰 관중/좌석 밀도는 0.60~0.95 안이어야 합니다." });
  }
  if (draft.roof.profile === "OPEN_RING" && draft.roof.coverage > 0.55) {
    errors.push({ code: "OPEN_RING_COVERAGE", field: "ROOF", message: "OPEN_RING 프로필은 0.55 커버리지와 함께 사용합니다." });
  }
  if (draft.roof.profile === "FULL_CANOPY" && draft.roof.coverage < 0.84) {
    errors.push({ code: "FULL_CANOPY_COVERAGE", field: "ROOF", message: "FULL_CANOPY 프로필은 0.84 이상 커버리지가 필요합니다." });
  }
  const expectedTier = draft.stand.profile === "SINGLE_BOWL" ? 1 : draft.stand.profile === "DOUBLE_DECK" ? 2 : 3;
  if (draft.bowl.tierCount !== expectedTier) {
    errors.push({ code: "STAND_TIER_MISMATCH", field: "STAND", message: `${draft.stand.profile}과 ${draft.bowl.tierCount}단 bowl 설정이 일치하지 않습니다.` });
  }
  if (draft.environment.profile === "NIGHT_EVENT" && draft.facadeLight.lighting === "DAYLIGHT") {
    warnings.push({ code: "NIGHT_DAYLIGHT_MISMATCH", field: "ENVIRONMENT", message: "야간 환경에서는 BALANCED 또는 EVENT 조명이 더 자연스럽습니다." });
  }
  if (draft.bowl.profile === "COMPACT" && draft.bowl.tierCount === 3) {
    warnings.push({ code: "COMPACT_TRIPLE_DECK", field: "BOWL", message: "COMPACT bowl에 3단 관람석을 사용하면 프리뷰가 매우 밀집되어 보일 수 있습니다." });
  }

  return { valid: errors.length === 0, errors, warnings };
}

function parseColor(value: string, fallback: number): number {
  const normalized = value.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return fallback;
  return Number.parseInt(normalized, 16);
}

export function stadiumBuilderDraftToRecipe(draft: StadiumBuilderDraft): StadiumRecipe {
  const columnStyle = draft.facadeLight.facade === "SOLID_RIB"
    ? "straight"
    : draft.facadeLight.facade === "LIGHT_FRAME"
      ? "v"
      : "y";
  return {
    tierCount: draft.bowl.tierCount,
    roofCoverage: draft.roof.coverage,
    crowdDensity: draft.seat.fillDensity,
    seatColor: parseColor(draft.seat.primaryColor, 0x17344f),
    accentColor: parseColor(draft.seat.accentColor, 0x159bd2),
    columnStyle,
    presentationProfile: "SERVICE_BUILDER",
    bowlProfile: draft.bowl.profile,
    roofProfile: draft.roof.profile,
    standProfile: draft.stand.profile,
    seatPattern: draft.seat.pattern,
    facadeProfile: draft.facadeLight.facade,
    lightingProfile: draft.facadeLight.lighting,
    environmentProfile: draft.environment.profile,
  };
}

export const STADIUM_BUILDER_STORAGE_KEY = "snapn:v2:stadium-builder:draft";

export interface StadiumBuilderStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type SaveStadiumBuilderDraftResult =
  | Readonly<{ status: "SAVED"; draft: StadiumBuilderDraft }>
  | Readonly<{ status: "CONFLICT"; current: StadiumBuilderDraft }>;

function isDraft(value: unknown): value is StadiumBuilderDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StadiumBuilderDraft>;
  return candidate.schemaVersion === 1
    && typeof candidate.revision === "number"
    && typeof candidate.selectedPresetId === "string"
    && STADIUM_STYLE_FAMILIES.includes(candidate.styleFamily as StadiumStyleFamily)
    && Boolean(candidate.bowl && candidate.roof && candidate.stand && candidate.seat && candidate.facadeLight && candidate.environment);
}

export function loadStadiumBuilderDraft(storage: StadiumBuilderStorage): StadiumBuilderDraft | null {
  const raw = storage.getItem(STADIUM_BUILDER_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStadiumBuilderDraft(
  storage: StadiumBuilderStorage,
  draft: StadiumBuilderDraft,
  expectedRevision: number,
): SaveStadiumBuilderDraftResult {
  const current = loadStadiumBuilderDraft(storage);
  if (current && current.revision !== expectedRevision) {
    return { status: "CONFLICT", current };
  }
  if (!current && expectedRevision !== 0) {
    return { status: "CONFLICT", current: createStadiumBuilderDraft(draft.selectedPresetId) };
  }
  const saved: StadiumBuilderDraft = { ...draft, revision: expectedRevision + 1 };
  storage.setItem(STADIUM_BUILDER_STORAGE_KEY, JSON.stringify(saved));
  return { status: "SAVED", draft: saved };
}
