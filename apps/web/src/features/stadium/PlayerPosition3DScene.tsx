import { useEffect, useMemo, useRef, useState } from "react";
import type { CorePlayer, CoreVisualMode } from "../../api/coreProductContracts";
import { nextStadiumMode } from "../../three/stadiumScene";
import { createStadiumWebglRenderer, type StadiumWebglRenderer } from "../../three/stadiumWebgl";

interface PlayerPosition3DSceneProps {
  readonly mode: CoreVisualMode;
  readonly player: CorePlayer;
  readonly onComplete?: () => void;
}

type RenderState = "INITIALIZING" | "READY" | "FALLBACK";

type PitchCoordinate = Readonly<{ x: number; z: number }>;

function coordinateForPosition(position: string): PitchCoordinate {
  switch (position.toUpperCase()) {
    case "GK": return { x: -45, z: 0 };
    case "LB": return { x: -28, z: -23 };
    case "LCB": return { x: -30, z: -10 };
    case "CB": return { x: -30, z: 0 };
    case "RCB": return { x: -30, z: 10 };
    case "RB": return { x: -28, z: 23 };
    case "LWB": return { x: -18, z: -27 };
    case "RWB": return { x: -18, z: 27 };
    case "CDM":
    case "DM": return { x: -14, z: 0 };
    case "LCM": return { x: -2, z: -11 };
    case "RCM": return { x: -2, z: 11 };
    case "CM": return { x: 0, z: 0 };
    case "CAM":
    case "AM": return { x: 16, z: 0 };
    case "LM": return { x: 7, z: -24 };
    case "RM": return { x: 7, z: 24 };
    case "LW": return { x: 24, z: -25 };
    case "RW": return { x: 24, z: 25 };
    case "CF": return { x: 31, z: 0 };
    case "ST": return { x: 38, z: 0 };
    default: return { x: 0, z: 0 };
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function PlayerPosition3DScene({ mode, player, onComplete }: PlayerPosition3DSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const [effectiveMode, setEffectiveMode] = useState<CoreVisualMode>(mode);
  const [renderState, setRenderState] = useState<RenderState>(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
  const [progress, setProgress] = useState(mode === "STATIC" ? 1 : 0);
  const coordinate = useMemo(() => coordinateForPosition(player.primaryPosition), [player.primaryPosition]);

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

    if (!renderer || !renderer.renderPlayerPosition) {
      renderer?.destroy();
      setRenderState("INITIALIZING");
      setEffectiveMode(nextStadiumMode(effectiveMode));
      return;
    }

    const renderPosition = renderer.renderPlayerPosition.bind(renderer);
    rendererRef.current = renderer;
    setRenderState("READY");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderPosition(progressRef.current, coordinate.x, coordinate.z);
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
      renderPosition(1, coordinate.x, coordinate.z);
      onCompleteRef.current?.();
    } else {
      const durationMs = 2200;
      const maxFrameDeltaMs = 120;
      const targetFrameDelayMs = 32;
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
        renderPosition(nextProgress, coordinate.x, coordinate.z);
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
  }, [coordinate.x, coordinate.z, effectiveMode]);

  return (
    <section
      className="player-position-3d-surface"
      aria-label={`${player.primaryPosition} 나의 3D 포지션`}
      data-requested-mode={mode}
      data-render-mode={effectiveMode}
      data-render-state={renderState}
      data-position-progress={progress.toFixed(3)}
      data-position-complete={progress >= 1 ? "true" : "false"}
      data-position-x={coordinate.x}
      data-position-z={coordinate.z}
    >
      <canvas ref={canvasRef} className={`player-position-3d-canvas ${renderState === "READY" ? "player-position-3d-ready" : ""}`} />
      <div className={`player-position-id ${progress >= 0.45 ? "player-position-id-visible" : ""}`}>
        <strong>#{player.shirtNumber}</strong>
        <span>{player.primaryPosition} · 나</span>
      </div>
      <div className="player-position-3d-hud">
        <span>{progress < 0.45 ? "피치 위치 탐색" : progress < 0.82 ? "나의 위치 표시" : "포지션 확인 완료"}</span>
        <div className="player-position-progress"><i style={{ transform: `scaleX(${progress})` }} /></div>
      </div>
    </section>
  );
}
