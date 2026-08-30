import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  STADIUM_BUILDER_PRESETS,
  STADIUM_BUILDER_STEPS,
  STADIUM_STYLE_FAMILY_OPTIONS,
  applyStadiumBuilderPreset,
  createStadiumBuilderDraft,
  loadStadiumBuilderDraft,
  saveStadiumBuilderDraft,
  validateStadiumBuilderDraft,
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
import { StadiumBuilderPreview } from "./StadiumBuilderPreview";
import "./stadiumBuilder.css";

const STEP_LABEL: Record<StadiumBuilderStep, string> = {
  STYLE: "스타일",
  BOWL: "볼",
  ROOF: "지붕",
  STAND: "관람석",
  SEAT: "좌석",
  FACADE_LIGHT: "외관·조명",
  ENVIRONMENT: "환경",
};

function updateDraft<T extends StadiumBuilderDraft>(draft: T, patch: Partial<StadiumBuilderDraft>): StadiumBuilderDraft {
  return { ...draft, ...patch };
}

function BuilderStepEditor({ draft, step, onChange }: { draft: StadiumBuilderDraft; step: StadiumBuilderStep; onChange: (draft: StadiumBuilderDraft) => void }) {
  const familyPresets = STADIUM_BUILDER_PRESETS.filter((preset) => preset.family === draft.styleFamily);

  if (step === "STYLE") {
    return <div className="stadium-builder-control-grid">
      <label>
        <span>스타일 패밀리</span>
        <select value={draft.styleFamily} onChange={(event) => {
          const preset = STADIUM_BUILDER_PRESETS.find((item) => item.family === event.target.value);
          if (preset) onChange(applyStadiumBuilderPreset(draft, preset.id));
        }}>
          {STADIUM_STYLE_FAMILY_OPTIONS.map((family) => <option key={family.id} value={family.id}>{family.label}</option>)}
        </select>
      </label>
      <label>
        <span>프리셋</span>
        <select value={draft.selectedPresetId} onChange={(event) => onChange(applyStadiumBuilderPreset(draft, event.target.value))}>
          {familyPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
        </select>
      </label>
      <div className="stadium-builder-family-description">
        {STADIUM_STYLE_FAMILY_OPTIONS.find((family) => family.id === draft.styleFamily)?.description}
      </div>
    </div>;
  }

  if (step === "BOWL") {
    const profiles: readonly BowlProfile[] = ["COMPACT", "BALANCED", "STEEP"];
    return <div className="stadium-builder-control-grid">
      <fieldset>
        <legend>관람석 단수</legend>
        <div className="stadium-builder-segmented">{([1, 2, 3] as const).map((tier) => <button type="button" className={draft.bowl.tierCount === tier ? "is-active" : ""} key={tier} onClick={() => onChange(updateDraft(draft, { bowl: { ...draft.bowl, tierCount: tier } }))}>{tier}단</button>)}</div>
      </fieldset>
      <label><span>Bowl Profile</span><select value={draft.bowl.profile} onChange={(event) => onChange(updateDraft(draft, { bowl: { ...draft.bowl, profile: event.target.value as BowlProfile } }))}>{profiles.map((profile) => <option key={profile}>{profile}</option>)}</select></label>
    </div>;
  }

  if (step === "ROOF") {
    const profiles: readonly RoofProfile[] = ["OPEN_RING", "HALF_CANOPY", "FULL_CANOPY"];
    return <div className="stadium-builder-control-grid">
      <label><span>Roof Profile</span><select value={draft.roof.profile} onChange={(event) => onChange(updateDraft(draft, { roof: { ...draft.roof, profile: event.target.value as RoofProfile } }))}>{profiles.map((profile) => <option key={profile}>{profile}</option>)}</select></label>
      <label><span>커버리지 · {Math.round(draft.roof.coverage * 100)}%</span><input type="range" min="0.55" max="0.94" step="0.01" value={draft.roof.coverage} onChange={(event) => onChange(updateDraft(draft, { roof: { ...draft.roof, coverage: Number(event.target.value) } }))} /></label>
    </div>;
  }

  if (step === "STAND") {
    const profiles: readonly StandProfile[] = ["SINGLE_BOWL", "DOUBLE_DECK", "TRIPLE_DECK"];
    return <div className="stadium-builder-control-grid"><label><span>Stand Profile</span><select value={draft.stand.profile} onChange={(event) => onChange(updateDraft(draft, { stand: { profile: event.target.value as StandProfile } }))}>{profiles.map((profile) => <option key={profile}>{profile}</option>)}</select></label><p className="stadium-builder-help">관람석 프로필과 Bowl 단수가 일치하지 않으면 저장 전에 Validator가 막습니다.</p></div>;
  }

  if (step === "SEAT") {
    const patterns: readonly SeatPattern[] = ["MONO", "DUO", "GRADIENT"];
    return <div className="stadium-builder-control-grid">
      <label><span>패턴</span><select value={draft.seat.pattern} onChange={(event) => onChange(updateDraft(draft, { seat: { ...draft.seat, pattern: event.target.value as SeatPattern } }))}>{patterns.map((pattern) => <option key={pattern}>{pattern}</option>)}</select></label>
      <label><span>기본 좌석색</span><input type="color" value={draft.seat.primaryColor} onChange={(event) => onChange(updateDraft(draft, { seat: { ...draft.seat, primaryColor: event.target.value } }))} /></label>
      <label><span>액센트</span><input type="color" value={draft.seat.accentColor} onChange={(event) => onChange(updateDraft(draft, { seat: { ...draft.seat, accentColor: event.target.value } }))} /></label>
      <label><span>프리뷰 밀도 · {Math.round(draft.seat.fillDensity * 100)}%</span><input type="range" min="0.60" max="0.95" step="0.01" value={draft.seat.fillDensity} onChange={(event) => onChange(updateDraft(draft, { seat: { ...draft.seat, fillDensity: Number(event.target.value) } }))} /></label>
    </div>;
  }

  if (step === "FACADE_LIGHT") {
    const facades: readonly FacadeProfile[] = ["SOLID_RIB", "GLASS_BAND", "LIGHT_FRAME"];
    const lighting: readonly LightingProfile[] = ["DAYLIGHT", "BALANCED", "EVENT"];
    return <div className="stadium-builder-control-grid">
      <label><span>Facade</span><select value={draft.facadeLight.facade} onChange={(event) => onChange(updateDraft(draft, { facadeLight: { ...draft.facadeLight, facade: event.target.value as FacadeProfile } }))}>{facades.map((profile) => <option key={profile}>{profile}</option>)}</select></label>
      <label><span>Lighting</span><select value={draft.facadeLight.lighting} onChange={(event) => onChange(updateDraft(draft, { facadeLight: { ...draft.facadeLight, lighting: event.target.value as LightingProfile } }))}>{lighting.map((profile) => <option key={profile}>{profile}</option>)}</select></label>
      <p className="stadium-builder-help">현재 3D Recipe에서는 외관 프로필이 column style에 연결됩니다. 세부 facade geometry와 실제 environment asset은 다음 runtime 확장 대상입니다.</p>
    </div>;
  }

  const environments: readonly EnvironmentProfile[] = ["URBAN", "PARK", "COASTAL", "CIVIC", "NIGHT_EVENT"];
  return <div className="stadium-builder-control-grid">
    <label><span>Environment</span><select value={draft.environment.profile} onChange={(event) => onChange(updateDraft(draft, { environment: { profile: event.target.value as EnvironmentProfile } }))}>{environments.map((profile) => <option key={profile}>{profile}</option>)}</select></label>
    <p className="stadium-builder-help">Environment는 현재 semantic draft로 저장되며 배경 asset 교체는 별도 renderer adapter에서 연결합니다. 저장 시 지원되지 않는 조합은 경고로 표시합니다.</p>
  </div>;
}

export function StadiumBuilderPage() {
  const [draft, setDraft] = useState<StadiumBuilderDraft>(() => {
    if (typeof window === "undefined") return createStadiumBuilderDraft();
    return loadStadiumBuilderDraft(window.localStorage) ?? createStadiumBuilderDraft();
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState("저장되지 않은 변경사항이 있습니다.");
  const currentStep = STADIUM_BUILDER_STEPS[stepIndex];
  const validation = useMemo(() => validateStadiumBuilderDraft(draft), [draft]);

  useEffect(() => {
    setSaveMessage("저장되지 않은 변경사항이 있습니다.");
  }, [draft.selectedPresetId, draft.bowl, draft.roof, draft.stand, draft.seat, draft.facadeLight, draft.environment]);

  const save = () => {
    if (!validation.valid) {
      setSaveMessage("Validator 오류를 해결한 뒤 저장할 수 있습니다.");
      return;
    }
    const result = saveStadiumBuilderDraft(window.localStorage, draft, draft.revision);
    if (result.status === "CONFLICT") {
      setSaveMessage(`다른 버전이 먼저 저장되었습니다. 서버 대체 없이 최신 로컬 revision ${result.current.revision}을 불러왔습니다.`);
      setDraft(result.current);
      return;
    }
    setDraft(result.draft);
    setSaveMessage(`revision ${result.draft.revision} 저장 완료`);
  };

  const restore = () => {
    const restored = loadStadiumBuilderDraft(window.localStorage);
    if (!restored) {
      setSaveMessage("저장된 draft가 없습니다.");
      return;
    }
    setDraft(restored);
    setSaveMessage(`revision ${restored.revision} 복구 완료`);
  };

  return <main className="shell-main stadium-builder-page">
    <header className="stadium-builder-header">
      <div><p className="eyebrow">STADIUM BUILDER · RECIPE V1</p><h1>나의 경기장 만들기</h1></div>
      <div className="stadium-builder-header-actions"><Link className="surface-link" to="/home">경기장으로 돌아가기</Link><button type="button" onClick={restore}>복구</button><button type="button" className="stadium-builder-save" onClick={save}>저장</button></div>
    </header>

    <section className="stadium-builder-workspace">
      <div className="stadium-builder-editor">
        <nav className="stadium-builder-steps" aria-label="경기장 Builder 단계">
          {STADIUM_BUILDER_STEPS.map((step, index) => <button key={step} type="button" className={index === stepIndex ? "is-active" : index < stepIndex ? "is-complete" : ""} onClick={() => setStepIndex(index)}><span>{String(index + 1).padStart(2, "0")}</span>{STEP_LABEL[step]}</button>)}
        </nav>

        <section className="stadium-builder-step-panel" aria-label={`${STEP_LABEL[currentStep]} 설정`}>
          <div className="stadium-builder-step-title"><span>STEP {stepIndex + 1} / {STADIUM_BUILDER_STEPS.length}</span><h2>{STEP_LABEL[currentStep]}</h2></div>
          <BuilderStepEditor draft={draft} step={currentStep} onChange={setDraft} />
          <div className="stadium-builder-step-nav">
            <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>이전</button>
            <button type="button" disabled={stepIndex === STADIUM_BUILDER_STEPS.length - 1} onClick={() => setStepIndex((current) => Math.min(STADIUM_BUILDER_STEPS.length - 1, current + 1))}>다음</button>
          </div>
        </section>

        <section className={`stadium-builder-validator ${validation.valid ? "is-valid" : "has-errors"}`} aria-label="Builder Validator">
          <div><span>VALIDATOR</span><strong>{validation.valid ? "저장 가능한 조합" : `${validation.errors.length}개 오류`}</strong></div>
          {validation.errors.map((issue) => <p key={issue.code} className="is-error"><b>{issue.field}</b> · {issue.message}</p>)}
          {validation.warnings.map((issue) => <p key={issue.code} className="is-warning"><b>{issue.field}</b> · {issue.message}</p>)}
          {validation.errors.length === 0 && validation.warnings.length === 0 && <p>현재 Recipe와 호환되는 조합입니다.</p>}
        </section>
        <p className="stadium-builder-save-message" aria-live="polite">{saveMessage}</p>
      </div>

      <StadiumBuilderPreview draft={draft} />
    </section>
  </main>;
}
