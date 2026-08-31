import type { StadiumRecipe } from "../../three/stadiumWebglV14";
import { BASE_STADIUM_ACCEPTANCE_RECIPE } from "../../three/stadiumWebglV151";

export interface ServiceStadiumPreset {
  readonly id: string;
  readonly label: string;
  readonly tagline: string;
  readonly swatch: {
    readonly from: string;
    readonly to: string;
  };
  readonly recipe: StadiumRecipe;
}

export const SERVICE_STADIUM_PRESETS: readonly ServiceStadiumPreset[] = [
  {
    id: "signature-arc",
    label: "시그니처 아크",
    tagline: "균형 잡힌 시그니처 홈 · 낮과 밤 모두 어울리는 기본 룩",
    swatch: { from: "#17344f", to: "#159bd2" },
    recipe: { ...BASE_STADIUM_ACCEPTANCE_RECIPE },
  },
  {
    id: "night-cyan",
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
      bowlProfile: "STEEP",
      roofProfile: "HALF_CANOPY",
      standProfile: "DOUBLE_DECK",
      seatPattern: "DUO",
      facadeProfile: "SOLID_RIB",
      lightingProfile: "BALANCED",
      environmentProfile: "URBAN",
    },
  },
] as const;

export const DEFAULT_SERVICE_STADIUM_ID = SERVICE_STADIUM_PRESETS[0].id;

export const STADIUM_SELECTION_STORAGE_KEY = "snapn:v2:stadium-selection";

export interface StadiumSelectionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getServiceStadiumPreset(id: string): ServiceStadiumPreset | null {
  return SERVICE_STADIUM_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function loadSelectedStadiumId(storage: StadiumSelectionStorage): string {
  const stored = storage.getItem(STADIUM_SELECTION_STORAGE_KEY);
  if (stored && getServiceStadiumPreset(stored)) return stored;
  return DEFAULT_SERVICE_STADIUM_ID;
}

export function saveSelectedStadiumId(storage: StadiumSelectionStorage, id: string): boolean {
  if (!getServiceStadiumPreset(id)) return false;
  storage.setItem(STADIUM_SELECTION_STORAGE_KEY, id);
  return true;
}

export function resolveSelectedStadium(storage: StadiumSelectionStorage): ServiceStadiumPreset {
  return getServiceStadiumPreset(loadSelectedStadiumId(storage)) ?? SERVICE_STADIUM_PRESETS[0];
}

export function resolveSelectedStadiumRecipe(storage: StadiumSelectionStorage): StadiumRecipe {
  return resolveSelectedStadium(storage).recipe;
}
