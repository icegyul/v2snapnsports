import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  STADIUM_BUILDER_STEPS,
  createStadiumBuilderDraft,
  loadStadiumBuilderDraft,
  saveStadiumBuilderDraft,
  stadiumBuilderDraftToRecipe,
  validateStadiumBuilderDraft,
  type StadiumBuilderDraft,
  type StadiumBuilderStep,
} from "./stadiumBuilderModel";
import { saveCustomStadiumRecipe } from "../stadium/stadiumSelection";
import {
  MAX_SAVED_DESIGNS,
  deleteDesign,
  listDesigns,
  loadDesign,
  renameDesign,
  saveDesignAs,
  type SavedStadiumDesign,
} from "./stadiumDesignLibrary";
import { StadiumBuilderControls } from "./StadiumBuilderControls";
import { getStadiumBuilderMotionProfile } from "./stadiumBuilderMotion";
import { StadiumBuilderPreview } from "./StadiumBuilderPreview";
import "./stadiumBuilder.css";
import "./stadiumBuilderService.css";

const STEP_LABEL: Record<StadiumBuilderStep, string> = {
  STYLE: "스타일",
  BOWL: "보울",
  ROOF: "지붕",
  STAND: "관람석",
  SEAT: "좌석",
  FACADE_LIGHT: "외관·조명",
  ENVIRONMENT: "환경",
};

const STEP_CAPTION: Record<StadiumBuilderStep, string> = {
  STYLE: "전체 미술 방향",
  BOWL: "경사와 규모",
  ROOF: "실루엣과 개방감",
  STAND: "데크 구조",
  SEAT: "컬러 아이덴티티",
  FACADE_LIGHT: "재질과 빛",
  ENVIRONMENT: "장소의 분위기",
};

export function StadiumBuilderPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<StadiumBuilderDraft>(() => {
    if (typeof window === "undefined") return createStadiumBuilderDraft();
    return loadStadiumBuilderDraft(window.localStorage) ?? createStadiumBuilderDraft();
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState("저장하지 않은 변경이 있습니다.");
  const [designs, setDesigns] = useState<readonly SavedStadiumDesign[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return listDesigns(window.localStorage);
    } catch {
      return [];
    }
  });
  const [designName, setDesignName] = useState("");
  const currentStep = STADIUM_BUILDER_STEPS[stepIndex];
  const validation = useMemo(() => validateStadiumBuilderDraft(draft), [draft]);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const motionProfile = getStadiumBuilderMotionProfile(prefersReducedMotion);

  // Loading or restoring a design replaces the draft wholesale, which would
  // otherwise trip the dirty-state message and wipe the confirmation the
  // person just asked for.
  const draftReplacedRef = useRef(false);

  useEffect(() => {
    if (draftReplacedRef.current) {
      draftReplacedRef.current = false;
      return;
    }
    setSaveMessage("저장하지 않은 변경이 있습니다.");
  }, [draft.selectedPresetId, draft.bowl, draft.roof, draft.stand, draft.seat, draft.facadeLight, draft.environment]);

  const save = () => {
    if (!validation.valid) {
      setSaveMessage("설계 충돌을 해결한 뒤 저장할 수 있습니다.");
      return;
    }
    const result = saveStadiumBuilderDraft(window.localStorage, draft, draft.revision);
    if (result.status === "CONFLICT") {
      setSaveMessage(`다른 버전이 먼저 저장되어 로컬 revision ${result.current.revision}을 불러왔습니다.`);
      draftReplacedRef.current = true;
      setDraft(result.current);
      return;
    }
    setDraft(result.draft);
    setSaveMessage(`revision ${result.draft.revision} 저장 완료`);
  };

  const applyToHome = () => {
    if (!validation.valid) {
      setSaveMessage("설계 충돌을 해결한 뒤 홈에 적용할 수 있습니다.");
      return;
    }
    const saved = saveStadiumBuilderDraft(window.localStorage, draft, draft.revision);
    const applied = saved.status === "SAVED" ? saved.draft : draft;
    try {
      saveCustomStadiumRecipe(window.localStorage, stadiumBuilderDraftToRecipe(applied));
    } catch {
      setSaveMessage("이 브라우저에서는 홈 적용을 저장할 수 없습니다.");
      return;
    }
    navigate("/home");
  };

  const refreshDesigns = () => {
    try {
      setDesigns(listDesigns(window.localStorage));
    } catch {
      setDesigns([]);
    }
  };

  const saveAsDesign = () => {
    if (!validation.valid) {
      setSaveMessage("설계 충돌을 해결한 뒤 저장할 수 있습니다.");
      return;
    }
    const result = saveDesignAs(window.localStorage, designName, draft, new Date().toISOString());
    if (result.status === "INVALID_NAME") {
      setSaveMessage("설계 이름을 입력해 주세요.");
      return;
    }
    if (result.status === "LIMIT_REACHED") {
      setSaveMessage(`설계는 최대 ${MAX_SAVED_DESIGNS}개까지 보관할 수 있습니다. 하나를 삭제한 뒤 저장해 주세요.`);
      return;
    }
    if (result.status === "BLOCKED") {
      setSaveMessage("이 브라우저에서는 설계를 저장할 수 없습니다.");
      return;
    }
    setDesignName("");
    refreshDesigns();
    setSaveMessage(`"${result.design.name}" 설계를 저장했습니다.`);
  };

  const openDesign = (design: SavedStadiumDesign) => {
    const stored = loadDesign(window.localStorage, design.id);
    if (!stored) {
      setSaveMessage("설계를 불러오지 못했습니다.");
      return;
    }
    draftReplacedRef.current = true;
    setDraft(stored);
    setSaveMessage(`"${design.name}" 설계를 불러왔습니다.`);
  };

  const renameSavedDesign = (design: SavedStadiumDesign) => {
    const next = window.prompt("설계 이름", design.name);
    if (next === null) return;
    if (!renameDesign(window.localStorage, design.id, next)) {
      setSaveMessage("이름을 바꾸지 못했습니다.");
      return;
    }
    refreshDesigns();
    setSaveMessage("설계 이름을 바꿨습니다.");
  };

  const removeDesign = (design: SavedStadiumDesign) => {
    if (!deleteDesign(window.localStorage, design.id)) return;
    refreshDesigns();
    setSaveMessage(`"${design.name}" 설계를 삭제했습니다.`);
  };

  const restore = () => {
    const restored = loadStadiumBuilderDraft(window.localStorage);
    if (!restored) {
      setSaveMessage("복구할 저장본이 없습니다.");
      return;
    }
    draftReplacedRef.current = true;
    setDraft(restored);
    setSaveMessage(`revision ${restored.revision} 복구 완료`);
  };

  return (
    <main className="shell-main stadium-builder-page" data-active-step={currentStep}>
      <header className="stadium-builder-header">
        <div className="stadium-builder-title-block">
          <p className="stadium-builder-kicker"><span /> STADIUM ATELIER</p>
          <h1>스타디움 설계</h1>
          <p>구조와 재질, 빛과 환경을 하나의 경기장 장면으로 완성하세요.</p>
        </div>
        <div className="stadium-builder-header-actions">
          <Link className="stadium-builder-back" to="/home"><span aria-hidden="true">←</span> 홈</Link>
          <button type="button" className="stadium-builder-restore" onClick={restore}>복구</button>
          <motion.button type="button" className="stadium-builder-save" onClick={save} whileTap={prefersReducedMotion ? undefined : { scale: 0.975 }}>
            저장 <span aria-hidden="true">↗</span>
          </motion.button>
          <motion.button type="button" className="stadium-builder-apply" onClick={applyToHome} whileTap={prefersReducedMotion ? undefined : { scale: 0.975 }}>
            이 경기장 사용
          </motion.button>
        </div>
      </header>

      <section className="stadium-builder-workspace">
        <StadiumBuilderPreview draft={draft} reducedMotion={prefersReducedMotion} activeStep={currentStep} />

        <aside className="stadium-builder-editor" aria-label="스타디움 설계 도구">
          <nav className="stadium-builder-steps" aria-label="경기장 Builder 단계">
            {STADIUM_BUILDER_STEPS.map((step, index) => (
              <motion.button
                key={step}
                type="button"
                aria-label={`${index + 1}단계 ${STEP_LABEL[step]}`}
                aria-current={index === stepIndex ? "step" : undefined}
                className={index === stepIndex ? "is-active" : index < stepIndex ? "is-complete" : ""}
                onClick={() => setStepIndex(index)}
                whileHover={prefersReducedMotion ? undefined : { x: 3 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{STEP_LABEL[step]}</strong>
                <small>{STEP_CAPTION[step]}</small>
              </motion.button>
            ))}
          </nav>

          <AnimatePresence initial={false} mode="wait">
            <motion.section
              key={currentStep}
              className="stadium-builder-step-panel"
              aria-label={`${STEP_LABEL[currentStep]} 설정`}
              initial={{ opacity: 0, y: motionProfile.panelOffset }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -motionProfile.panelOffset * 0.45 }}
              transition={motionProfile.panel}
            >
              <div className="stadium-builder-step-title">
                <div><span>STEP {String(stepIndex + 1).padStart(2, "0")}</span><small>{STEP_CAPTION[currentStep]}</small></div>
                <h2>{STEP_LABEL[currentStep]}</h2>
              </div>
              <StadiumBuilderControls draft={draft} step={currentStep} onChange={setDraft} />
              <div className="stadium-builder-step-nav">
                <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}><span aria-hidden="true">←</span> 이전</button>
                <button type="button" disabled={stepIndex === STADIUM_BUILDER_STEPS.length - 1} onClick={() => setStepIndex((current) => Math.min(STADIUM_BUILDER_STEPS.length - 1, current + 1))}>다음 <span aria-hidden="true">→</span></button>
              </div>
            </motion.section>
          </AnimatePresence>

          <section className={`stadium-builder-validator ${validation.valid ? "is-valid" : "has-errors"}`} aria-label="Builder Validator">
            <div><span>DESIGN CHECK</span><strong>{validation.valid ? "설계 호환성 확인" : `${validation.errors.length}개 충돌`}</strong></div>
            {validation.errors.map((issue) => <p key={issue.code} className="is-error"><b>{STEP_LABEL[issue.field]}</b> · {issue.message}</p>)}
            {validation.warnings.map((issue) => <p key={issue.code} className="is-warning"><b>{STEP_LABEL[issue.field]}</b> · {issue.message}</p>)}
            {validation.errors.length === 0 && validation.warnings.length === 0 && <p>현재 구조와 시각 프로필을 안전하게 렌더링할 수 있습니다.</p>}
          </section>
          <section className="stadium-builder-library" aria-label="내 설계 보관함">
            <div className="stadium-builder-library-head">
              <span>MY DESIGNS</span>
              <strong>내 설계 {designs.length}/{MAX_SAVED_DESIGNS}</strong>
            </div>
            <div className="stadium-builder-library-save">
              <input
                type="text"
                value={designName}
                aria-label="설계 이름"
                placeholder="예: 우리 홈 경기장"
                maxLength={24}
                onChange={(event) => setDesignName(event.target.value)}
              />
              <button type="button" onClick={saveAsDesign}>이름 붙여 저장</button>
            </div>
            {designs.length === 0
              ? <p className="stadium-builder-library-empty">저장된 설계가 없습니다. 지금 만든 경기장에 이름을 붙여 보관해 보세요.</p>
              : <ul className="stadium-builder-library-list">
                  {designs.map((design) => (
                    <li key={design.id} data-design-id={design.id}>
                      <span className="stadium-builder-library-name">{design.name}</span>
                      <span className="stadium-builder-library-date">{design.savedAt.slice(0, 10)}</span>
                      <button type="button" onClick={() => openDesign(design)}>불러오기</button>
                      <button type="button" onClick={() => renameSavedDesign(design)} aria-label={`${design.name} 이름 바꾸기`}>이름</button>
                      <button type="button" onClick={() => removeDesign(design)} aria-label={`${design.name} 삭제`}>삭제</button>
                    </li>
                  ))}
                </ul>}
          </section>
          <p className="stadium-builder-save-message" aria-live="polite">{saveMessage}</p>
        </aside>
      </section>
    </main>
  );
}
