import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import {
  STADIUM_BUILDER_STEPS,
  createStadiumBuilderDraft,
  loadStadiumBuilderDraft,
  saveStadiumBuilderDraft,
  validateStadiumBuilderDraft,
  type StadiumBuilderDraft,
  type StadiumBuilderStep,
} from "./stadiumBuilderModel";
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
  const [draft, setDraft] = useState<StadiumBuilderDraft>(() => {
    if (typeof window === "undefined") return createStadiumBuilderDraft();
    return loadStadiumBuilderDraft(window.localStorage) ?? createStadiumBuilderDraft();
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState("저장하지 않은 변경이 있습니다.");
  const currentStep = STADIUM_BUILDER_STEPS[stepIndex];
  const validation = useMemo(() => validateStadiumBuilderDraft(draft), [draft]);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const motionProfile = getStadiumBuilderMotionProfile(prefersReducedMotion);

  useEffect(() => {
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
      setDraft(result.current);
      return;
    }
    setDraft(result.draft);
    setSaveMessage(`revision ${result.draft.revision} 저장 완료`);
  };

  const restore = () => {
    const restored = loadStadiumBuilderDraft(window.localStorage);
    if (!restored) {
      setSaveMessage("복구할 저장본이 없습니다.");
      return;
    }
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
          <p className="stadium-builder-save-message" aria-live="polite">{saveMessage}</p>
        </aside>
      </section>
    </main>
  );
}
