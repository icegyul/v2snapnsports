import {
  STADIUM_BUILDER_PRESETS,
  STADIUM_STYLE_FAMILY_OPTIONS,
  applyStadiumBuilderPreset,
  type BowlProfile,
  type EnvironmentProfile,
  type FacadeProfile,
  type LightingProfile,
  type RoofProfile,
  type SeatPattern,
  type StadiumBuilderDraft,
  type StadiumBuilderStep,
  type StandProfile,
} from "./stadiumBuilderModel";

interface StadiumBuilderControlsProps {
  readonly draft: StadiumBuilderDraft;
  readonly step: StadiumBuilderStep;
  readonly onChange: (draft: StadiumBuilderDraft) => void;
}

const BOWL_LABEL: Record<BowlProfile, string> = {
  COMPACT: "컴팩트",
  BALANCED: "밸런스",
  STEEP: "스티프",
};

const ROOF_LABEL: Record<RoofProfile, string> = {
  OPEN_RING: "오픈 링",
  HALF_CANOPY: "하프 캐노피",
  FULL_CANOPY: "풀 캐노피",
};

const STAND_LABEL: Record<StandProfile, string> = {
  SINGLE_BOWL: "싱글 보울",
  DOUBLE_DECK: "더블 데크",
  TRIPLE_DECK: "트리플 데크",
};

const SEAT_LABEL: Record<SeatPattern, string> = {
  MONO: "모노",
  DUO: "듀오",
  GRADIENT: "그라디언트",
};

const FACADE_LABEL: Record<FacadeProfile, string> = {
  SOLID_RIB: "솔리드 리브",
  GLASS_BAND: "글라스 밴드",
  LIGHT_FRAME: "라이트 프레임",
};

const LIGHT_LABEL: Record<LightingProfile, string> = {
  DAYLIGHT: "데이라이트",
  BALANCED: "밸런스",
  EVENT: "이벤트",
};

const ENVIRONMENT_LABEL: Record<EnvironmentProfile, string> = {
  URBAN: "어반",
  PARK: "파크",
  COASTAL: "코스탈",
  CIVIC: "시빅",
  NIGHT_EVENT: "나이트 이벤트",
};

function updateDraft(draft: StadiumBuilderDraft, patch: Partial<StadiumBuilderDraft>): StadiumBuilderDraft {
  return { ...draft, ...patch };
}

export function StadiumBuilderControls({ draft, step, onChange }: StadiumBuilderControlsProps) {
  const familyPresets = STADIUM_BUILDER_PRESETS.filter((preset) => preset.family === draft.styleFamily);

  if (step === "STYLE") {
    return (
      <div className="stadium-builder-control-grid">
        <label>
          <span>스타일 컬렉션</span>
          <select value={draft.styleFamily} onChange={(event) => {
            const preset = STADIUM_BUILDER_PRESETS.find((item) => item.family === event.target.value);
            if (preset) onChange(applyStadiumBuilderPreset(draft, preset.id));
          }}>
            {STADIUM_STYLE_FAMILY_OPTIONS.map((family) => <option key={family.id} value={family.id}>{family.label}</option>)}
          </select>
        </label>
        <label>
          <span>설계 프리셋</span>
          <select value={draft.selectedPresetId} onChange={(event) => onChange(applyStadiumBuilderPreset(draft, event.target.value))}>
            {familyPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
          </select>
        </label>
        <div className="stadium-builder-family-description">
          <span>DESIGN NOTE</span>
          <p>{STADIUM_STYLE_FAMILY_OPTIONS.find((family) => family.id === draft.styleFamily)?.description}</p>
        </div>
      </div>
    );
  }

  if (step === "BOWL") {
    const profiles: readonly BowlProfile[] = ["COMPACT", "BALANCED", "STEEP"];
    return (
      <div className="stadium-builder-control-grid">
        <fieldset>
          <legend>관람석 단수</legend>
          <div className="stadium-builder-segmented">
            {([1, 2, 3] as const).map((tier) => (
              <button type="button" className={draft.bowl.tierCount === tier ? "is-active" : ""} key={tier} onClick={() => onChange(updateDraft(draft, { bowl: { ...draft.bowl, tierCount: tier } }))}>{tier}단</button>
            ))}
          </div>
        </fieldset>
        <label><span>보울 형태</span><select value={draft.bowl.profile} onChange={(event) => onChange(updateDraft(draft, { bowl: { ...draft.bowl, profile: event.target.value as BowlProfile } }))}>{profiles.map((profile) => <option key={profile} value={profile}>{BOWL_LABEL[profile]}</option>)}</select></label>
        <p className="stadium-builder-help">경사와 반경을 함께 조절해 피치의 압박감과 관람 시야를 바꿉니다.</p>
      </div>
    );
  }

  if (step === "ROOF") {
    const profiles: readonly RoofProfile[] = ["OPEN_RING", "HALF_CANOPY", "FULL_CANOPY"];
    return (
      <div className="stadium-builder-control-grid">
        <label><span>지붕 형태</span><select value={draft.roof.profile} onChange={(event) => onChange(updateDraft(draft, { roof: { ...draft.roof, profile: event.target.value as RoofProfile } }))}>{profiles.map((profile) => <option key={profile} value={profile}>{ROOF_LABEL[profile]}</option>)}</select></label>
        <label><span>지붕 커버리지 · {Math.round(draft.roof.coverage * 100)}%</span><input type="range" min="0.55" max="0.94" step="0.01" value={draft.roof.coverage} onChange={(event) => onChange(updateDraft(draft, { roof: { ...draft.roof, coverage: Number(event.target.value) } }))} /></label>
      </div>
    );
  }

  if (step === "STAND") {
    const profiles: readonly StandProfile[] = ["SINGLE_BOWL", "DOUBLE_DECK", "TRIPLE_DECK"];
    return (
      <div className="stadium-builder-control-grid">
        <label><span>스탠드 구조</span><select value={draft.stand.profile} onChange={(event) => onChange(updateDraft(draft, { stand: { profile: event.target.value as StandProfile } }))}>{profiles.map((profile) => <option key={profile} value={profile}>{STAND_LABEL[profile]}</option>)}</select></label>
        <p className="stadium-builder-help">보울 단수와 일치하는 구조만 저장할 수 있습니다. 검증기는 충돌을 자동 수정하지 않습니다.</p>
      </div>
    );
  }

  if (step === "SEAT") {
    const patterns: readonly SeatPattern[] = ["MONO", "DUO", "GRADIENT"];
    return (
      <div className="stadium-builder-control-grid">
        <label><span>좌석 패턴</span><select value={draft.seat.pattern} onChange={(event) => onChange(updateDraft(draft, { seat: { ...draft.seat, pattern: event.target.value as SeatPattern } }))}>{patterns.map((pattern) => <option key={pattern} value={pattern}>{SEAT_LABEL[pattern]}</option>)}</select></label>
        <div className="stadium-builder-color-pair">
          <label><span>기본 좌석색</span><input type="color" value={draft.seat.primaryColor} onChange={(event) => onChange(updateDraft(draft, { seat: { ...draft.seat, primaryColor: event.target.value } }))} /></label>
          <label><span>강조 좌석색</span><input type="color" value={draft.seat.accentColor} onChange={(event) => onChange(updateDraft(draft, { seat: { ...draft.seat, accentColor: event.target.value } }))} /></label>
        </div>
        <label><span>좌석 밀도 · {Math.round(draft.seat.fillDensity * 100)}%</span><input type="range" min="0.60" max="0.95" step="0.01" value={draft.seat.fillDensity} onChange={(event) => onChange(updateDraft(draft, { seat: { ...draft.seat, fillDensity: Number(event.target.value) } }))} /></label>
      </div>
    );
  }

  if (step === "FACADE_LIGHT") {
    const facades: readonly FacadeProfile[] = ["SOLID_RIB", "GLASS_BAND", "LIGHT_FRAME"];
    const lighting: readonly LightingProfile[] = ["DAYLIGHT", "BALANCED", "EVENT"];
    return (
      <div className="stadium-builder-control-grid">
        <label><span>외관 구조</span><select value={draft.facadeLight.facade} onChange={(event) => onChange(updateDraft(draft, { facadeLight: { ...draft.facadeLight, facade: event.target.value as FacadeProfile } }))}>{facades.map((profile) => <option key={profile} value={profile}>{FACADE_LABEL[profile]}</option>)}</select></label>
        <label><span>조명 장면</span><select value={draft.facadeLight.lighting} onChange={(event) => onChange(updateDraft(draft, { facadeLight: { ...draft.facadeLight, lighting: event.target.value as LightingProfile } }))}>{lighting.map((profile) => <option key={profile} value={profile}>{LIGHT_LABEL[profile]}</option>)}</select></label>
        <p className="stadium-builder-help">외관의 리브·유리·발광 프레임과 실제 장면 노출이 즉시 바뀝니다.</p>
      </div>
    );
  }

  const environments: readonly EnvironmentProfile[] = ["URBAN", "PARK", "COASTAL", "CIVIC", "NIGHT_EVENT"];
  return (
    <div className="stadium-builder-control-grid">
      <label><span>주변 환경</span><select value={draft.environment.profile} onChange={(event) => onChange(updateDraft(draft, { environment: { profile: event.target.value as EnvironmentProfile } }))}>{environments.map((profile) => <option key={profile} value={profile}>{ENVIRONMENT_LABEL[profile]}</option>)}</select></label>
      <p className="stadium-builder-help">스카이라인, 공원 수목, 해안 수면, 시빅 플라자, 야간 이벤트 대기를 실제 프리뷰에 구성합니다.</p>
    </div>
  );
}
