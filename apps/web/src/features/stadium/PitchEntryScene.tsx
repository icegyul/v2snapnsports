import { useEffect, useRef, useState } from "react";
import type { CoreVisualMode } from "../../api/coreProductContracts";
import { nextStadiumMode } from "../../three/stadiumScene";
import { createStadiumWebglRenderer, type StadiumWebglRenderer } from "../../three/stadiumWebgl";

interface PitchEntrySceneProps {
  readonly mode: CoreVisualMode;
  readonly onComplete?: () => void;
}

type RenderState = "INITIALIZING" | "READY" | "FALLBACK";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function PitchEntryScene({ mode, onComplete }: PitchEntrySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const [effectiveMode, setEffectiveMode] = useState<CoreVisualMode>(mode);
  const [renderState, setRenderState] = useState<RenderState>(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
  const [progress, setProgress] = useState(mode === "STATIC" ? 1 : 0);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setEffectiveMode(mode);
    setRenderState(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
    progressRef.current = mode === "STATIC" ? 1 : 0;
    setProgress(progressRef.current);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    rendererRef.current?.destroy();
    rendererRef.current = null;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!canvas || effectiveMode === "STATIC") {
      setRenderState("FALLBACK");
      progressRef.current = 1;
      setProgress(1);
      onCompleteRef.current?.();
      return;
    }

    let renderer: StadiumWebglRenderer | null = null;
    try {
      renderer = createStadiumWebglRenderer(canvas, effectiveMode);
    } catch {
      renderer = null;
    }

    if (!renderer || !renderer.renderPitchEntry) {
      renderer?.destroy();
      setRenderState("INITIALIZING");
      setEffectiveMode(nextStadiumMode(effectiveMode));
      return;
    }

    const renderPitchEntry = renderer.renderPitchEntry.bind(renderer);
    rendererRef.current = renderer;
    setRenderState("READY");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderPitchEntry(progressRef.current);
    };
    resize();

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      rendererRef.current?.destroy();
      rendererRef.current = null;
      setRenderState("INITIALIZING");
      setEffectiveMode((current) => nextStadiumMode(current));
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    let observer: ResizeObserver | null = null;
    if (typeof window.ResizeObserver !== "undefined") {
      observer = new window.ResizeObserver(resize);
      observer.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reducedMotion) {
      progressRef.current = 1;
      setProgress(1);
      renderPitchEntry(1);
      onCompleteRef.current?.();
    } else {
      const durationMs = 3600;
      const maxFrameDeltaMs = 120;
      const targetFrameDelayMs = 28;
      let elapsedMs = 0;
      let previousFrameAt = performance.now();
      let lastPublished = -1;

      const tick = () => {
        const now = performance.now();
        const rawDelta = now - previousFrameAt;
        previousFrameAt = now;
        elapsedMs += Math.min(maxFrameDeltaMs, Math.max(0, rawDelta));
        const nextProgress = clamp01(elapsedMs / durationMs);
        progressRef.current = nextProgress;
        renderPitchEntry(nextProgress);
        if (nextProgress === 1 || nextProgress - lastPublished >= 0.025) {
          lastPublished = nextProgress;
          setProgress(nextProgress);
        }
        if (nextProgress < 1) {
          timerRef.current = window.setTimeout(tick, targetFrameDelayMs);
        } else {
          timerRef.current = null;
          onCompleteRef.current?.();
        }
      };
      timerRef.current = window.setTimeout(tick, targetFrameDelayMs);
    }

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      renderer?.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [effectiveMode]);

  const phase = progress < 0.36 ? "상단 bowl" : progress < 0.72 ? "터치라인 접근" : "피치 레벨";

  return (
    <section
      className="pitch-entry-surface"
      aria-label="경기장 내부에서 피치 레벨로 내려가는 3D 장면"
      data-requested-mode={mode}
      data-render-mode={effectiveMode}
      data-render-state={renderState}
      data-pitch-entry-progress={progress.toFixed(3)}
      data-pitch-entry-complete={progress >= 1 ? "true" : "false"}
    >
      <canvas
        ref={canvasRef}
        className={`pitch-entry-webgl-canvas ${renderState === "READY" ? "pitch-entry-webgl-ready" : ""}`}
      />
      <div className="pitch-entry-hud" aria-live="polite">
        <span className="pitch-entry-phase">{phase}</span>
        <div className="pitch-entry-track" aria-hidden="true">
          <span className="pitch-entry-track-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
        <div className="pitch-entry-steps" aria-hidden="true">
          <span>BOWL</span>
          <span>TOUCHLINE</span>
          <span>PITCH</span>
        </div>
      </div>
    </section>
  );
}
