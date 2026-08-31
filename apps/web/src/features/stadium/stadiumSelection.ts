import type { StadiumRecipe } from "../../three/stadiumWebglV14";
import { BASE_STADIUM_ACCEPTANCE_RECIPE } from "../../three/stadiumWebglV151";

export type ServiceStadiumTier = "FREE" | "PREMIUM";

export interface ServiceStadiumPreset {
  readonly id: string;
  readonly label: string;
  readonly tagline: string;
  readonly tier: ServiceStadiumTier;
  readonly swatch: {
    readonly from: string;
    readonly to: string;
  };
  readonly recipe: StadiumRecipe;
}

export const SERVICE_STADIUM_PRESETS: readonly ServiceStadiumPreset[] = [
  {
    id: "signature-arc",
    tier: "FREE",
    label: "시그니처 아크",
    tagline: "균형 잡힌 시그니처 홈 · 낮과 밤 모두 어울리는 기본 룩",
    swatch: { from: "#17344f", to: "#159bd2" },
    recipe: { ...BASE_STADIUM_ACCEPTANCE_RECIPE },
  },
  {
    id: "night-cyan",
    tier: "PREMIUM",
    label: "나이트 이벤트",
    tagline: "야간 이벤트 조명과 시안 글로우 · 풀 캐노피",
    swatch: { from: "#17283b", to: "#27d3ff" },
    recipe: {
      tierCount: 3,
      roofCoverage: 0.94,
      crowdDensity: 0.94,
      seatColor: 0x17283b,
      accentColor: 0x27d3ff,
      columnStyle: "straight",
      presentationProfile: "SERVICE_HOME",
      homeView: "INTERIOR",
      bowlProfile: "STEEP",
      roofProfile: "FULL_CANOPY",
      standProfile: "TRIPLE_DECK",
      seatPattern: "GRADIENT",
      facadeProfile: "SOLID_RIB",
      lightingProfile: "EVENT",
      environmentProfile: "NIGHT_EVENT",
    },
  },
  {
    id: "coastal-open",
    tier: "FREE",
    label: "코스탈 오픈",
    tagline: "바닷빛 개방형 링 · 밝은 낮 경기 무드",
    swatch: { from: "#244258", to: "#7ed8f4" },
    recipe: {
      tierCount: 2,
      roofCoverage: 0.55,
      crowdDensity: 0.80,
      seatColor: 0x244258,
      accentColor: 0x7ed8f4,
      columnStyle: "v",
      presentationProfile: "SERVICE_HOME",
      homeView: "INTERIOR",
      bowlProfile: "BALANCED",
      roofProfile: "OPEN_RING",
      standProfile: "DOUBLE_DECK",
      seatPattern: "DUO",
      facadeProfile: "LIGHT_FRAME",
      lightingProfile: "DAYLIGHT",
      environmentProfile: "COASTAL",
    },
  },
  {
    id: "green-park",
    tier: "FREE",
    label: "그린 파크",
    tagline: "공원 속 하프 캐노피 · 차분한 그린 팔레트",
    swatch: { from: "#234238", to: "#9fd78d" },
    recipe: {
      tierCount: 2,
      roofCoverage: 0.72,
      crowdDensity: 0.82,
      seatColor: 0x234238,
      accentColor: 0x9fd78d,
      columnStyle: "v",
      presentationProfile: "SERVICE_HOME",
      homeView: "INTERIOR",
      bowlProfile: "BALANCED",
      roofProfile: "HALF_CANOPY",
      standProfile: "DOUBLE_DECK",
      seatPattern: "DUO",
      facadeProfile: "LIGHT_FRAME",
      lightingProfile: "BALANCED",
      environmentProfile: "PARK",
    },
  },
  {
    id: "urban-amber",
    tier: "FREE",
    label: "어반 앰버",
    tagline: "도심 콤팩트 볼 · 앰버 액센트의 저녁 무드",
    swatch: { from: "#263442", to: "#ebae54" },
    recipe: {
      tierCount: 2,
      roofCoverage: 0.72,
      crowdDensity: 0.88,
      seatColor: 0x263442,
      accentColor: 0xebae54,
      columnStyle: "straight",
      presentationProfile: "SERVICE_HOME",
      homeView: "INTERIOR",
      bowlProfile: "STEEP",
      roofProfile: "HALF_CANOPY",
      standProfile: "DOUBLE_DECK",
      seatPattern: "DUO",
      facadeProfile: "SOLID_RIB",
      lightingProfile: "BALANCED",
      environmentProfile: "URBAN",
    },
  },
  {
    id: "royal-gold",
    label: "로얄 골드",
    tier: "PREMIUM",
    tagline: "골드 액센트의 야간 이벤트 · 챔피언 무드",
    swatch: { from: "#2c2416", to: "#f0c75e" },
    recipe: {
      tierCount: 3,
      roofCoverage: 0.84,
      crowdDensity: 0.93,
      seatColor: 0x2c2416,
      accentColor: 0xf0c75e,
      columnStyle: "straight",
      presentationProfile: "SERVICE_HOME",
      homeView: "INTERIOR",
      bowlProfile: "STEEP",
      roofProfile: "FULL_CANOPY",
      standProfile: "TRIPLE_DECK",
      seatPattern: "GRADIENT",
      facadeProfile: "SOLID_RIB",
      lightingProfile: "EVENT",
      environmentProfile: "NIGHT_EVENT",
    },
  },
  {
    id: "crimson-fortress",
    label: "크림슨 포트리스",
    tier: "PREMIUM",
    tagline: "붉은 응원 물결의 요새 · 강한 홈 어드밴티지",
    swatch: { from: "#461f1f", to: "#e05555" },
    recipe: {
      tierCount: 3,
      roofCoverage: 0.94,
      crowdDensity: 0.94,
      seatColor: 0x461f1f,
      accentColor: 0xe05555,
      columnStyle: "straight",
      presentationProfile: "SERVICE_HOME",
      homeView: "INTERIOR",
      bowlProfile: "STEEP",
      roofProfile: "FULL_CANOPY",
      standProfile: "TRIPLE_DECK",
      seatPattern: "DUO",
      facadeProfile: "SOLID_RIB",
      lightingProfile: "EVENT",
      environmentProfile: "URBAN",
    },
  },
  {
    id: "classic-daylight",
    label: "클래식 데이라이트",
    tier: "FREE",
    tagline: "맑은 낮의 클래식 화이트 · 정통 매치데이",
    swatch: { from: "#30373d", to: "#a9d4e5" },
    recipe: {
      tierCount: 2,
      roofCoverage: 0.72,
      crowdDensity: 0.86,
      seatColor: 0x30373d,
      accentColor: 0xa9d4e5,
      columnStyle: "straight",
      presentationProfile: "SERVICE_HOME",
      homeView: "INTERIOR",
      bowlProfile: "STEEP",
      roofProfile: "HALF_CANOPY",
      standProfile: "DOUBLE_DECK",
      seatPattern: "DUO",
      facadeProfile: "SOLID_RIB",
      lightingProfile: "DAYLIGHT",
      environmentProfile: "CIVIC",
    },
  },
] as const;

export const DEFAULT_SERVICE_STADIUM_ID = SERVICE_STADIUM_PRESETS[0].id;

export const STADIUM_SELECTION_STORAGE_KEY = "snapn:v2:stadium-selection";

export interface StadiumSelectionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const CUSTOM_STADIUM_ID = "custom-diy";

export const STADIUM_CUSTOM_RECIPE_STORAGE_KEY = "snapn:v2:stadium-selection:custom";

export function getServiceStadiumPreset(id: string): ServiceStadiumPreset | null {
  return SERVICE_STADIUM_PRESETS.find((preset) => preset.id === id) ?? null;
}

function isRecipeLike(value: unknown): value is StadiumRecipe {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StadiumRecipe>;
  return typeof candidate.tierCount === "number"
    && typeof candidate.roofCoverage === "number"
    && typeof candidate.crowdDensity === "number"
    && typeof candidate.seatColor === "number"
    && typeof candidate.accentColor === "number"
    && typeof candidate.columnStyle === "string";
}

export function loadCustomStadiumRecipe(storage: StadiumSelectionStorage): StadiumRecipe | null {
  const raw = storage.getItem(STADIUM_CUSTOM_RECIPE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isRecipeLike(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCustomStadiumRecipe(storage: StadiumSelectionStorage, recipe: StadiumRecipe): void {
  // Whatever profile the source (builder preview etc.) used, the stored
  // custom stadium always renders as the interior home view.
  const homeRecipe: StadiumRecipe = { ...recipe, presentationProfile: "SERVICE_HOME", homeView: "INTERIOR" };
  storage.setItem(STADIUM_CUSTOM_RECIPE_STORAGE_KEY, JSON.stringify(homeRecipe));
  storage.setItem(STADIUM_SELECTION_STORAGE_KEY, CUSTOM_STADIUM_ID);
}

function customStadiumPreset(recipe: StadiumRecipe): ServiceStadiumPreset {
  const toHex = (value: number) => `#${value.toString(16).padStart(6, "0")}`;
  return {
    id: CUSTOM_STADIUM_ID,
    label: "나의 DIY 경기장",
    tier: "FREE",
    tagline: "스타디움 설계에서 직접 완성한 나만의 홈",
    swatch: { from: toHex(recipe.seatColor), to: toHex(recipe.accentColor) },
    recipe,
  };
}

export function loadSelectedStadiumId(storage: StadiumSelectionStorage): string {
  const stored = storage.getItem(STADIUM_SELECTION_STORAGE_KEY);
  if (stored === CUSTOM_STADIUM_ID) {
    return loadCustomStadiumRecipe(storage) ? CUSTOM_STADIUM_ID : DEFAULT_SERVICE_STADIUM_ID;
  }
  if (stored && getServiceStadiumPreset(stored)) return stored;
  return DEFAULT_SERVICE_STADIUM_ID;
}

export function saveSelectedStadiumId(storage: StadiumSelectionStorage, id: string): boolean {
  if (id === CUSTOM_STADIUM_ID) {
    if (!loadCustomStadiumRecipe(storage)) return false;
    storage.setItem(STADIUM_SELECTION_STORAGE_KEY, id);
    return true;
  }
  if (!getServiceStadiumPreset(id)) return false;
  storage.setItem(STADIUM_SELECTION_STORAGE_KEY, id);
  return true;
}

export function listSelectableStadiums(storage: StadiumSelectionStorage): readonly ServiceStadiumPreset[] {
  const custom = loadCustomStadiumRecipe(storage);
  return custom ? [customStadiumPreset(custom), ...SERVICE_STADIUM_PRESETS] : SERVICE_STADIUM_PRESETS;
}

export function resolveSelectedStadium(storage: StadiumSelectionStorage): ServiceStadiumPreset {
  const id = loadSelectedStadiumId(storage);
  if (id === CUSTOM_STADIUM_ID) {
    const recipe = loadCustomStadiumRecipe(storage);
    if (recipe) return customStadiumPreset(recipe);
  }
  return getServiceStadiumPreset(id) ?? SERVICE_STADIUM_PRESETS[0];
}

export function resolveSelectedStadiumRecipe(storage: StadiumSelectionStorage): StadiumRecipe {
  return resolveSelectedStadium(storage).recipe;
}
