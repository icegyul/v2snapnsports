import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LazyMotion, useReducedMotion } from "motion/react";
import { button as MotionButton, div as MotionDiv, span as MotionSpan } from "motion/react-m";
import { createStadiumWebglRenderer, type StadiumWebglRenderer } from "../../three/stadiumWebglV14";
import { loadStadiumMotionFeatures } from "./stadiumMotionLoader";
import {
  listSelectableStadiums,
  loadSelectedStadiumId,
  saveSelectedStadiumId,
  SERVICE_STADIUM_PRESETS,
  type ServiceStadiumPreset,
} from "./stadiumSelection";
import "./stadiumSelect.css";

type PreviewState = "INITIALIZING" | "READY" | "FALLBACK";

function readInitialSelection(): string {
  try {
    return loadSelectedStadiumId(window.localStorage);
  } catch {
    return SERVICE_STADIUM_PRESETS[0].id;
  }
}

function StadiumSelectPreview({ preset, reducedMotion }: { preset: ServiceStadiumPreset; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const orbitRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>("INITIALIZING");
  const [renderPreset, setRenderPreset] = useState(preset);

  useEffect(() => {
    const timer = window.setTimeout(() => setRenderPreset(preset), 160);
    return () => window.clearTimeout(timer);
  }, [preset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    rendererRef.current?.destroy();
    rendererRef.current = null;
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    setPreviewState("INITIALIZING");
    if (!canvas) return;

    let renderer: StadiumWebglRenderer | null = null;
    try {
      renderer = createStadiumWebglRenderer(canvas, "FULL", renderPreset.recipe);
    } catch {
      renderer = null;
    }
    if (!renderer) {
      setPreviewState("FALLBACK");
      return;
    }
    rendererRef.current = renderer;
    setPreviewState("READY");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderer?.render(orbitRef.current, 1);
    };
    resize();

    let observer: ResizeObserver | null = null;
    if (typeof window.ResizeObserver !== "undefined") {
      observer = new window.ResizeObserver(resize);
      observer.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }

    if (!reducedMotion && typeof window.requestAnimationFrame === "function") {
      const spin = () => {
        orbitRef.current += 0.045;
        renderer?.render(orbitRef.current, 1);
        frameRef.current = window.requestAnimationFrame(spin);
      };
      frameRef.current = window.requestAnimationFrame(spin);
    }

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      renderer?.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [reducedMotion, renderPreset]);

  return (
    <div
      className="stadium-select-preview"
      data-preview-state={previewState}
      data-preview-preset={renderPreset.id}
      style={{ "--swatch-from": renderPreset.swatch.from, "--swatch-to": renderPreset.swatch.to } as React.CSSProperties}
    >
      {/* Fresh canvas per preset: reusing one after destroy() strands the renderer on a lost WebGL context. */}
      <canvas key={renderPreset.id} ref={canvasRef} className="stadium-select-preview-canvas" />
      {previewState !== "READY" && <div className="stadium-select-preview-poster" aria-hidden="true" />}
      <span className="stadium-select-preview-chip">{previewState === "READY" ? "LIVE 3D" : "PREVIEW"}</span>
    </div>
  );
}

export function StadiumSelectPage() {
  const navigate = useNavigate();
  const reducedMotion = Boolean(useReducedMotion());
  const [selectedId, setSelectedId] = useState(readInitialSelection);
  const [stadiums] = useState<readonly ServiceStadiumPreset[]>(() => {
    try {
      return listSelectableStadiums(window.localStorage);
    } catch {
      return SERVICE_STADIUM_PRESETS;
    }
  });
  const selected = stadiums.find((preset) => preset.id === selectedId) ?? stadiums[0];

  const confirm = () => {
    try {
      saveSelectedStadiumId(window.localStorage, selected.id);
    } catch {
      // Selection still applies for this session even if storage is blocked.
    }
    navigate("/home");
  };

  return (
    <LazyMotion features={loadStadiumMotionFeatures} strict>
      <main className="shell-main stadium-select-page" data-focused-preset={selected.id}>
        <header className="stadium-select-header">
          <p className="eyebrow">STADIUM EXPERIENCE · SELECT</p>
          <h1>경기장 선택</h1>
          <p className="stadium-select-sub">팀의 홈 경기장 무드를 골라보세요. 언제든 다시 바꿀 수 있습니다.</p>
        </header>

        <StadiumSelectPreview preset={selected} reducedMotion={reducedMotion} />

        <div className="stadium-select-cards" role="radiogroup" aria-label="경기장 프리셋">
          {stadiums.map((preset, index) => {
            const active = preset.id === selected.id;
            return (
              <MotionButton
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={active}
                data-preset-id={preset.id}
                className={`stadium-select-card ${active ? "is-active" : ""}`}
                style={{ "--swatch-from": preset.swatch.from, "--swatch-to": preset.swatch.to } as React.CSSProperties}
                initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: reducedMotion ? 0 : index * 0.07, ease: [0.22, 0.72, 0, 1] }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                onClick={() => setSelectedId(preset.id)}
              >
                <span className="stadium-select-card-swatch" aria-hidden="true" />
                <span className="stadium-select-card-body">
                  <strong>
                    {preset.label}
                    <span className={`stadium-select-card-tier ${preset.tier === "PREMIUM" ? "is-premium" : ""}`}>
                      {preset.tier === "PREMIUM" ? "프리미엄 · 출시 기념 무료" : "기본 제공"}
                    </span>
                  </strong>
                  <span>{preset.tagline}</span>
                </span>
                {active && (
                  <MotionSpan
                    className="stadium-select-card-ring"
                    aria-hidden="true"
                    layoutId={reducedMotion ? undefined : "stadium-select-ring"}
                    transition={{ duration: 0.32, ease: [0.22, 0.72, 0, 1] }}
                  />
                )}
              </MotionButton>
            );
          })}
        </div>

        <MotionDiv
          className="stadium-select-actions"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: reducedMotion ? 0 : 0.32 }}
        >
          <button type="button" className="stadium-select-confirm" onClick={confirm}>
            이 경기장 사용
          </button>
          <button type="button" className="stadium-select-cancel" onClick={() => navigate("/home")}>
            돌아가기
          </button>
        </MotionDiv>

        <Link className="stadium-select-diy" to="/home/builder">
          <span>
            <strong>직접 만들기 · DIY 설계</strong>
            <span>구조·좌석·조명까지 7단계로 나만의 경기장을 완성하세요</span>
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      </main>
    </LazyMotion>
  );
}
