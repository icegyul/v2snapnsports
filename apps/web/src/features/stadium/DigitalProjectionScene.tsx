import { useEffect, useRef, useState } from "react";
import type { CoreFormation, CoreStadiumHome, CoreVisualMode } from "../../api/coreProductContracts";
import { nextStadiumMode } from "../../three/stadiumScene";
import { createStadiumWebglRenderer, type StadiumWebglRenderer } from "../../three/stadiumWebgl";

interface DigitalProjectionSceneProps {
  readonly mode: CoreVisualMode;
  readonly home: CoreStadiumHome;
  readonly formation: CoreFormation;
  readonly onComplete?: () => void;
}

type RenderState = "INITIALIZING" | "READY" | "FALLBACK";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function DigitalProjectionScene({ mode, home, formation, onComplete }: DigitalProjectionSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const [effectiveMode, setEffectiveMode] = useState<CoreVisualMode>(mode);
  const [renderState, setRenderState] = useState<RenderState>(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
  const [progress, setProgress] = useState(mode === "STATIC" ? 1 : 0);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

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
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);

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

    if (!renderer || !renderer.renderDigitalProjection) {
      renderer?.destroy();
      setRenderState("INITIALIZING");
      setEffectiveMode(nextStadiumMode(effectiveMode));
      return;
    }

    const renderProjection = renderer.renderDigitalProjection.bind(renderer);
    rendererRef.current = renderer;
    setRenderState("READY");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderProjection(progressRef.current);
    };
    resize();

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
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
      renderProjection(1);
      onCompleteRef.current?.();
    } else {
      const durationMs = 2400;
      const maxFrameDeltaMs = 120;
      const targetFrameDelayMs = 32;
      let elapsedMs = 0;
      let previousFrameAt = performance.now();
      let lastPublished = -1;
      const tick = () => {
        const now = performance.now();
        const delta = Math.min(maxFrameDeltaMs, Math.max(0, now - previousFrameAt));
        previousFrameAt = now;
        elapsedMs += delta;
        const nextProgress = clamp01(elapsedMs / durationMs);
        progressRef.current = nextProgress;
        renderProjection(nextProgress);
        if (nextProgress === 1 || nextProgress - lastPublished >= 0.04) {
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

  return (
    <section
      className="digital-projection-surface"
      aria-label="3D 디지털 프로젝션"
      data-requested-mode={mode}
      data-render-mode={effectiveMode}
      data-render-state={renderState}
      data-projection-progress={progress.toFixed(3)}
      data-projection-complete={progress >= 1 ? "true" : "false"}
    >
      <canvas ref={canvasRef} className={`digital-projection-canvas ${renderState === "READY" ? "digital-projection-ready" : ""}`} />
      <div className={`digital-projection-data ${progress >= 0.36 ? "digital-projection-data-visible" : ""}`}>
        <span>DIGITAL PITCH PROJECTION</span>
        <strong>#{formation.player.shirtNumber} · {formation.player.primaryPosition}</strong>
        <small>{home.team.displayName} · {formation.shapeLabel} · 연결 동료 {formation.teammates.length}명</small>
        <small>{home.scoreboardLabel}</small>
      </div>
      <div className="digital-projection-hud">
        <span>{progress < 0.30 ? "피치 스캔" : progress < 0.72 ? "디지털 레이어 투영" : "프로젝션 준비 완료"}</span>
        <div><i style={{ transform: `scaleX(${progress})` }} /></div>
      </div>
    </section>
  );
}
