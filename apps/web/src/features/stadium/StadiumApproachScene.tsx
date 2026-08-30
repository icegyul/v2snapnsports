import { useEffect, useRef, useState } from "react";
import type { CoreVisualMode } from "../../api/coreProductContracts";
import { createStadiumScene, nextStadiumMode } from "../../three/stadiumScene";
import { createStadiumWebglRenderer, type StadiumWebglRenderer } from "../../three/stadiumWebgl";

interface StadiumApproachSceneProps {
  readonly mode: CoreVisualMode;
  readonly onComplete?: () => void;
}

type RenderState = "INITIALIZING" | "READY" | "FALLBACK";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function StadiumApproachScene({ mode, onComplete }: StadiumApproachSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const [effectiveMode, setEffectiveMode] = useState<CoreVisualMode>(mode);
  const [renderState, setRenderState] = useState<RenderState>(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
  const [progress, setProgress] = useState(mode === "STATIC" ? 1 : 0);
  const scene = createStadiumScene(effectiveMode);

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
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
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

    if (!renderer || !renderer.renderApproach) {
      renderer?.destroy();
      setRenderState("INITIALIZING");
      setEffectiveMode(nextStadiumMode(effectiveMode));
      return;
    }

    const renderApproach = renderer.renderApproach.bind(renderer);
    rendererRef.current = renderer;
    setRenderState("READY");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderApproach(progressRef.current);
    };
    resize();

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
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
      renderApproach(1);
      onCompleteRef.current?.();
    } else {
      const durationMs = 4300;
      const start = performance.now();
      let lastPublished = -1;
      const tick = (now: number) => {
        const nextProgress = clamp01((now - start) / durationMs);
        progressRef.current = nextProgress;
        renderApproach(nextProgress);
        if (nextProgress === 1 || nextProgress - lastPublished >= 0.025) {
          lastPublished = nextProgress;
          setProgress(nextProgress);
        }
        if (nextProgress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(tick);
        } else {
          animationFrameRef.current = null;
          onCompleteRef.current?.();
        }
      };
      animationFrameRef.current = window.requestAnimationFrame(tick);
    }

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      renderer?.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [effectiveMode]);

  const phase = progress < 0.42 ? "외곽 접근" : progress < 0.72 ? "지붕 상부 통과" : "경기장 내부 진입";

  return (
    <section
      className="stadium-approach-surface"
      aria-label="외부에서 내부로 이동하는 3D 경기장 접근 장면"
      data-requested-mode={mode}
      data-render-mode={effectiveMode}
      data-render-state={renderState}
      data-approach-complete={progress >= 1 ? "true" : "false"}
    >
      <span className="stadium-approach-world" aria-hidden="true">
        <span className="stadium-approach-sky-glow" />
        <span className={`stadium-approach-fallback ${renderState === "READY" ? "stadium-approach-fallback-hidden" : ""}`}>
          <span className="stadium-approach-fallback-ring stadium-approach-fallback-ring-outer" />
          <span className="stadium-approach-fallback-ring stadium-approach-fallback-ring-inner" />
          <span className="stadium-approach-fallback-pitch" />
        </span>
        <canvas
          ref={canvasRef}
          className={`stadium-approach-webgl-canvas ${renderState === "READY" ? "stadium-approach-webgl-ready" : ""}`}
        />
        <span className="stadium-quality-chip">{scene.modeLabel}</span>
      </span>

      <div className="stadium-approach-hud" aria-live="polite">
        <span className="stadium-approach-phase">{phase}</span>
        <div className="stadium-approach-track" aria-hidden="true">
          <span className="stadium-approach-track-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
        <div className="stadium-approach-steps" aria-hidden="true">
          <span>OUTSIDE</span>
          <span>ROOF</span>
          <span>INSIDE</span>
        </div>
      </div>
    </section>
  );
}
